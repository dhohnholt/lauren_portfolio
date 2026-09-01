import "jsr:@supabase/functions-js@2.112.4/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1.5.1";

const recipientEmail = "laurenhohnholt@gmail.com";
const defaultFromEmail = "Lauren Hohnholt Portfolio <contact@laurenhohnholt.com>";
const emailPattern = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

const notifyContact = {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (request, context) => {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    let payload: ContactPayload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name = cleanText(payload.name);
    const email = cleanText(payload.email).toLowerCase();
    const message = cleanText(payload.message);
    const company = cleanText(payload.company);

    // Silently accept bot submissions caught by the hidden field.
    if (company) return Response.json({ success: true });

    if (name.length < 1 || name.length > 100 || !emailPattern.test(email) || email.length > 254 || message.length < 10 || message.length > 3000) {
      return Response.json({ error: "Please check the contact form fields." }, { status: 400 });
    }

    const { data, error: insertError } = await context.supabaseAdmin
      .from("contact_messages" as never)
      .insert({ name, email, message } as never)
      .select("id, created_at")
      .single();
    const savedMessage = data as { id: number; created_at: string } | null;

    if (insertError || !savedMessage) {
      console.error("Unable to save contact message", insertError);
      return Response.json({ error: "Unable to save the message." }, { status: 500 });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return Response.json({ success: true, notificationSent: false });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const submittedAt = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Denver",
    }).format(new Date(savedMessage.created_at));

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `portfolio-contact-${savedMessage.id}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("CONTACT_FROM_EMAIL") ?? defaultFromEmail,
        to: [recipientEmail],
        reply_to: email,
        subject: `New portfolio message from ${name.replace(/[\r\n]/g, " ")}`,
        text: `New portfolio contact message\n\nFrom: ${name}\nEmail: ${email}\nSubmitted: ${submittedAt}\n\n${message}\n\nReply directly to this email to respond to ${name}.`,
        html: `<!doctype html>
<html>
  <body style="margin:0;background:#f3efe8;color:#260e18;font-family:Arial,sans-serif;padding:32px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fffdf9;border-collapse:collapse;">
      <tr><td style="height:8px;background:#6a713e;"></td></tr>
      <tr><td style="padding:36px 40px 18px;">
        <p style="margin:0 0 10px;color:#6a713e;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Lauren Hohnholt Portfolio</p>
        <h1 style="margin:0;color:#47122f;font-family:Georgia,serif;font-size:30px;line-height:1.2;">A new opportunity is waiting.</h1>
      </td></tr>
      <tr><td style="padding:0 40px 28px;">
        <p style="margin:0 0 24px;color:#5b5054;font-size:14px;line-height:1.6;">${safeName} sent a message through laurenhohnholt.com.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3efe8;border-left:4px solid #9c0f68;"><tr><td style="padding:22px 24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6a713e;">From</p>
          <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#260e18;">${safeName}</p>
          <p style="margin:0;"><a href="mailto:${safeEmail}" style="color:#9c0f68;">${safeEmail}</a></p>
        </td></tr></table>
        <div style="padding:28px 0 8px;font-size:16px;line-height:1.7;color:#260e18;">${safeMessage}</div>
        <a href="mailto:${safeEmail}" style="display:inline-block;margin-top:18px;background:#47122f;color:#fff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 20px;">Reply to ${safeName}</a>
      </td></tr>
      <tr><td style="padding:18px 40px;background:#260e18;color:#d8d2c8;font-size:12px;line-height:1.5;">Received ${submittedAt}. This message is also saved in your private portfolio admin inbox.</td></tr>
    </table>
  </body>
</html>`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Resend notification failed", emailResponse.status, await emailResponse.text());
      return Response.json({ success: true, notificationSent: false });
    }

    return Response.json({ success: true, notificationSent: true });
  }),
};

export default notifyContact;
