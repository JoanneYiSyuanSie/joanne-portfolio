export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { email, name, isAdult, source } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ result: "error", message: "Missing Email address." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Send subscription request to Brevo Form Action
    const BREVO_FORM_ACTION = "https://aa713cf2.sibforms.com/serve/MUIFAFXTIrsKOIeKK7jOqwucDvkUyLwQRT6Nvd3ZCHTfmby0MQA0AlAzyRhGWTYfy8G7XBz_GNlDY2SlxNoSBjuYcLuK6Iwkhz-UaQEPqyumtSWbNZQ35_6ShqB8GN6l3dQHJEVFFtvV9k66kODR0UzXyptWCKHoEX-Oyb5pmkL_pImD6NAbyYgcHHWxMehPDKfsWrehlXFn5k-xlw==";

    const formData = new URLSearchParams();
    formData.append("EMAIL", email);
    formData.append("FIRSTNAME", name || "");
    formData.append("IS_ADULT", isAdult ? "1" : "0");
    formData.append("SOURCE", source || "website");
    formData.append("email_address_check", ""); // Honeypot (empty)
    formData.append("locale", "en");

    const brevoResponse = await fetch(BREVO_FORM_ACTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    if (!brevoResponse.ok) {
      const errorMsg = await brevoResponse.text();
      console.error("Brevo API Error:", errorMsg);
      throw new Error("Failed to subscribe via Brevo");
    }

    return new Response(JSON.stringify({ result: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return new Response(JSON.stringify({ result: "error", message: error.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
