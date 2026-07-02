'use client';

// ── Fixed particle positions (no hydration mismatch) ──────────────────────

// Forest: drifting leaves [left%, top%, delay]
const LEAVES: [number, number, number][] = [
  [8,10,0],[18,5,1.2],[32,15,0.4],[47,8,2.1],[61,12,0.8],
  [74,6,1.6],[85,14,0.3],[93,9,2.4],[14,22,1.1],[38,18,0.7],
  [55,25,1.9],[70,20,0.5],[88,17,2.2],
];

// Winter: snowflakes [left%, delay, size]
const SNOWFLAKES: [number, number, number][] = [
  [5,0,1],[16,0.9,0.8],[27,1.6,1.2],[38,2.3,0.9],[50,0.4,1.1],
  [62,1.9,0.8],[73,1.1,1.3],[85,2.7,0.9],[92,0.6,1],[44,2.1,1.1],
  [70,1.4,0.8],[21,3,1.2],[58,0.7,1],[80,2.4,0.9],[10,1.7,1.1],
];

// Witch Coven: drifting spore/dust motes [left%, top%, delay]
const SPORES: [number, number, number][] = [
  [12,40,0],[28,55,1.4],[44,42,0.6],[67,60,2.2],[82,48,0.9],
  [55,70,1.6],[35,65,0.3],[73,52,1.9],[20,35,2.5],[60,38,1.1],
];

// Elven: floating petal motes [left%, top%, delay]
const PETALS: [number, number, number][] = [
  [15,80,0],[28,72,0.9],[48,85,1.6],[63,76,0.4],
  [78,68,2.2],[38,90,1.3],[58,62,0.7],[85,78,1.8],
];

// Elven tree trunks [left%, height%, width]
const ELVEN_TRUNKS: [number, number, number][] = [
  [3,72,8],[9,85,12],[16,68,7],[22,90,10],[30,75,8],
  [38,82,11],[46,70,7],[55,88,12],[63,76,8],
  [72,84,10],[80,70,7],[87,80,11],[94,74,8],
];

// Witch runes — just text, no glow
const RUNE_POS = [[8,30],[25,50],[45,22],[62,45],[78,28],[52,62]];
const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ'];

// ── SVG hill/mountain silhouettes ─────────────────────────────────────────
// viewBox "0 0 1440 200"
const F_HILL_FAR  = "M0,200 L0,145 L30,98 L60,145 L95,88 L130,145 L165,75 L200,145 L235,90 L270,145 L305,78 L340,145 L375,65 L410,145 L445,82 L480,145 L515,70 L550,145 L585,88 L620,145 L655,72 L690,145 L725,60 L760,145 L795,78 L830,145 L865,65 L900,145 L935,82 L970,145 L1005,68 L1040,145 L1075,55 L1110,145 L1145,72 L1180,145 L1215,60 L1250,145 L1285,78 L1320,145 L1355,65 L1390,145 L1440,75 L1440,200 Z";
const F_HILL_NEAR = "M0,200 L0,162 L55,108 L110,160 L145,118 L185,75 L225,120 L260,140 L300,90 L340,128 L378,98 L415,60 L455,98 L488,124 L528,80 L568,120 L602,90 L642,50 L682,90 L715,120 L755,74 L798,114 L832,80 L872,44 L912,80 L945,112 L985,68 L1025,110 L1058,80 L1098,44 L1138,80 L1172,110 L1212,67 L1252,110 L1288,77 L1328,42 L1368,77 L1402,107 L1440,70 L1440,200 Z";
const W_MTN_FAR   = "M0,200 L0,158 L80,82 L160,140 L240,62 L320,118 L400,45 L480,108 L560,55 L640,128 L720,48 L800,110 L880,38 L960,118 L1040,55 L1120,132 L1200,48 L1280,120 L1360,68 L1440,102 L1440,200 Z";
const W_MTN_NEAR  = "M0,200 L0,180 L100,118 L180,170 L260,98 L345,155 L425,80 L510,148 L590,105 L672,168 L755,84 L838,158 L920,70 L1005,165 L1085,100 L1168,175 L1250,87 L1335,160 L1440,110 L1440,200 Z";
const W_BASE      = "M0,200 L0,165 L12,112 L18,160 L21,102 L26,160 L38,172 L44,128 L50,162 L54,140 L60,92 L66,140 L70,162 L78,132 L84,84 L90,132 L96,162 L115,172 L135,148 L142,100 L148,148 L154,168 L162,148 L170,104 L176,148 L185,170 L210,162 L222,118 L228,162 L234,132 L240,85 L246,132 L254,162 L285,172 L320,162 L330,115 L336,162 L342,132 L348,85 L355,132 L362,162 L400,172 L445,162 L455,112 L461,162 L467,132 L474,84 L480,132 L488,162 L535,172 L575,162 L585,110 L591,162 L597,130 L604,82 L610,130 L618,162 L665,172 L715,162 L726,108 L732,162 L738,130 L745,80 L752,130 L760,162 L815,172 L870,162 L880,108 L886,162 L892,128 L900,80 L906,128 L914,162 L970,172 L1030,162 L1040,110 L1046,162 L1052,130 L1060,84 L1066,130 L1074,162 L1130,172 L1185,162 L1195,108 L1201,162 L1207,128 L1215,80 L1222,128 L1230,162 L1290,172 L1350,162 L1360,110 L1366,162 L1372,130 L1380,80 L1387,130 L1395,162 L1440,172 L1440,200 Z";

