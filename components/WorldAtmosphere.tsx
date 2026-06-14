'use client';

// Fixed arrays — no hydration mismatch
const FIREFLIES: [number, number, number][] = [
  [12,45,0],[28,55,1.4],[44,42,0.6],[67,60,2.2],[82,48,0.9],
  [55,70,1.6],[35,65,0.3],[73,52,1.9],[20,35,2.5],[60,38,1.1],
];
const SNOWFLAKES: [number, number, number][] = [
  [5,0,1],[16,0.9,0.8],[27,1.6,1.2],[38,2.3,0.9],[50,0.4,1.1],
  [62,1.9,0.8],[73,1.1,1.3],[85,2.7,0.9],[92,0.6,1],[44,2.1,1.1],
  [70,1.4,0.8],[21,3,1.2],[58,0.7,1],[80,2.4,0.9],[10,1.7,1.1],
];
const WISPS: [number, number, number, string][] = [
  [18,62,0,'#c084fc'],[42,48,1.4,'#e879f9'],[68,58,0.8,'#a855f7'],
  [83,42,2.2,'#d8b4fe'],[30,52,1.9,'#c084fc'],
];
const MOTES: [number, number, number][] = [
  [15,80,0],[28,72,0.9],[48,85,1.6],[63,76,0.4],
  [78,68,2.2],[38,90,1.3],[58,62,0.7],[85,78,1.8],
];
const ELVEN_TRUNKS: [number, number, number][] = [
  [3,72,8],[9,85,12],[16,68,7],[22,90,10],[30,75,8],
  [38,82,11],[46,70,7],[55,88,12],[63,76,8],
  [72,84,10],[80,70,7],[87,80,11],[94,74,8],
];
const RUNE_POS = [[8,30],[25,50],[45,22],[62,45],[78,28],[52,62]];
const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ'];

// SVG silhouette paths — viewBox "0 0 1440 200", fills the bottom of screen
const F_FAR = "M0,200 L0,145 L30,98 L60,145 L95,88 L130,145 L165,75 L200,145 L235,90 L270,145 L305,78 L340,145 L375,65 L410,145 L445,82 L480,145 L515,70 L550,145 L585,88 L620,145 L655,72 L690,145 L725,60 L760,145 L795,78 L830,145 L865,65 L900,145 L935,82 L970,145 L1005,68 L1040,145 L1075,55 L1110,145 L1145,72 L1180,145 L1215,60 L1250,145 L1285,78 L1320,145 L1355,65 L1390,145 L1440,75 L1440,200 Z";
const F_NEAR = "M0,200 L0,162 L55,108 L110,160 L145,118 L185,75 L225,120 L260,140 L300,90 L340,128 L378,98 L415,60 L455,98 L488,124 L528,80 L568,120 L602,90 L642,50 L682,90 L715,120 L755,74 L798,114 L832,80 L872,44 L912,80 L945,112 L985,68 L1025,110 L1058,80 L1098,44 L1138,80 L1172,110 L1212,67 L1252,110 L1288,77 L1328,42 L1368,77 L1402,107 L1440,70 L1440,200 Z";
const M_FAR = "M0,200 L0,158 L80,82 L160,140 L240,62 L320,118 L400,45 L480,108 L560,55 L640,128 L720,48 L800,110 L880,38 L960,118 L1040,55 L1120,132 L1200,48 L1280,120 L1360,68 L1440,102 L1440,200 Z";
const M_NEAR = "M0,200 L0,180 L100,118 L180,170 L260,98 L345,155 L425,80 L510,148 L590,105 L672,168 L755,84 L838,158 L920,70 L1005,165 L1085,100 L1168,175 L1250,87 L1335,160 L1440,110 L1440,200 Z";
const W_BASE = "M0,200 L0,165 L12,112 L18,160 L21,102 L26,160 L38,172 L44,128 L50,162 L54,140 L60,92 L66,140 L70,162 L78,132 L84,84 L90,132 L96,162 L115,172 L135,148 L142,100 L148,148 L154,168 L162,148 L170,104 L176,148 L185,170 L210,162 L222,118 L228,162 L234,132 L240,85 L246,132 L254,162 L285,172 L320,162 L330,115 L336,162 L342,132 L348,85 L355,132 L362,162 L400,172 L445,162 L455,112 L461,162 L467,132 L474,84 L480,132 L488,162 L535,172 L575,162 L585,110 L591,162 L597,130 L604,82 L610,130 L618,162 L665,172 L715,162 L726,108 L732,162 L738,130 L745,80 L752,130 L760,162 L815,172 L870,162 L880,108 L886,162 L892,128 L900,80 L906,128 L914,162 L970,172 L1030,162 L1040,110 L1046,162 L1052,130 L1060,84 L1066,130 L1074,162 L1130,172 L1185,162 L1195,108 L1201,162 L1207,128 L1215,80 L1222,128 L1230,162 L1290,172 L1350,162 L1360,110 L1366,162 L1372,130 L1380,80 L1387,130 L1395,162 L1440,172 L1440,200 Z";

