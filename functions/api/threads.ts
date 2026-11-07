export async function onRequest(context) {
  try {
    const env = context.env;
    const kv = env.THREADS_KV; // Cloudflare KV Namespace Binding (綁定名稱: THREADS_KV)

    // 1. 優先從 KV 讀取 Token 與上次續期時間戳記，若無則從環境變數讀取
    let token = kv ? await kv.get("THREADS_ACCESS_TOKEN") : null;
    let lastRefreshStr = kv ? await kv.get("THREADS_LAST_REFRESH") : null;
    
    if (!token) {
      token = env.THREADS_ACCESS_TOKEN;
    }

    if (!token || token === "在這裡貼上你的_TOKEN") {
      return new Response(JSON.stringify({ 
        error: "Missing API Token",
        message: "Threads API Token is not configured."
      }), { status: 500 });
    }

    // 2. 自動續期機制：如果綁定了 KV，且距離上次續期已超過 14 天（或尚未記錄時間）
    const now = Date.now();
    const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr, 10) : 0;
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

    if (kv && (now - lastRefresh > FOURTEEN_DAYS_MS)) {
      try {
        console.log("Attempting to auto-refresh Threads access token...");
        const refreshUrl = `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${token}`;
        const refreshRes = await fetch(refreshUrl);
        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.access_token) {
          token = refreshData.access_token;
          await kv.put("THREADS_ACCESS_TOKEN", token);
          await kv.put("THREADS_LAST_REFRESH", now.toString());
          console.log("Threads Access Token successfully auto-refreshed and saved to KV!");
        } else {
          console.warn("Failed to auto-refresh Threads token:", refreshData);
          // 若續期失敗且設定了 Discord Webhook，發送警報通知
          if (env.DISCORD_WEBHOOK_URL) {
            await fetch(env.DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `⚠️ **[adabanipal-library] Threads Token 自動續期失敗通知**\n錯誤資訊: ${JSON.stringify(refreshData)}\n請檢查 Threads Token 狀態。`
              })
            }).catch(() => {});
          }
        }
      } catch (refErr) {
        console.error("Error refreshing token:", refErr);
      }
    }

    // 3. 使用有效的 Token 呼叫 Threads API
    const apiUrl = `https://graph.threads.net/me/threads?fields=id,text,timestamp,media_type,permalink,username,media_url&access_token=${token}&limit=10`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("Threads API Error:", data);
      return new Response(JSON.stringify({ 
        error: "Threads API Error",
        details: data
      }), { status: response.status });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // 快取回應 5 分鐘，避免頻繁觸發 Rate Limit
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      }
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      message: error.message
    }), { status: 500 });
  }
}