function Silhouette({ d, fill, h = 200 }: { d: string; fill: string; h?: number }) {
  return (
    <svg className="absolute bottom-0 w-full pointer-events-none"
      style={{ height: h }} viewBox={`0 0 1440 ${h}`} preserveAspectRatio="none">
      <path d={d} fill={fill} />
    </svg>
  );
}

// ── Forest Realm ──────────────────────────────────────────────────────────
function ForestAtmo() {
  return (
    <>
      {/* Soft sky — warm cream top, sage mid */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #4a7c35 0%, #3a6228 55%, #2a4a1e 100%)',
      }} />
      {/* Distant hill layer */}
      <Silhouette d={F_HILL_FAR}  fill="#2e5a20" h={200} />
      {/* Near hill layer */}
      <Silhouette d={F_HILL_NEAR} fill="#1e3e14" h={200} />
      {/* Ground strip */}
      <div className="absolute bottom-0 w-full h-20" style={{ background: '#16300e' }} />
      {/* Drifting leaves — flat colored, NO glow */}
      {LEAVES.map(([l, t, d], i) => (
        <div key={i} className="absolute" style={{
          left: `${l}%`, top: `${t}%`,
          width: i % 3 === 0 ? 5 : 4, height: i % 3 === 0 ? 8 : 6,
          background: i % 4 === 0 ? '#a8d870' : i % 4 === 1 ? '#c8e890' : i % 4 === 2 ? '#88b850' : '#e8c878',
          borderRadius: '50% 0 50% 0',
          opacity: 0.55 + (i % 4) * 0.1,
          animation: `wfa-leaf ${5 + (i % 5) * 0.9}s ease-in-out infinite`,
          animationDelay: `${d}s`,
          transform: `rotate(${i * 37}deg)`,
        }} />
      ))}
      {/* Vignette to pull sides in */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(10,22,6,0.5) 100%)',
      }} />
    </>
  );
}

// ── Winter Kingdom ────────────────────────────────────────────────────────
function WinterAtmo() {
  return (
    <>
      {/* Cool overcast sky */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #1c2e42 0%, #263850 55%, #1a2c40 100%)',
      }} />
      {/* Simple moon — flat circle, NO boxShadow */}
      <div className="absolute" style={{
        top: '8%', right: '14%', width: 60, height: 60,
        background: '#e8f4fc',
        borderRadius: '50%',
        opacity: 0.9,
      }} />
      {/* Distant mountains */}
      <Silhouette d={W_MTN_FAR}  fill="#1a3050" h={200} />
      {/* Near mountains / snow ground */}
      <Silhouette d={W_MTN_NEAR} fill="#0e1e30" h={200} />
      {/* Ground snow strip */}
      <div className="absolute bottom-0 w-full h-14" style={{ background: '#182840' }} />
      {/* Simple snowflakes — white dots, NO glow */}
      {SNOWFLAKES.map(([l, d, size], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: -8,
          width: size * 3, height: size * 3,
          background: 'rgba(232,244,252,0.8)',
          animation: `wfa-snow ${6 + (i % 5) * 1.2}s linear infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(4,10,22,0.5) 100%)',
      }} />
    </>
  );
}

// ── Witch Coven ───────────────────────────────────────────────────────────
function WitchAtmo() {
  return (
    <>
      {/* Deep plum sky */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #12081e 0%, #1e0c30 55%, #100618 100%)',
      }} />
      {/* Moon — plain cream circle, NO boxShadow */}
      <div className="absolute" style={{
        top: '8%', right: '12%', width: 64, height: 64,
        background: '#f0e8d8',
        borderRadius: '50%',
        opacity: 0.88,
      }} />
      {/* Dead tree silhouette base */}
      <Silhouette d={W_BASE} fill="#0a0018" h={200} />
      {/* Ground mist — muted purple, flat, NO blur */}
      <div className="absolute bottom-0 w-full h-32" style={{
        background: 'linear-gradient(to top, rgba(60,20,100,0.22) 0%, rgba(50,15,80,0.10) 55%, transparent 100%)',
        animation: 'wfa-fog 14s ease-in-out infinite alternate',
      }} />
      {/* Spore motes — flat muted dots, NO boxShadow glow */}
      {SPORES.map(([l, t, d], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: `${t}%`,
          width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2,
          background: i % 2 === 0 ? 'rgba(160,100,220,0.45)' : 'rgba(120,80,180,0.35)',
          animation: `wfa-wisp ${4 + (i % 3) * 0.8}s ease-in-out infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      {/* Runes — flat muted text, NO textShadow */}
      {RUNES.map((rune, i) => (
        <div key={i} className="absolute select-none font-bold" style={{
          left: `${RUNE_POS[i][0]}%`, top: `${RUNE_POS[i][1]}%`,
          fontSize: 20 + (i % 3) * 6,
          color: i % 2 === 0 ? 'rgba(160,100,220,0.18)' : 'rgba(130,80,190,0.15)',
          animation: `wfa-fog ${9 + i * 1.3}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.8}s`,
        }}>{rune}</div>
      ))}
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,1,18,0.55) 100%)',
      }} />
    </>
  );
}

