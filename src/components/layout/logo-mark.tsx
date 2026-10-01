/** The Cell mark: a hexagonal C with two rising bars. Inline so it takes the theme's lime. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M84.6 30 L50 10 L15.4 30 L15.4 70 L50 90 L84.6 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <path d="M84.6 30 L69 21" fill="none" stroke="var(--border-strong)" strokeWidth="11" />
      <path d="M84.6 70 L69 79" fill="none" stroke="var(--border-strong)" strokeWidth="11" />
      <polygon points="32,38.5 40.5,36.5 40.5,63.5 32,61.5" fill="currentColor" />
      <polygon points="44,32.5 55,29 55,71 44,67.5" fill="currentColor" />
    </svg>
  );
}
