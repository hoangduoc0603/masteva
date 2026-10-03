import type { ReactNode } from 'react';
import type { Messages } from '@/lib/messages';

export const WHERE = ['mac', 'vm', 'container', 'pod', 'linux'] as const;
export type Where = (typeof WHERE)[number];

const CALLOUT_KINDS = ['production', 'pitfall', 'ai', 'link', 'danger'] as const;
type CalloutKind = (typeof CALLOUT_KINDS)[number];

/**
 * Các khối nội dung dùng trong bài, gắn với chữ giao diện của ngôn ngữ đang xem.
 * Giao diện theo design/components.css (Night Lab), CSS ở src/app/lesson.css.
 * Mọi khối là server component; chỉ nút sao chép của code block (Fumadocs) chạy trên trình duyệt.
 */
export function createBlockComponents(t: Messages) {
  /**
   * Khối lệnh có nhãn nơi chạy (FR-LESSON-003). Bên trong là một code block của Fumadocs;
   * CSS đưa nút sao chép của nó lên thanh tiêu đề và thêm dấu nhắc `$` (không bị chép).
   */
  function Terminal({ where, title, children }: { where: Where; title?: string; children?: ReactNode }) {
    return (
      <figure className="ms-term" data-where={where}>
        <figcaption className="ms-term-head">
          <span className="ms-term-glyph" data-where={where} aria-hidden="true" />
          <span className="ms-term-env">{t.lesson.where[where]}</span>
          {title ? <span className="ms-term-title">{title}</span> : null}
        </figcaption>
        {children}
      </figure>
    );
  }

  /** Kết quả mong đợi của lệnh ngay phía trên. Không có nút sao chép. */
  function Expected({ children }: { children?: ReactNode }) {
    return (
      <div className="ms-exp-block">
        <p className="ms-exp-label">{t.lesson.expected}</p>
        {children}
      </div>
    );
  }

  /**
   * Người học tự đoán trước rồi mới mở đáp án (FR-LESSON-004).
   * Ô ghi dự đoán không lưu đi đâu; đáp án là `<details>`, không cần JavaScript.
   */
  function Predict({ question, children }: { question?: ReactNode; children?: ReactNode }) {
    const label = t.lesson.predictLabel;
    return (
      <div className="ms-predict">
        {label ? <span className="ms-mlabel">{label}</span> : null}
        {question ? <p className="ms-predict-q">{question}</p> : null}
        <label className="ms-guess-l">
          <span>{t.lesson.predictGuess}</span>
          <input className="ms-guess" type="text" autoComplete="off" spellCheck={false} />
        </label>
        <details className="ms-ans">
          <summary>
            <span className="ms-chev" aria-hidden="true" />
            <span>{t.lesson.predictAnswer}</span>
          </summary>
          <div className="ms-ans-body">{children}</div>
        </details>
      </div>
    );
  }

  /** Lời giải ẩn cho câu hỏi đào sâu (FR-REVIEW-001). */
  function Reveal({ title, children }: { title: ReactNode; children?: ReactNode }) {
    return (
      <details className="ms-reveal">
        <summary>
          <span className="ms-chev" aria-hidden="true" />
          <span>{title}</span>
        </summary>
        <div className="ms-reveal-body">{children}</div>
      </details>
    );
  }

  /** Callout chuẩn (FR-LESSON-005): nhãn có chấm màu ở trên, nền nhạt theo loại. */
  function Callout({ kind, title, children }: { kind: CalloutKind; title?: ReactNode; children?: ReactNode }) {
    return (
      <div className="ms-callout" data-kind={kind} role="note">
        <p className="ms-mlabel">{title ?? t.lesson.callout[kind]}</p>
        <div className="ms-callout-body">{children}</div>
      </div>
    );
  }

  return { Terminal, Expected, Predict, Reveal, Callout };
}
