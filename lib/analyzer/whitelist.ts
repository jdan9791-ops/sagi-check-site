/** Official financial institution domains — immediately classified as safe (risk score 5). */
export const OFFICIAL_DOMAINS = [
  // 국내 코인/암호화폐 거래소
  "upbit.com",
  "bithumb.com",
  "coinone.co.kr",
  "korbit.co.kr",
  "gopax.co.kr",
  // 글로벌 코인/암호화폐 거래소
  "binance.com",
  "coinbase.com",
  "kraken.com",
  "okx.com",
  "bybit.com",
  "bitget.com",
  "kucoin.com",
  "gate.io",
  "mexc.com",
  "bitmex.com",
  "crypto.com",
  "gemini.com",
  "bitstamp.net",
  // 시중은행
  "kbstar.com",
  "shinhan.com",
  "wooribank.com",
  "hanabank.com",
  "ibk.co.kr",
  "bnk.co.kr",
  "dgb.co.kr",
  "jbbank.co.kr",
  "kjbank.com",
  "nfcf.or.kr",
  "nhbank.com",
  "nonghyup.com",
  "suhyup-bank.com",
  "kfcc.co.kr",
  "cu.co.kr",
  // 인터넷은행
  "kakaobank.com",
  "tossbank.com",
  "banksalad.com",
  "kbank.co.kr",
  // 카드사
  "shinhancard.com",
  "kbcard.com",
  "lottecard.co.kr",
  "hanacard.co.kr",
  "samsungcard.com",
  "hyundaicard.com",
  "bccard.com",
  "wooricard.com",
  "citi.co.kr",
  "ibkcard.com",
  // 증권사
  "samsungpop.com",
  "kiwoom.com",
  "nhqv.com",
  "miraeasset.com",
  "hanwhainvestment.com",
  "hi-invest.co.kr",
  "daishin.com",
  "ebest.co.kr",
  "yuantasecurities.co.kr",
  "kb-securities.com",
  "shinyoungsec.com",
  "toss.im",
  "kakaopay.com",
  // 보험사
  "samsung.com",
  "hanwha.com",
  "lotte.com",
  "hyundai.com",
  "kb-insurance.com",
  "meritzfire.com",
  "db-fi.com",
  "dongbuinsur.com",
  // 정부/감독기관
  "fss.or.kr",
  "kcmi.re.kr",
  "krx.co.kr",
  "koscom.co.kr",
  "kdic.or.kr",
  "kofia.or.kr",
];

/** Normalize domain: strip www., lowercase */
function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./i, "").toLowerCase();
}

/** Check if a URL's domain is in the official whitelist. */
export function isWhitelisted(urlOrDomain: string): boolean {
  try {
    let domain: string;
    if (urlOrDomain.startsWith("http")) {
      domain = new URL(urlOrDomain).hostname;
    } else {
      domain = urlOrDomain;
    }
    const normalized = normalizeDomain(domain);
    return OFFICIAL_DOMAINS.some(
      (d) => normalized === d || normalized.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}
