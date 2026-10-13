/**
 * The editor's loading splash, drawn on this side while the editor is being
 * opened, so the merchant sees one animation from the click to a ready editor
 * instead of this page's spinner followed by the editor's own splash.
 *
 * A copy of `#mel-splash` in mel-editor's `index.html` — the two apps share no
 * package. The colours are the editor's grounds rather than this app's: it
 * sits where the editor's frame is about to appear and has to meet it.
 *
 * The ring is an image rather than inline SVG because inline SMIL only starts
 * its clock at the document's load event.
 */
const RING_ANIMATED =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cdefs%3E%3ClinearGradient id='g' gradientUnits='userSpaceOnUse' x1='-180' y1='-7.3' x2='200.8' y2='8.3'%3E%3Cstop offset='0.013' stop-color='%23b555fe'/%3E%3Cstop offset='0.176' stop-color='%237a27f6'/%3E%3Cstop offset='0.517' stop-color='%232f5bf5'/%3E%3Cstop offset='0.849' stop-color='%2312b4ff'/%3E%3Cstop offset='0.988' stop-color='%2333c5ff'/%3E%3C/linearGradient%3E%3Cmask id='m' maskUnits='userSpaceOnUse' x='0' y='0' width='500' height='500'%3E%3Cpath transform='translate(250 250) rotate(82)' fill='none' stroke='%23fff' stroke-width='80' stroke-miterlimit='4' d='M123.7 -123.7C158.4 -89.1 175.5 -43.4 175 2C174.5 46.1 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -174.5 46.1 -175 2C-175.5 -43.5 -158.4 -89.1 -123.7 -123.7C-89.3 -158.2 -44.1 -175.3 1 -175C45.5 -174.7 89.8 -157.7 123.7 -123.7Z'%3E%3Canimate attributeName='d' dur='4s' repeatCount='indefinite' calcMode='spline' keyTimes='0;0.0417;0.075;0.1;0.1333;0.1583;0.1833;0.2167;0.25;0.2583;0.2833;0.3167;0.3417;0.375;0.4;0.425;0.4583;0.5;1' keySplines='0.333 0 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.667 1;0.167 0.167 0.833 0.833;0.333 0 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.667 1;0 0 1 1' values='M123.7 -123.7C158.4 -89.1 175.5 -43.4 175 2C174.5 46.1 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -174.5 46.1 -175 2C-175.5 -43.5 -158.4 -89.1 -123.7 -123.7C-89.3 -158.2 -44.1 -175.3 1 -175C45.5 -174.7 89.8 -157.7 123.7 -123.7Z;M104.7 -123.7C134 -89.1 164 -52 167.5 2C170.4 46 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -168.9 46.1 -167.5 2C-166 -45 -144 -85 -104.7 -123.7C-72.5 -155.4 -37.3 -175.3 0.8 -175C38.4 -174.7 76 -157.7 104.7 -123.7Z;M45.7 -121.5C70.7 -92.3 111 -53.4 136.5 2C154 40 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -156 45 -135.9 2C-116.5 -39.3 -82 -81 -44.6 -124C-14.3 -158.9 -19 -175 0.8 -175C16 -175 14.3 -158 45.7 -121.5Z;M-39.1 -121.5C-36 -66 0 -43 72.6 2C115.6 28.6 131 84 106.1 123.7C82.3 161.9 44.8 175 0 175C-44.8 175 -81.6 161.5 -106.1 123.7C-132 84 -119 30 -73.2 2C-36.9 -20.2 42 -47 46.4 -124C47.7 -146.7 21 -174 0.8 -175C-14.3 -175.7 -40.3 -143.7 -39.1 -121.5Z;M-102 -121.5C-124.1 -72.3 -86 -39 -33.2 2C15.5 39.9 50 69 49.4 123.7C49.1 151 23.7 175 0 175C-23.8 175 -47 155 -49.9 123.7C-53.7 82.4 -11 35 32.6 2C76.2 -31 132 -78 105.2 -124C84.3 -159.8 53 -176 0.8 -175C-55.1 -173.9 -86 -157 -102 -121.5Z;M-120 -122C-151 -85 -145 -30 -113.2 2C-69.1 46.6 -24.3 74.6 0.4 123.5C13.5 149.5 12.1 174.3 0 175C-8.5 175.5 -18 157.5 0.1 123.5C19.6 86.8 66.2 45.3 108.6 2C135 -25 158 -77 119.2 -123.9C92.8 -155.8 53 -176 0.8 -175C-55.1 -173.9 -94.9 -151.8 -120 -122Z;M-125 -122C-164 -79 -170.3 -40.8 -161.9 2C-147 79 -78 78 -35.2 124C-14.7 146 0 165 0 175C0 181 8 149.8 38.5 123.9C69 98 146 75 159.7 2C167.8 -41.3 170 -78 124.2 -123.9C94.9 -153.2 53 -176 0.8 -175C-55.1 -173.9 -98.8 -150.8 -125 -122Z;M-123.4 -123.7C-158 -89.1 -180.6 -41.8 -173.2 3C-165.2 51.5 -135.2 92.1 -104.5 123.7C-68 161.5 -27 175 0 175C24 175 67 157 104.6 123.7C137.6 94.5 171 44.5 173.5 2C176.2 -43.4 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z;M-123.4 -123.7C-158 -89.1 -175 -43.4 -174.5 2C-174 46.1 -156.9 90.1 -123.4 123.7C-89.3 157.9 -44.6 175 0 175C44.7 175 89.3 157.9 123.4 123.7C157 90.1 174 46.1 174.5 2C175 -43.5 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z;M123.7 -123.7C158.4 -89.1 175.5 -43.4 175 2C174.5 46.1 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -174.5 46.1 -175 2C-175.5 -43.5 -158.4 -89.1 -123.7 -123.7C-89.3 -158.2 -44.1 -175.3 1 -175C45.5 -174.7 89.8 -157.7 123.7 -123.7Z;M104.7 -123.7C134 -89.1 164 -52 167.5 2C170.4 46 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -168.9 46.1 -167.5 2C-166 -45 -144 -85 -104.7 -123.7C-72.5 -155.4 -37.3 -175.3 0.8 -175C38.4 -174.7 76 -157.7 104.7 -123.7Z;M45.7 -121.5C70.7 -92.3 111 -53.4 136.5 2C154 40 157.4 90.1 123.7 123.7C89.6 157.9 44.8 175 0 175C-44.8 175 -89.6 157.9 -123.7 123.7C-157.4 90.1 -156 45 -135.9 2C-116.5 -39.3 -82 -81 -44.6 -124C-14.3 -158.9 -19 -175 0.8 -175C16 -175 14.3 -158 45.7 -121.5Z;M-39.1 -121.5C-36 -66 0 -43 72.6 2C115.6 28.6 131 84 106.1 123.7C82.3 161.9 44.8 175 0 175C-44.8 175 -81.6 161.5 -106.1 123.7C-132 84 -119 30 -73.2 2C-36.9 -20.2 42 -47 46.4 -124C47.7 -146.7 21 -174 0.8 -175C-14.3 -175.7 -40.3 -143.7 -39.1 -121.5Z;M-102 -121.5C-124.1 -72.3 -86 -39 -33.2 2C15.5 39.9 50 69 49.4 123.7C49.1 151 23.7 175 0 175C-23.8 175 -47 155 -49.9 123.7C-53.7 82.4 -11 35 32.6 2C76.2 -31 132 -78 105.2 -124C84.3 -159.8 53 -176 0.8 -175C-55.1 -173.9 -86 -157 -102 -121.5Z;M-120 -122C-151 -85 -145 -30 -113.2 2C-69.1 46.6 -24.3 74.6 0.4 123.5C13.5 149.5 12.1 174.3 0 175C-8.5 175.5 -18 157.5 0.1 123.5C19.6 86.8 66.2 45.3 108.6 2C135 -25 158 -77 119.2 -123.9C92.8 -155.8 53 -176 0.8 -175C-55.1 -173.9 -94.9 -151.8 -120 -122Z;M-125 -122C-164 -79 -170.3 -40.8 -161.9 2C-147 79 -78 78 -35.2 124C-14.7 146 0 165 0 175C0 181 8 149.8 38.5 123.9C69 98 146 75 159.7 2C167.8 -41.3 170 -78 124.2 -123.9C94.9 -153.2 53 -176 0.8 -175C-55.1 -173.9 -98.8 -150.8 -125 -122Z;M-123.4 -123.7C-158 -89.1 -180.6 -41.8 -173.2 3C-165.2 51.5 -135.2 92.1 -104.5 123.7C-68 161.5 -27 175 0 175C24 175 67 157 104.6 123.7C137.6 94.5 171 44.5 173.5 2C176.2 -43.4 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z;M-123.4 -123.7C-158 -89.1 -175 -43.4 -174.5 2C-174 46.1 -156.9 90.1 -123.4 123.7C-89.3 157.9 -44.6 175 0 175C44.7 175 89.3 157.9 123.4 123.7C157 90.1 174 46.1 174.5 2C175 -43.5 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z;M-123.4 -123.7C-158 -89.1 -175 -43.4 -174.5 2C-174 46.1 -156.9 90.1 -123.4 123.7C-89.3 157.9 -44.6 175 0 175C44.7 175 89.3 157.9 123.4 123.7C157 90.1 174 46.1 174.5 2C175 -43.5 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z'/%3E%3C/path%3E%3C/mask%3E%3C/defs%3E%3Cg mask='url(%23m)'%3E%3Cg transform='translate(250 250)'%3E%3Cpath fill='url(%23g)' d='M155.4 -155.3C198.9 -111.8 220.4 -54.5 219.7 2.6C219.1 58 197.6 113.1 155.4 155.4C112.5 198.3 56.2 219.7 -0 219.7C-56.2 219.7 -112.5 198.3 -155.4 155.4C-197.6 113.1 -219.1 57.9 -219.7 2.5C-220.3 -54.5 -198.9 -111.8 -155.4 -155.3C-112.1 -198.6 -55.4 -220 1.3 -219.7C57.1 -219.4 112.8 -197.9 155.4 -155.3Z'%3E%3CanimateTransform attributeName='transform' type='rotate' dur='4s' repeatCount='indefinite' values='135;495' additive='sum'/%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const RING_STILL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cdefs%3E%3ClinearGradient id='g' gradientUnits='userSpaceOnUse' x1='-180' y1='-7.3' x2='200.8' y2='8.3'%3E%3Cstop offset='0.013' stop-color='%23b555fe'/%3E%3Cstop offset='0.176' stop-color='%237a27f6'/%3E%3Cstop offset='0.517' stop-color='%232f5bf5'/%3E%3Cstop offset='0.849' stop-color='%2312b4ff'/%3E%3Cstop offset='0.988' stop-color='%2333c5ff'/%3E%3C/linearGradient%3E%3Cmask id='m' maskUnits='userSpaceOnUse' x='0' y='0' width='500' height='500'%3E%3Cpath transform='translate(250 250) rotate(82)' fill='none' stroke='%23fff' stroke-width='80' stroke-miterlimit='4' d='M-123.4 -123.7C-158 -89.1 -175 -43.4 -174.5 2C-174 46.1 -156.9 90.1 -123.4 123.7C-89.3 157.9 -44.6 175 0 175C44.7 175 89.3 157.9 123.4 123.7C157 90.1 174 46.1 174.5 2C175 -43.5 158 -89.1 123.4 -123.7C89.1 -158.2 44 -175.3 -1 -175C-45.3 -174.7 -89.6 -157.7 -123.4 -123.7Z'%3E%3C/path%3E%3C/mask%3E%3C/defs%3E%3Cg mask='url(%23m)'%3E%3Cg transform='translate(250 250) rotate(135)'%3E%3Cpath fill='url(%23g)' d='M155.4 -155.3C198.9 -111.8 220.4 -54.5 219.7 2.6C219.1 58 197.6 113.1 155.4 155.4C112.5 198.3 56.2 219.7 -0 219.7C-56.2 219.7 -112.5 198.3 -155.4 155.4C-197.6 113.1 -219.1 57.9 -219.7 2.5C-220.3 -54.5 -198.9 -111.8 -155.4 -155.3C-112.1 -198.6 -55.4 -220 1.3 -219.7C57.1 -219.4 112.8 -197.9 155.4 -155.3Z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const STYLES = `
.mel-editor-splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  font-family: "IBM Plex Sans Arabic", system-ui, sans-serif;
  transition: opacity 0.4s ease, visibility 0.4s;
}
.mel-editor-splash[data-theme="dark"] { background: #0a0e27; }
.mel-editor-splash[data-theme="light"] { background: #f1f5f9; }
.mel-editor-splash[data-hidden="true"] { opacity: 0; visibility: hidden; pointer-events: none; }
.mel-editor-splash__mark { position: relative; width: 120px; height: 120px; }
.mel-editor-splash__ring { position: relative; display: block; width: 100%; height: 100%; }
.mel-editor-splash__glow {
  position: absolute;
  inset: -45%;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(47 91 245 / 0.45), rgb(181 85 254 / 0.16) 55%, transparent);
  animation: mel-editor-splash-breathe 4s ease-in-out infinite;
}
.mel-editor-splash[data-theme="light"] .mel-editor-splash__glow { opacity: 0.45; }
.mel-editor-splash__text {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: transparent;
  background: linear-gradient(90deg, #a4b1fa 0%, #a4b1fa 40%, #ffffff 50%, #a4b1fa 60%, #a4b1fa 100%) 0 0 / 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: mel-editor-splash-shimmer 2.4s linear infinite;
}
.mel-editor-splash[data-theme="light"] .mel-editor-splash__text {
  background-image: linear-gradient(90deg, #5b6777 0%, #5b6777 40%, #0275b0 50%, #5b6777 60%, #5b6777 100%);
}
@keyframes mel-editor-splash-breathe {
  0%, 100% { transform: scale(0.9); opacity: 0.75; }
  50% { transform: scale(1.06); opacity: 1; }
}
@keyframes mel-editor-splash-shimmer {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .mel-editor-splash__glow, .mel-editor-splash__text { animation: none; }
}
`;

type Props = {
  theme: "light" | "dark";
  message?: string;
  /** Fades out (and stops taking clicks) instead of unmounting abruptly. */
  hidden?: boolean;
  className?: string;
};

export default function EditorSplash({
  theme,
  message = "جاري فتح المحرر",
  hidden = false,
  className = "",
}: Props) {
  return (
    <div
      className={`mel-editor-splash ${className}`}
      data-theme={theme}
      data-hidden={hidden}
      role="status"
      aria-live="polite"
      aria-hidden={hidden || undefined}
    >
      <style>{STYLES}</style>
      <div className="mel-editor-splash__mark">
        <div className="mel-editor-splash__glow" />
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={RING_STILL} />
          <img
            className="mel-editor-splash__ring"
            alt=""
            width={120}
            height={120}
            src={RING_ANIMATED}
          />
        </picture>
      </div>
      <p className="mel-editor-splash__text">{message}</p>
    </div>
  );
}
