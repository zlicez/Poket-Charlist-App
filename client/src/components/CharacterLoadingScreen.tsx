/**
 * CharacterLoadingScreen — React version of the HTML pre-loader.
 *
 * Uses the same .pkt-loader / .ld-* CSS classes defined in index.html <head>,
 * so both screens are pixel-perfect identical — same keyframes, same sizes,
 * same timing, same markup structure.
 */
export function CharacterLoadingScreen() {
  return (
    <div className="pkt-loader">
      <div className="ld-dice">
        <div className="ld-ring" />
        <svg className="ld-d20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="40,4 74,22 74,58 40,76 6,58 6,22"
            stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.85"/>
          <polygon points="40,4 74,22 40,38"  stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <polygon points="74,22 74,58 40,38" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <polygon points="74,58 40,76 40,38" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <polygon points="40,76 6,58 40,38"  stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <polygon points="6,58 6,22 40,38"   stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <polygon points="6,22 40,4 40,38"   stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <text x="40" y="44" textAnchor="middle"
            fontSize="15" fontWeight="700" fontFamily="inherit"
            fill="currentColor" opacity="0.92">20</text>
        </svg>
        <div className="ld-dot1" />
        <div className="ld-dot2" />
      </div>

      <div className="ld-text">
        <p className="ld-title">Подготовка персонажа</p>
        <div className="ld-msgs">
          {/* Single always-visible message — page is almost ready */}
          <span style={{ opacity: 1, transform: "translateY(0)", animation: "none", position: "static", display: "block" }}>
            Почти готово
          </span>
        </div>
        <div className="ld-dots ld-dots--bounce"><i /><i /><i /></div>
      </div>
    </div>
  );
}
