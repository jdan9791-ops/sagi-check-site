function buildPayload(chatId: string, text: string) {
  const threadId = process.env.TELEGRAM_THREAD_ID;
  return {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...(threadId ? { message_thread_id: Number(threadId) } : {}),
  };
}

async function sendMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(chatId, message)),
    });
  } catch {
    // Non-critical
  }
}

/** Alert when an internal error occurs during analysis. */
export async function sendErrorAlert(context: string, error: unknown): Promise<void> {
  const message = [
    `🔴 *시스템 오류 발생*`,
    `위치: \`${context}\``,
    `오류: ${error instanceof Error ? error.message : String(error)}`,
  ].join("\n");
  await sendMessage(message);
}

/** Alert when a single IP makes too many requests per minute. */
export async function sendAbuseAlert(ip: string, count: number): Promise<void> {
  const message = [
    `🚫 *악의적 접근 감지*`,
    `IP: \`${ip}\``,
    `분당 요청 수: *${count}회* (기준: 5회 이상)`,
    `⛔ 해당 IP는 10회 초과 시 자동 차단됩니다.`,
  ].join("\n");
  await sendMessage(message);
}
