export interface PatternProps {
  className?: string
}

/**
 * Operating Systems Pattern:
 * Translucent overlapping rounded window panes with subtle specular stroke lines.
 */
export function OsWindowPattern({ className }: PatternProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        {/* Background ambient squircle */}
        <rect
          x="30"
          y="30"
          width="130"
          height="130"
          rx="24"
          strokeOpacity="0.25"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Mid-layer window pane */}
        <rect
          x="60"
          y="60"
          width="120"
          height="120"
          rx="20"
          strokeOpacity="0.4"
          fill="currentColor"
          fillOpacity="0.08"
        />
        {/* Header bar divider in window pane */}
        <line x1="60" y1="84" x2="180" y2="84" strokeOpacity="0.3" />
        {/* Window controls dots */}
        <circle cx="76" cy="72" r="3" fill="currentColor" fillOpacity="0.4" />
        <circle cx="86" cy="72" r="3" fill="currentColor" fillOpacity="0.3" />
        <circle cx="96" cy="72" r="3" fill="currentColor" fillOpacity="0.2" />
        {/* Foreground compact tile */}
        <rect
          x="90"
          y="100"
          width="90"
          height="80"
          rx="16"
          strokeOpacity="0.5"
          fill="currentColor"
          fillOpacity="0.12"
        />
        {/* Inner grid lines */}
        <line x1="90" y1="124" x2="180" y2="124" strokeOpacity="0.3" />
        <line x1="130" y1="124" x2="130" y2="180" strokeOpacity="0.2" />
      </g>
    </svg>
  )
}

/**
 * Security & Antivirus Pattern:
 * Concentric circular shield arcs and radiating radar pulse rings.
 */
export function SecurityRadarPattern({ className }: PatternProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor">
        {/* Outer shield boundary arc */}
        <path
          d="M100 20C135 35 170 30 180 60C180 120 145 165 100 185C55 165 20 120 20 60C30 30 65 35 100 20Z"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Concentric radar pulse rings */}
        <circle cx="100" cy="95" r="28" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="100" cy="95" r="48" strokeWidth="1.25" strokeOpacity="0.35" strokeDasharray="4 4" />
        <circle cx="100" cy="95" r="68" strokeWidth="1" strokeOpacity="0.2" />
        {/* Crosshair coordinate axes */}
        <line x1="100" y1="40" x2="100" y2="150" strokeWidth="1" strokeOpacity="0.25" />
        <line x1="45" y1="95" x2="155" y2="95" strokeWidth="1" strokeOpacity="0.25" />
        {/* Central pulse core */}
        <circle cx="100" cy="95" r="10" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="100" cy="95" r="4" fill="currentColor" fillOpacity="0.7" />
      </g>
    </svg>
  )
}

/**
 * Office Suites Pattern:
 * Overlapping document folios, spreadsheet matrices, and geometric grid facets.
 */
export function OfficeFolioPattern({ className }: PatternProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        {/* Back document folio */}
        <rect
          x="35"
          y="25"
          width="100"
          height="135"
          rx="16"
          strokeOpacity="0.25"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Front document / spreadsheet folio */}
        <rect
          x="70"
          y="50"
          width="110"
          height="130"
          rx="18"
          strokeOpacity="0.45"
          fill="currentColor"
          fillOpacity="0.1"
        />
        {/* Header strip on front sheet */}
        <line x1="70" y1="80" x2="180" y2="80" strokeOpacity="0.35" />
        {/* Horizontal table / spreadsheet lines */}
        <line x1="70" y1="105" x2="180" y2="105" strokeOpacity="0.25" strokeDasharray="3 3" />
        <line x1="70" y1="130" x2="180" y2="130" strokeOpacity="0.25" strokeDasharray="3 3" />
        <line x1="70" y1="155" x2="180" y2="155" strokeOpacity="0.2" strokeDasharray="3 3" />
        {/* Column divider */}
        <line x1="115" y1="80" x2="115" y2="180" strokeOpacity="0.25" />
        {/* Top-right corner folded tab motif */}
        <path d="M155 50L180 75H163C158.582 75 155 71.4183 155 67V50Z" fill="currentColor" fillOpacity="0.25" strokeOpacity="0.4" />
      </g>
    </svg>
  )
}

/**
 * Fallback / Prism Ribbon Pattern:
 * Intersecting luminous geometric rings and diagonal ribbon waves.
 */
export function PrismRibbonPattern({ className }: PatternProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        <circle cx="85" cy="85" r="60" strokeOpacity="0.3" fill="currentColor" fillOpacity="0.05" />
        <circle cx="125" cy="115" r="55" strokeOpacity="0.4" fill="currentColor" fillOpacity="0.08" />
        <circle cx="105" cy="100" r="30" strokeOpacity="0.5" strokeDasharray="4 4" />
        <line x1="30" y1="170" x2="170" y2="30" strokeOpacity="0.25" strokeWidth="2" />
        <line x1="50" y1="180" x2="180" y2="50" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="6 4" />
      </g>
    </svg>
  )
}

