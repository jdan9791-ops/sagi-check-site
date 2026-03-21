/**
 * Verify hCaptcha token on the server side.
 */
export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) return false;

  try {
    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = (await response.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
