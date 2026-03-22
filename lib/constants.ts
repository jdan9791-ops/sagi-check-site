/** Risk score thresholds */
export const RISK_HIGH = 70;
export const RISK_LOW = 30;

/** Max HTML content length to send to Gemini */
export const MAX_HTML_LENGTH = 3000;

/** Crawler timeout in ms */
export const CRAWLER_TIMEOUT_MS = 5000;

/** Government API timeout in ms */
export const GOVT_API_TIMEOUT_MS = 10000;

/** Cache TTL in hours (7 days) */
export const CACHE_TTL_HOURS = 168;

/** Rate limiting */
export const RATE_LIMIT_PER_MINUTE = 10;
export const RATE_LIMIT_PER_DAY = 100;
export const CAPTCHA_THRESHOLD = 21;
export const BLOCK_THRESHOLD = 100;

/** Finance keywords for site classification (1st pass) */
export const FINANCE_KEYWORDS = [
  "투자",
  "리딩",
  "코인",
  "crypto",
  "stock",
  "주식",
  "선물",
  "옵션",
  "fx",
  "forex",
  "비트코인",
  "이더리움",
  "가상화폐",
  "암호화폐",
  "수익률",
  "고수익",
  "배당",
  "펀드",
  "자산운용",
  "증권",
  "파생상품",
  "레버리지",
  "마진",
  "단타",
  "원금보장",
  "이자",
  "대출",
  "p2p",
  "크라우드펀딩",
];

/** Shopping keywords for site classification */
export const SHOPPING_KEYWORDS = [
  "쇼핑",
  "구매",
  "주문",
  "배송",
  "장바구니",
  "결제",
  "쿠폰",
  "할인",
  "세일",
  "마켓",
  "shop",
  "store",
  "buy",
  "cart",
  "checkout",
  "order",
  "delivery",
  "상품",
  "제품",
  "판매",
];

/** Internal IP ranges for SSRF defense */
export const BLOCKED_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^localhost$/i,
  /^0\./,
  /^169\.254\./,
];
