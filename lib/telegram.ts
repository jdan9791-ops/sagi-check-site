/**
 * Send a Telegram alert to the admin.
 */
export async function sendAlert(
  url: string,
  riskScore: number,
  summary: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const emoji = riskScore >= 70 ? "🚨" : "⚠️";
  const message = [
    `${emoji} *사기 위험 사이트 탐지*`,
    `URL: \`${url}\``,
    `위험 지수: *${riskScore}점*`,
    `요약: ${summary}`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch {
    // Non-critical: swallow errors
  }
}

/** Alert when a single IP makes too many requests per minute. */
export async function sendAbuseAlert(ip: string, count: number): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const message = `⚠️ *어뷰징 의심 감지*\nIP: \`${ip}\`\n분당 요청 수: *${count}회*`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch {
    // Non-critical
  }
}
