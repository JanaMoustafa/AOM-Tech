import { useId } from "react";
import type { ProjectArtKind } from "@/content/site";

// One illustration per project, drawn from what the project actually does.
// Ambient motion lives in the .art-* classes in globals.css, so the global
// reduced-motion rule switches it off.
export function ProjectArt({ kind }: { kind: ProjectArtKind }) {
  const id = useId().replace(/:/g, "");
  const g = `g-${id}`;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={g} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5b6cff" />
          <stop offset="0.45" stopColor="#8c52ff" />
          <stop offset="1" stopColor="#ff66c4" />
        </linearGradient>
        <radialGradient id={`${g}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff66c4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff66c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {kind === "diadose" && <DiaDose g={g} />}
      {kind === "bone" && <Bone g={g} />}
      {kind === "goose" && <Goose g={g} />}
      {kind === "osta" && <Osta g={g} />}
      {kind === "uai" && <Uai g={g} />}
    </svg>
  );
}

// A meal under a scanner, feeding a glucose curve with a dashed forecast.
function DiaDose({ g }: { g: string }) {
  return (
    <g>
      <circle cx="118" cy="112" r="56" fill="#fff" fillOpacity="0.04" stroke="#fff" strokeOpacity="0.25" />
      <circle cx="118" cy="112" r="38" fill="none" stroke="#e2a9f1" strokeOpacity="0.4" />
      <circle cx="104" cy="102" r="12" fill="#8c52ff" fillOpacity="0.7" />
      <circle cx="132" cy="118" r="15" fill="#ff66c4" fillOpacity="0.6" />
      <circle cx="112" cy="128" r="8" fill="#e2a9f1" fillOpacity="0.7" />
      {/* scan corners */}
      <g stroke={`url(#${g})`} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M52 62v-14h14M170 48h14v14M184 162v14h-14M66 176H52v-14" />
      </g>
      <rect className="art-scan" x="54" y="50" width="128" height="2" fill="#ff66c4" opacity="0.8" />
      <path
        className="art-draw"
        d="M20 250 C60 250 70 205 105 212 S150 262 190 236 S230 196 262 214"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M262 214 C290 228 320 190 380 200"
        fill="none"
        stroke="#e2a9f1"
        strokeWidth="2.5"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <circle cx="262" cy="214" r="5" fill="#fff" />
      <line x1="262" y1="150" x2="262" y2="268" stroke="#fff" strokeOpacity="0.2" strokeDasharray="2 4" />
      <g fill="#fff" fillOpacity="0.85">
        <rect x="236" y="70" width="140" height="58" rx="12" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.15" />
        <rect x="252" y="86" width="56" height="6" rx="3" fillOpacity="0.5" />
        <rect x="252" y="102" width="92" height="10" rx="5" fill={`url(#${g})`} fillOpacity="1" />
      </g>
    </g>
  );
}

// A long bone on an X-ray with a sweeping scan and a detection box.
function Bone({ g }: { g: string }) {
  return (
    <g>
      <g fill="#fff" fillOpacity="0.14" stroke="#fff" strokeOpacity="0.35">
        <path d="M150 42c-18-10-44 2-38 24 3 12 16 16 26 14l10 150c-10 0-22 8-20 22 3 20 30 22 40 8 6 10 32 10 34-10 2-14-10-20-20-20l-10-150c10-2 20-12 16-24-6-20-32-24-38-14z" />
      </g>
      <circle cx="176" cy="106" r="44" fill={`url(#${g}-glow)`} className="art-pulse" />
      <rect x="140" y="72" width="74" height="70" rx="8" fill="none" stroke={`url(#${g})`} strokeWidth="2.5" />
      <rect className="art-scan-long" x="80" y="30" width="200" height="2" fill="#e2a9f1" opacity="0.8" />
      <g fill="#fff">
        <rect x="238" y="80" width="130" height="92" rx="12" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.15" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="252" y={96 + i * 24} width="54" height="6" rx="3" fillOpacity="0.4" />
            <rect x="312" y={95 + i * 24} width={[44, 22, 12][i]} height="8" rx="4" fill={`url(#${g})`} />
          </g>
        ))}
      </g>
    </g>
  );
}

