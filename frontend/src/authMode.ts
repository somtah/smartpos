/**
 * โหมด kiosk: ไม่ต้อง login — API ไม่ส่ง JWT (backend ต้องมี DISABLE_AUTH=true)
 * ตั้ง VITE_DISABLE_AUTH=false หรือ 0 เพื่อบังคับใช้หน้า login + JWT
 */
export function isAuthBypass(): boolean {
  const raw = import.meta.env.VITE_DISABLE_AUTH;
  if (raw === 'false' || raw === '0') return false;
  return true;
}
