import type { ReactNode } from 'react';
import { Callout as FumaCallout, type CalloutType } from 'fumadocs-ui/components/callout';
import { Terminal as TerminalIcon } from 'lucide-react';
import type { Messages } from '@/lib/messages';

export const WHERE = ['mac', 'vm', 'container', 'pod', 'linux'] as const;
export type Where = (typeof WHERE)[number];

const CALLOUT_KINDS = ['production', 'pitfall', 'ai', 'link', 'danger'] as const;
type CalloutKind = (typeof CALLOUT_KINDS)[number];

const CALLOUT_TYPE: Record<CalloutKind, CalloutType> = {
  production: 'info',
  pitfall: 'warning',
  ai: 'idea',
  link: 'success',
  danger: 'error',
};

/** Các khối nội dung dùng trong bài, gắn với chữ giao diện của ngôn ngữ đang xem. */
export function createBlockComponents(t: Messages) {
  /** Khối lệnh có nhãn nơi chạy (FR-LESSON-003). Bên trong là một code block. */
  function Terminal({ where, title, children }: { where: Where; title?: string; children?: ReactNode }) {
    return (
      <figure className="lesson-terminal not-prose-figure" data-where={where}>
        <figcaption>
          <TerminalIcon aria-hidden className="size-3.5" />
          <span className="lesson-terminal-where">{t.lesson.where[where]}</span>
          {title ? <span className="lesson-terminal-title">· {title}</span> : null}
        </figcaption>
        {children}
      </figure>
    );
  }

  /** Kết quả mong đợi của lệnh ngay phía trên. */
  function Expected({ children }: { children?: ReactNode }) {
    return (
      <div className="lesson-expected">
        <p className="lesson-expected-label">{t.lesson.expected}</p>
        {children}
      </div>
    );
  }

  /** Người học tự đoán trước rồi mới mở xem (FR-LESSON-004). Dùng `<details>`, không cần JavaScript. */
  function Predict({ question, children }: { question?: ReactNode; children?: ReactNode }) {
    return (
      <details className="lesson-predict">
        <summary>
          {question ? <span className="lesson-predict-question">{question}</span> : null}
          <span className="lesson-predict-hint">{t.lesson.predict}</span>
        </summary>
        <div className="lesson-details-body">{children}</div>
      </details>
    );
  }

  /** Lời giải ẩn cho câu hỏi đào sâu (FR-REVIEW-001). */
  function Reveal({ title, children }: { title: ReactNode; children?: ReactNode }) {
    return (
      <details className="lesson-reveal">
        <summary>
          <span>{title}</span>
          <span className="lesson-reveal-hint">{t.lesson.reveal}</span>
        </summary>
        <div className="lesson-details-body">{children}</div>
      </details>
    );
  }

  /** Callout chuẩn (FR-LESSON-005). */
  function Callout({ kind, title, children }: { kind: CalloutKind; title?: ReactNode; children?: ReactNode }) {
    return (
      <FumaCallout type={CALLOUT_TYPE[kind]} title={title ?? t.lesson.callout[kind]}>
        {children}
      </FumaCallout>
    );
  }

  return { Terminal, Expected, Predict, Reveal, Callout };
}
