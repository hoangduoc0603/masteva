/**
 * Đường dẫn quay lại sau khi đăng nhập: chỉ nhận đường dẫn trong site, không quay lại chính trang callback.
 * Giá trị đến từ sessionStorage nên vẫn coi là dữ liệu không tin cậy.
 */
export function safeReturnPath(raw: string | null, lang: string): string {
  const home = `/${lang}`;
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return home;
  if (raw.split(/[?#]/)[0].endsWith('/auth/callback')) return home;
  return raw;
}
