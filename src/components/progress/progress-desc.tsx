'use client';
import { useMessages } from '@/components/messages-provider';
import { useAccount } from '@/lib/account/controller';

/** Câu mô tả nơi lưu tiến độ, đổi theo trạng thái đăng nhập. */
export function ProgressDesc() {
  const t = useMessages();
  const account = useAccount();
  const text =
    account.status === 'signed-in' ? t.progress.descSignedIn : account.status === 'disabled' ? t.progress.desc : t.progress.descGuest;
  return <p className="rm-xfer-d">{text}</p>;
}