function Silhouette({ d, fill, h = 200 }: { d: string; fill: string; h?: number }) {
  return (
    <svg className="absolute bottom-0 w-full pointer-events-none"
      style={{ height: h }} viewBox={`0 0 1440 ${h}`} preserveAspectRatio="none">
      <path d={d} fill={fill} />
    </svg>
  );
}

function ForestAtmo() {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 0%, rgba(126,207,138,0.15) 0%, transparent 55%), radial-gradient(ellipse at 72% 5%, rgba(200,184,100,0.09) 0%, transparent 40%), radial-gradient(ellipse at 12% 40%, rgba(100,180,120,0.07) 0%, transparent 35%)',
      }} />
      <Silhouette d={F_FAR} fill="#0f2410" />
      <Silhouette d={F_NEAR} fill="#061008" />
      <div className="absolute bottom-0 w-full h-36" style={{
        background: 'linear-gradient(to top, rgba(200,184,100,0.07) 0%, rgba(160,220,170,0.05) 50%, transparent 100%)',
        animation: 'wfa-fog 16s ease-in-out infinite alternate',
      }} />
      {FIREFLIES.map(([l, t, d], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: `${t}%`, width: 3, height: 3,
          background: i % 3 === 2 ? '#b8e898' : '#fef3c7',
          boxShadow: i % 3 === 2 ? '0 0 8px 4px rgba(184,232,152,0.7)' : '0 0 8px 4px rgba(254,243,199,0.8)',
          animation: `wfa-firefly ${3.5 + (i % 4) * 0.6}s ease-in-out infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(4,10,4,0.55) 100%)',
      }} />
    </>
  );
}

function WinterAtmo() {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(186,230,253,0.1) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(168,136,216,0.08) 0%, transparent 35%), radial-gradient(ellipse at 80% 15%, rgba(104,212,192,0.07) 0%, transparent 30%)',
      }} />
      {/* Aurora ribbons */}
      {(['rgba(168,136,216,0.12)', 'rgba(104,212,192,0.09)', 'rgba(124,196,232,0.08)'] as const).map((color, i) => (
        <div key={i} className="absolute" style={{
          left: 0, right: 0, top: `${6 + i * 10}%`, height: 70,
          background: `linear-gradient(90deg, transparent, ${color} 35%, ${color} 65%, transparent)`,
          filter: 'blur(18px)',
          animation: `wfa-fog ${15 + i * 4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 2.5}s`,
        }} />
      ))}
      <Silhouette d={M_FAR} fill="#172638" />
      <Silhouette d={M_NEAR} fill="#0c1a28" />
      <div className="absolute bottom-0 w-full h-28" style={{
        background: 'linear-gradient(to top, rgba(124,196,232,0.08) 0%, rgba(168,136,216,0.04) 50%, transparent 100%)',
        animation: 'wfa-fog 20s ease-in-out infinite alternate',
      }} />
      {SNOWFLAKES.map(([l, d, size], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: -10, width: size * 3, height: size * 3,
          background: i % 4 === 3 ? 'rgba(168,136,216,0.8)' : 'rgba(255,255,255,0.75)',
          animation: `wfa-snow ${6 + (i % 5) * 1.2}s linear infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(4,10,22,0.55) 100%)',
      }} />
    </>
  );
}

