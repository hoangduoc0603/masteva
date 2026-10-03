/**
 * Thay `{tên}` trong chuỗi bằng giá trị tương ứng.
 * Tách khỏi `messages.ts` để component phía trình duyệt không kéo theo cả hai file ngôn ngữ.
 */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(vars, key) ? String(vars[key]) : match));
}
