/** Biểu tượng nét dùng chung (cùng bộ với bản mẫu `design/*-v2.html`). Luôn đi kèm chữ hoặc `aria-label` ở phần tử cha. */
const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  back: <path d="m15 18-6-6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  map: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="6" cy="19" r="2" />
      <path d="M8 5h4a4 4 0 0 1 4 4v1M16 14v1a4 4 0 0 1-4 4H8" />
    </>
  ),
  list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  sliders: (
    <>
      <path d="M4 6h10M18 6h2M4 18h4M12 18h8" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="18" r="2" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="ms-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
