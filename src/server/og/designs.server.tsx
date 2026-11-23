// Server-only: the share card, drawn by render.server.ts. This is a satori
// element tree, not a page component: styles are inline, layout is flexbox,
// and every element with more than one child needs `display: flex` (or
// block).
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "../../lib/share";

/** The site's dark theme: Tailwind's neutral-900 and neutral-100. */
const BACKGROUND = "#171717";
const FOREGROUND = "#f5f5f5";
const MUTED = "rgba(245, 245, 245, 0.7)";
const RULE = "#404040";

/** Open Graph's recommended size, shown at 1.91:1 by most sites. */
export const CARD_WIDTH = SHARE_IMAGE_WIDTH;
export const CARD_HEIGHT = SHARE_IMAGE_HEIGHT;

export interface ShareCardContent {
  /** The site's name, top left. */
  brand: string;
  /** The site's host, top right (e.g. dqc.dev). */
  host: string;
  /** The crumbs above the page, e.g. ["Thoughts"]. */
  section: string[];
  /** The page's own crumb, or the home page's heading. */
  title: string;
}

/** Big for a short title, smaller as it grows; it's cut at three lines. */
function titleSize(title: string) {
  if (title.length <= 24) return 104;
  if (title.length <= 48) return 84;
  return 68;
}

/** lucide's chevron-right, the breadcrumbs' separator. */
function Chevron() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={MUTED}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ShareCard({ brand, host, section, title }: ShareCardContent) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        // satori's default is content-box: the padding would widen the card.
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "Nudica",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 32,
          paddingBottom: 28,
          borderBottom: `1px solid ${RULE}`,
          fontSize: 30,
        }}
      >
        <div style={{ display: "block", textTransform: "uppercase" }}>
          {brand}
        </div>
        <div style={{ display: "block", color: MUTED }}>{host}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {section.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: MUTED,
              fontSize: 30,
              textTransform: "uppercase",
            }}
          >
            {section.map((crumb, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                {index > 0 && <Chevron />}
                <div style={{ display: "block" }}>{crumb}</div>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            display: "block",
            fontSize: titleSize(title),
            lineHeight: 1.05,
            textTransform: "uppercase",
            lineClamp: 3,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
