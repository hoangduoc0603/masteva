'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useMessages } from '@/components/messages-provider';
import { format } from '@/lib/format';
import { deleteAccount, initAccount, signIn, signOut, useAccount } from '@/lib/account/controller';

/** Nút Đăng nhập hoặc menu tài khoản trên header (spec 2026-10-07 §6). */
export function AccountMenu({ lang }: { lang: string }) {
  const t = useMessages();
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void initAccount();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (account.status === 'disabled') return null;
  // Giữ chỗ để header không xô khi trạng thái tới.
  if (account.status === 'loading') return <span className="am-slot" aria-hidden="true" />;

  if (account.status === 'guest') {
    return (
      <div className="am">
        <button
          type="button"
          className="am-btn"
          title={t.account.signInTitle}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await signIn(lang);
            } catch {
              setError(t.account.signInFailed);
              setBusy(false);
            }
          }}
        >
          {t.account.signIn}
        </button>
        {error ? <span role="alert" className="am-error">{error}</span> : null}
      </div>
    );
  }

  const syncText = account.sync === 'error' ? t.account.syncError : account.sync === 'syncing' ? t.account.syncing : t.account.synced;

  async function onSignOut() {
    setBusy(true);
    let result = await signOut();
    if (result === 'unsynced' && window.confirm(t.account.unsyncedConfirm)) result = await signOut({ force: true });
    setBusy(false);
    if (result === 'done') setOpen(false);
  }

  async function onDelete() {
    if (!window.confirm(t.account.deleteConfirm)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      setOpen(false);
    } catch {
      setError(t.account.deleteFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="am" ref={rootRef}>
      <button
        type="button"
        className="am-btn am-avatar"
        aria-label={format(t.account.menu, { email: account.email })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <UserRound aria-hidden="true" size={18} />
        {account.sync === 'error' ? <span className="am-dot" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div id={panelId} className="am-panel">
          <p className="am-email">{account.email}</p>
          <p className="am-sync" role="status">{syncText}</p>
          <button type="button" className="am-item" disabled={busy} onClick={onSignOut}>
            {t.account.signOut}
          </button>
          <a className="am-item" href={`/${lang}/privacy`}>
            {t.account.privacy}
          </a>
          <button type="button" className="am-item am-danger" disabled={busy} onClick={onDelete}>
            {t.account.deleteAccount}
          </button>
          {error ? <p role="alert" className="am-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
