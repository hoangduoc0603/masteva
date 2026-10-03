import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, i18n } from '@/lib/i18n';

/**
 * Trang `/`. Static export không có middleware, nên chuyển hướng ngay trên trình duyệt
 * (architecture §6): dùng ngôn ngữ đã lưu nếu có, nếu không thì sang ngôn ngữ mặc định.
 * Thẻ meta refresh là đường dự phòng khi JavaScript bị tắt.
 */
export default function RootRedirectPage() {
  const fallback = `/${DEFAULT_LANGUAGE}`;
  const script = `(function(){var l=${JSON.stringify(i18n.languages)},d=${JSON.stringify(fallback)},s=null;try{s=localStorage.getItem(${JSON.stringify(
    LANGUAGE_STORAGE_KEY,
  )})}catch(e){}location.replace(s&&l.indexOf(s)>=0?"/"+s:d)})();`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <meta httpEquiv="refresh" content={`1; url=${fallback}`} />
      <p>
        <a href={fallback}>Masteva</a>
      </p>
    </>
  );
}
