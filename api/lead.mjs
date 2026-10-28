// Vercel serverless function: POST /api/lead
// Forwards a booking-form submission to a Telegram group.
// Needs two environment variables (set them in Vercel → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN – token from @BotFather
//   TELEGRAM_CHAT_ID   – id of the group the bot was added to (starts with -100…)

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  // Hidden field real visitors never fill in; bots usually do
  if (body.website) return res.status(200).json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 30);
  const problem = clean(body.problem, 80);
  const lang = clean(body.lang, 2).toUpperCase();
  if (name.length < 2 || phone.replace(/\D/g, "").length < 9) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set");
    return res.status(500).json({ ok: false, error: "not_configured" });
  }

  const time = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "short", timeStyle: "short" });
  const digits = phone.replace(/[^\d+]/g, "");
  const text = [
    "🆕 <b>Yangi ariza — vertebroclinic.uz</b>",
    "",
    `👤 <b>Ism:</b> ${esc(name)}`,
    `📞 <b>Telefon:</b> <a href="tel:${esc(digits)}">${esc(phone)}</a>`,
    problem ? `🩺 <b>Muammo:</b> ${esc(problem)}` : null,
    lang ? `🌐 <b>Til:</b> ${esc(lang)}` : null,
    `🕒 ${time}`,
  ].filter((line) => line !== null).join("\n");

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const data = await tg.json();
    if (!data.ok) {
      console.error("Telegram error", data);
      return res.status(502).json({ ok: false, error: "telegram" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Telegram request failed", err);
    return res.status(502).json({ ok: false, error: "telegram" });
  }
}
