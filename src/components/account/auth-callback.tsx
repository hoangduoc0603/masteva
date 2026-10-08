'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useMessages } from '@/components/messages-provider';
import { getAccountState, initAccount, RETURN_PATH_KEY } from '@/lib/account/controller';
import { safeReturnPath } from '@/lib/account/return-path';

const subscribeNothing = () => () => {};

/** URL callback mang lỗi, hoặc không có mã để đổi lấy phiên. */
function callbackError(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('error') || window.location.hash.includes('error=') || !params.has('code');
}

/** Nhận kết quả OAuth: đổi mã lấy phiên, gộp tiến độ khách, rồi quay lại trang trước khi đăng nhập. */
export function AuthCallback({ lang }: { lang: string }) {
  const t = useMessages();
  // Lúc render tĩnh chưa biết URL nên coi là chưa lỗi.
  const urlFailed = useSyncExternalStore(subscribeNothing, callbackError, () => false);
  const [signInFailed, setSignInFailed] = useState(false);
  const failed = urlFailed || signInFailed;

  useEffect(() => {
    if (urlFailed) return;
    // Effect bị huỷ (StrictMode chạy hai lần ở dev, hoặc rời trang) thì không đọc hay xoá đường dẫn quay lại,
    // để lượt sau không chuyển về trang chủ đè lên lượt trước.
    let cancelled = false;
    void (async () => {
      await initAccount();
      if (cancelled) return;
      if (getAccountState().status !== 'signed-in') {
        setSignInFailed(true);
        return;
      }
      let target: string | null = null;
      try {
        target = sessionStorage.getItem(RETURN_PATH_KEY);
        sessionStorage.removeItem(RETURN_PATH_KEY);
      } catch {
        // Không đọc được thì về trang chủ.
      }
      window.location.replace(safeReturnPath(target, lang));
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, urlFailed]);

  return (
    <div className="hm-wrap">
      <h1 className="hm-title">{t.account.callbackTitle}</h1>
      {failed ? (
        <p role="alert">
          {t.account.callbackFailed} <a href={`/${lang}`}>{t.account.callbackBack}</a>
        </p>
      ) : (
        <p role="status">{t.account.callbackWorking}</p>
      )}
    </div>
  );
}
