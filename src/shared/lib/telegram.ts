import "server-only";
import { env } from "@/env";

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Sends a message to the admin chat: plain text by default, or HTML with `html: true`.
export async function sendTelegramMessage(text: string, { html = false } = {}): Promise<void> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env;
  if (!token || !chatId) throw new Error("Telegram is not configured: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(html ? { parse_mode: "HTML" } : {}),
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status} ${await response.text()}`);
  }
}