function WitchAtmo() {
  return (
    <>
      {/* Moon disc */}
      <div className="absolute rounded-full" style={{
        top: '8%', right: '12%', width: 72, height: 72,
        background: 'radial-gradient(circle at 40% 36%, #fff 0%, #e9d5ff 60%, #c084fc 100%)',
        boxShadow: '0 0 60px 30px rgba(192,132,252,0.3), 0 0 120px 60px rgba(168,85,247,0.14)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 88% 8%, rgba(192,132,252,0.1) 0%, transparent 50%), radial-gradient(ellipse at 15% 20%, rgba(88,212,192,0.08) 0%, transparent 40%), radial-gradient(ellipse at 50% 60%, rgba(232,144,184,0.05) 0%, transparent 40%)',
      }} />
      <Silhouette d={W_BASE} fill="#0a0018" />
      <div className="absolute bottom-0 w-full h-40" style={{
        background: 'linear-gradient(to top, rgba(88,28,135,0.18) 0%, rgba(56,188,176,0.06) 50%, transparent 100%)',
        animation: 'wfa-fog 14s ease-in-out infinite alternate',
      }} />
      {/* Purple wisps */}
      {WISPS.map(([l, t, d, color], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: `${t}%`,
          width: 8 + (i % 3) * 4, height: 8 + (i % 3) * 4,
          background: color as string, filter: 'blur(6px)',
          boxShadow: `0 0 20px 10px ${color}66`,
          animation: `wfa-wisp ${4 + (i % 3) * 0.8}s ease-in-out infinite`,
          animationDelay: `${d as number}s`,
        }} />
      ))}
      {/* Teal arcane wisps */}
      {([[25,58,0.6,'#58d4c0'],[62,44,1.8,'#40c8b0'],[78,62,0.3,'#50dccc']] as [number,number,number,string][]).map(([l,t,d,color], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: `${t}%`,
          width: 6 + (i % 2) * 4, height: 6 + (i % 2) * 4,
          background: color, filter: 'blur(5px)',
          boxShadow: `0 0 16px 8px ${color}55`,
          animation: `wfa-wisp ${4.5 + i * 0.9}s ease-in-out infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      {RUNES.map((rune, i) => (
        <div key={i} className="absolute select-none font-bold" style={{
          left: `${RUNE_POS[i][0]}%`, top: `${RUNE_POS[i][1]}%`,
          fontSize: 20 + (i % 3) * 6,
          color: i % 2 === 0 ? 'rgba(192,132,252,0.16)' : 'rgba(88,212,192,0.14)',
          textShadow: i % 2 === 0 ? '0 0 14px rgba(168,85,247,0.45)' : '0 0 14px rgba(88,212,192,0.4)',
          animation: `wfa-fog ${9 + i * 1.3}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.8}s`,
        }}>{rune}</div>
      ))}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 18%, rgba(8,1,18,0.62) 100%)',
      }} />
    </>
  );
}

function ElvenAtmo() {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 50%), radial-gradient(ellipse at 18% 5%, rgba(253,224,71,0.07) 0%, transparent 35%), radial-gradient(ellipse at 82% 10%, rgba(120,216,144,0.07) 0%, transparent 30%)',
      }} />
      {/* Light rays */}
      {[15, 30, 50, 68, 84].map((l, i) => (
        <div key={i} className="absolute top-0" style={{
          left: `${l}%`, width: 70, height: '75%',
          background: i % 2 === 0
            ? 'linear-gradient(to bottom, rgba(253,224,71,0.10), transparent)'
            : 'linear-gradient(to bottom, rgba(120,216,144,0.07), transparent)',
          transform: `rotate(${-8 + i * 4}deg) translateX(-50%)`,
          transformOrigin: 'top center',
          filter: 'blur(20px)',
          animation: `wfa-ray ${4 + i * 0.7}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }} />
      ))}
      {/* Ancient tree trunks */}
      {ELVEN_TRUNKS.map(([lp, hp, w], i) => (
        <div key={i} className="absolute bottom-0" style={{
          left: `${lp}%`, width: w, height: `${hp}%`,
          background: 'linear-gradient(to top, #1a0f00 0%, #0c0700 55%, rgba(8,5,0,0.5) 100%)',
          transform: 'translateX(-50%)',
          borderRadius: '60% 60% 0 0 / 3% 3% 0 0',
        }} />
      ))}
      {/* Ground glows — gold + emerald alternating */}
      {[15, 35, 55, 75].map((l, i) => (
        <div key={i} className="absolute bottom-0" style={{
          left: `${l}%`, width: 140, height: 100,
          background: i % 2 === 0
            ? `radial-gradient(ellipse at 50% 100%, rgba(232,192,80,0.15) 0%, transparent 70%)`
            : `radial-gradient(ellipse at 50% 100%, rgba(120,216,144,0.12) 0%, transparent 70%)`,
          transform: 'translateX(-50%)',
        }} />
      ))}
      {/* Dawn horizon glow */}
      <div className="absolute bottom-0 w-full h-16" style={{
        background: 'linear-gradient(to top, rgba(232,168,112,0.07) 0%, transparent 100%)',
      }} />
      {/* Gold + green motes */}
      {MOTES.map(([l, t, d], i) => (
        <div key={i} className="absolute rounded-full" style={{
          left: `${l}%`, top: `${t}%`, width: 3, height: 3,
          background: i % 3 === 2 ? '#90e8b0' : '#fde68a',
          boxShadow: i % 3 === 2 ? '0 0 6px 3px rgba(120,216,144,0.7)' : '0 0 6px 3px rgba(253,224,71,0.75)',
          animation: `wfa-mote ${5 + (i % 4) * 0.8}s ease-in-out infinite`,
          animationDelay: `${d}s`,
        }} />
      ))}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(14,8,0,0.6) 100%)',
      }} />
    </>
  );
}

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