const EGG = "M0 -24 C14 -24 20 -4 20 8 C20 20 11 27 0 27 C-11 27 -20 20 -20 8 C-20 -4 -14 -24 0 -24Z";

// The month's budget as ten eggs; spent ones crack.
function Goose({ g }: { g: string }) {
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 88 + col * 56;
        const y = 110 + row * 78;
        const cracked = i >= 7;
        return (
          <g key={i} transform={`translate(${x} ${y})`} className={i === 6 ? "art-bob" : undefined}>
            <path
              d={EGG}
              fill={cracked ? "none" : `url(#${g})`}
              fillOpacity={cracked ? 0 : 1 - i * 0.06}
              stroke={cracked ? "#fff" : "none"}
              strokeOpacity="0.35"
              strokeWidth="2"
            />
            {cracked && (
              <path d="M-19 4 L-10 -2 L-3 6 L5 -3 L12 5 L19 0" fill="none" stroke="#ff66c4" strokeWidth="2" />
            )}
            {!cracked && <ellipse cx="-7" cy="-8" rx="4" ry="7" fill="#fff" fillOpacity="0.35" />}
          </g>
        );
      })}
      <rect x="88" y="240" width="224" height="8" rx="4" fill="#fff" fillOpacity="0.08" />
      <rect x="88" y="240" width="156" height="8" rx="4" fill={`url(#${g})`} />
    </g>
  );
}

// Three competing quotes on one job; the chosen one is lit.
function Osta({ g }: { g: string }) {
  const cards = [
    { y: 58, w: 90 },
    { y: 124, w: 70, chosen: true },
    { y: 190, w: 110 },
  ];
  return (
    <g>
      <path d="M60 188 C60 188 36 160 36 140 a24 24 0 0 1 48 0 C84 160 60 188 60 188Z" fill={`url(#${g})`} />
      <circle cx="60" cy="140" r="9" fill="#141414" />
      {cards.map((c, i) => (
        <g key={i}>
          <rect
            x="118"
            y={c.y}
            width="250"
            height="52"
            rx="14"
            fill="#fff"
            fillOpacity={c.chosen ? 0.1 : 0.04}
            stroke={c.chosen ? `url(#${g})` : "#fff"}
            strokeOpacity={c.chosen ? 1 : 0.14}
            strokeWidth={c.chosen ? 2.5 : 1}
          />
          <circle cx="146" cy={c.y + 26} r="12" fill="#e2a9f1" fillOpacity={c.chosen ? 0.9 : 0.35} />
          <rect x="168" y={c.y + 16} width={c.w} height="7" rx="3.5" fill="#fff" fillOpacity="0.45" />
          <rect x="168" y={c.y + 30} width="46" height="6" rx="3" fill="#fff" fillOpacity="0.2" />
          <rect x="300" y={c.y + 18} width="48" height="16" rx="8" fill={c.chosen ? `url(#${g})` : "#fff"} fillOpacity={c.chosen ? 1 : 0.12} />
        </g>
      ))}
      <g className="art-pulse">
        <circle cx="366" cy="124" r="11" fill="#ff66c4" />
        <path d="M361 124 l4 4 l7 -8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

// A memory graph: moments linked to a person.
function Uai({ g }: { g: string }) {
  const nodes = [
    [200, 150, 18],
    [110, 90, 9],
    [300, 80, 11],
    [320, 200, 8],
    [120, 220, 12],
    [220, 250, 7],
    [60, 160, 6],
    [350, 140, 6],
  ] as const;
  const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5], [1, 6], [2, 7], [3, 5], [1, 4]];
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#e2a9f1"
          strokeOpacity="0.35"
        />
      ))}
      {nodes.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i === 0 ? `url(#${g})` : "#8c52ff"} fillOpacity={i === 0 ? 1 : 0.7} className={i % 3 === 0 ? "art-pulse" : undefined} />
      ))}
    </g>
  );
}
