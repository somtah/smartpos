/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** false | 0 = บังคับ login + JWT — ค่าอื่นหรือไม่ตั้ง = ข้าม login (คู่ backend DISABLE_AUTH) */
  readonly VITE_DISABLE_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
