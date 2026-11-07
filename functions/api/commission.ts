export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const data = await request.json();

    const NOTION_TOKEN = env.NOTION_TOKEN;
    const DATABASE_ID = env.NOTION_DATABASE_ID;
    const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;

    // Check if configuration exists
    if (!NOTION_TOKEN || !DATABASE_ID || !DISCORD_WEBHOOK_URL) {
      console.error("SYS_ERR: Missing environment variables for Notion or Discord.");
      return new Response(JSON.stringify({ result: "error", message: "Server misconfiguration. Environment variables missing." }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Extract fields
    const clientName = data.nickname || "匿名";
    const contact = data.contact || "無聯絡方式";
    let type = data.commissionType || "未知類型";
    if (type === "驚喜包") {
      type = "活動";
    }
    const comment = data.additionalNotes || "無";
    const inquiryContent = data.otherQuestions || comment;

    const details = [
      data.wishlist ? "許願區: " + data.wishlist : "",
      data.otherQuestions ? "其他問題: " + data.otherQuestions : ""
    ].filter(Boolean).join("\n");

    const isAdult = data.isAdult || "未填";
    const clientHistory = data.clientHistory || "未填";
    const preferenceMode = data.preferenceMode || "無";
    const settingLink = data.referenceLink || "無";
    const paro = data.acceptAu || "無";
    const wordCount = data.wordCount || "無";
    const responseFrequency = data.responseFrequency || "無";

    const promoCode = data.promoCode ? data.promoCode.trim() : "";

    // Branch logic: Inquiry vs Official Commission
    if (type.includes("詢問") || type.includes("問題回報")) {
      // Inquiry -> Discord only
      await sendDiscordInquiry(DISCORD_WEBHOOK_URL, clientName, type, contact, inquiryContent, isAdult, promoCode); 
    } else {
      // Commission -> Notion + Discord
      await createNotionPage(
        NOTION_TOKEN,
        DATABASE_ID,
        clientName, 
        contact, 
        type, 
        isAdult,
        preferenceMode, 
        settingLink, 
        paro, 
        wordCount, 
        details, 
        comment,
        responseFrequency,
        clientHistory,
        promoCode
      );
      await sendDiscordCommission(DISCORD_WEBHOOK_URL, clientName, type, contact, isAdult, responseFrequency, clientHistory, promoCode);
    }

    return new Response(JSON.stringify({ result: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
      
  } catch (error) {
    console.error("Commission API Error:", error);
    return new Response(JSON.stringify({ result: "error", message: error.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ==========================================
//   Helper Functions (Notion & Discord)
// ==========================================

async function createNotionPage(token, dbId, clientName, contact, type, isAdult, preferenceMode, settingLink, paro, wordCount, details, comment, responseFrequency, clientHistory, promoCode) {
  const contentText = 
    "委託人帳號：" + contact + "\n" +
    "委託人稱呼：" + clientName + "\n" +
    "委託經歷：" + clientHistory + "\n" +
    "是否成年：" + isAdult + "\n" +
    "優惠碼：" + (promoCode || "無") + "\n" +
    "委託形式：" + type + "\n" +
    "偏好模式：" + preferenceMode + "\n" +
    "回覆頻率：" + responseFrequency + "\n" +
    "設定連結：" + settingLink + "\n" +
    "--------------------------------\n" + 
    "詳細需求：\n" + details + "\n" +
    "希望篇幅：" + wordCount + "\n" + 
    "Paro/AU：" + paro + "\n" + 
    "--------------------------------\n" + 
    "想說的話：" + comment;
  const autoTags = [{ name: "委託" }];
  if (clientHistory === "初次委託" || clientHistory === "是") {
    autoTags.push({ name: "初次" });
  }
  const notionPayload = {
    "parent": { "database_id": dbId },
    "properties": {
      "委託標題": { "title": [ { "text": { "content": "新委託 - " + clientName } } ] },
      "委託人": { "rich_text": [ { "text": { "content": clientName } } ] },
      "狀態": { "status": { "name": "洽談中" } },
      "Tag": { "multi_select": autoTags }
    },
    "children": [
      { "object": "block", "type": "heading_2", "heading_2": { "rich_text": [{ "text": { "content": "基本資訊" } }] } },
      { "object": "block", "type": "callout", "callout": { "icon": { "emoji": "💡" }, "color": "gray_background", "rich_text": [ { "text": { "content": contentText } } ] } },
      { "object": "block", "type": "heading_3", "heading_3": { "rich_text": [{ "text": { "content": "成品連結" } }] } },
      { "object": "block", "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "text": { "content": "完整版：" } }] } },
      { "object": "block", "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "text": { "content": "打碼版：" } }] } },
      { "object": "block", "type": "heading_3", "heading_3": { "rich_text": [{ "text": { "content": "計價資訊" } }] } },
      { "object": "block", "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "text": { "content": "字數：" } }] } },
      { "object": "block", "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [{ "text": { "content": "總價：" } }] } },
      { "object": "block", "type": "divider", "divider": {} },
      { "object": "block", "type": "heading_2", "heading_2": { "rich_text": [{ "text": { "content": "參考資料" } }] } }
    ]
  };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify(notionPayload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Notion API Error: ${response.status} - ${errorData}`);
  }
}

async function sendDiscordCommission(webhookUrl, name, type, contact, isAdult, responseFrequency, clientHistory, promoCode) {
  const adultStatus = isAdult === "否" ? "🔴 否 (未成年)" : "🟢 是 (已成年)";
  const historyStatus = (clientHistory === "初次委託" || clientHistory === "是") ? "🆕 初次委託" : "🔄 曾委託過";
  const promoLine = promoCode ? `\n🎟️ **優惠碼**：\`${promoCode}\`` : "";
  const message = "✨ **網站有新委託進來囉！**\n\n" + 
                  "👤 **委託人**：" + name + "\n" +
                  "📝 **類型**：" + type + "\n" +
                  "🏷️ **委託經歷**：" + historyStatus + "\n" +
                  "🔞 **是否成年**：" + adultStatus + "\n" +
                  "⏱️ **回覆頻率**：" + responseFrequency + "\n" +
                  "📬 **聯絡**：" + contact + promoLine + "\n\n" +
                  "已自動寫入 Notion，請查收！";
  await pushDiscordMessage(webhookUrl, message);
}

async function sendDiscordInquiry(webhookUrl, name, type, contact, comment, isAdult, promoCode) {
  const adultStatus = isAdult === "否" ? "🔴 否 (未成年)" : "🟢 是 (已成年)";
  const promoLine = promoCode ? `\n🎟️ **優惠碼**：\`${promoCode}\`` : "";
  const message = "❓ **網站有人來詢問問題囉！**\n" + 
                  "*(此訊息未寫入 Notion)*\n\n" +
                  "👤 **詢問人**：" + name + "\n" +
                  "🔞 **是否成年**：" + adultStatus + "\n" +
                  "📬 **聯絡**：" + contact + promoLine + "\n" +
                  "💬 **內容**：\n" + comment + "\n\n" +
                  "請記得直接回覆對方喔！";
  await pushDiscordMessage(webhookUrl, message);
}

async function pushDiscordMessage(webhookUrl, msgText) {
  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    console.error("Discord Webhook URL 未設定或格式錯誤");
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: msgText })
    });
    
    if (!response.ok) {
      console.error("Discord 發送失敗:", await response.text());
    }
  } catch (e) {
    console.error("Discord 發送網路錯誤:", e);
  }
}
