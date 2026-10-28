// Minimal static server for local preview: node serve.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  // Run the Vercel function locally (set TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID to really send)
  if (path === "/api/lead") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const { default: handler } = await import("./api/lead.mjs");
    res.status = (code) => ((res.statusCode = code), res);
    res.json = (obj) => res.setHeader("Content-Type", "application/json").end(JSON.stringify(obj));
    req.body = raw;
    return handler(req, res).catch(() => res.status(400).json({ ok: false }));
  }
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(process.env.PORT || 5173, () => console.log("http://localhost:" + (process.env.PORT || 5173)));