// ── Elven Sanctuary ───────────────────────────────────────────────────────
function ElvenAtmo() {
  return (
    <>
      {/* Deep forest night — warm emerald, not space-black */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #0a1e0c 0%, #122818 55%, #0a1a0a 100%)',
      }} />
      {/* Ancient tree trunks — brown silhouettes, flat */}
      {ELVEN_TRUNKS.map(([lp, hp, w], i) => (
        <div key={i} className="absolute bottom-0" style={{
          left: `${lp}%`, width: w, height: `${hp}%`,
          background: 'linear-gradient(to top, #3a2010 0%, #2a1808 60%, rgba(20,12,4,0.4) 100%)',
          transform: 'translateX(-50%)',
          borderRadius: '60% 60% 0 0 / 3% 3% 0 0',
        }} />
      ))}
      {/* Canopy top edge — layered green */}
      <div className="absolute top-0 w-full h-20" style={{
        background: 'linear-gradient(180deg, rgba(16,50,20,0.85) 0%, transparent 100%)',
      }} />
      {/* Waterfall hints — thin white vertical strips */}
      {[22, 68].map((l, i) => (
        <div key={i} className="absolute" style={{
          left: `${l}%`, top: '15%', width: 3, height: '55%',
          background: 'linear-gradient(180deg, rgba(200,230,210,0.18) 0%, rgba(180,220,200,0.06) 100%)',
          animation: `wfa-fog ${8 + i * 3}s ease-in-out infinite alternate`,
          animationDelay: `${i * 1.5}s`,
        }} />
      ))}
      {/* Ground glow — warm amber-green, flat, NO blur */}
      {[15, 35, 55, 75].map((l, i) => (
        <div key={i} className="absolute bottom-0" style={{
          left: `${l}%`, width: 130, height: 80,
          background: i % 2 === 0
            ? 'radial-gradient(ellipse at 50% 100%, rgba(180,140,60,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 100%, rgba(80,160,90,0.10) 0%, transparent 70%)',
          transform: 'translateX(-50%)',
        }} />
      ))}
      {/* Drifting petals — flat colored dots, NO boxShadow */}
      {PETALS.map(([l, t, d], i) => (
        <div key={i} className="absolute" style={{
          left: `${l}%`, top: `${t}%`,
          width: 4, height: 6,
          background: i % 3 === 0 ? 'rgba(180,230,160,0.55)' : i % 3 === 1 ? 'rgba(220,200,120,0.50)' : 'rgba(160,210,140,0.45)',
          borderRadius: '50% 0 50% 0',
          transform: `rotate(${i * 45}deg)`,
          animation: `wfa-mote ${5 + (i % 4) * 0.8}s ease-in-out infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(6,14,6,0.52) 100%)',
      }} />
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────
export function WorldAtmosphere({ world }: { world: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {world === 1 && <ForestAtmo />}
      {world === 2 && <WinterAtmo />}
      {world === 3 && <WitchAtmo />}
      {world === 4 && <ElvenAtmo />}
    </div>
  );
}
