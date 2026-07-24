import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type DetectorState = {
  phase: 'up' | 'down';
  rep: boolean;
  feedback: string;
  metric: number | null;
  metricLabel: string;
  formScore: number; // 0..100, contributes to accuracy
};

export type Detector = {
  detect: (landmarks: NormalizedLandmark[]) => DetectorState;
  reset: () => void;
};

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32],
];

export const KEY_LANDMARKS = [
  11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
];

export function angleBetween(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.hypot(ab.x, ab.y);
  const magCb = Math.hypot(cb.x, cb.y);
  if (magAb === 0 || magCb === 0) return 180;
  const cos = Math.max(-1, Math.min(1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function visible(lm: NormalizedLandmark | undefined, threshold = 0.5): boolean {
  return !!lm && (lm.visibility ?? 0) >= threshold;
}

function avg(...vals: number[]): number {
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// ----- SQUAT V2 -----
export function createSquatDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  const HIST = 5;
  const VIS = 0.7;
  // Knee angle thresholds
  const KNEE_DOWN = 105;   // at or below = valid bottom
  const KNEE_UP   = 162;   // at or above = valid stand
  // Hip angle (hip-knee-ankle) thresholds
  const HIP_DOWN  = 110;   // hip flexed at bottom
  const HIP_UP    = 160;   // hip extended at stand

  let kneeHist: number[] = [], hipHist: number[] = [];

  function pushSmooth(hist: number[], val: number): number {
    hist.push(val);
    if (hist.length > HIST) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lHip = lm[23], lKnee = lm[25], lAnkle = lm[27];
      const rHip = lm[24], rKnee = lm[26], rAnkle = lm[28];
      const lShoulder = lm[11], rShoulder = lm[12];

      if (![lHip, lKnee, lAnkle, rHip, rKnee, rAnkle].every(v => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Step back — show your full lower body clearly', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }

      // Use best-confidence side for primary angles
      const lVis = Math.min(lHip.visibility ?? 0, lKnee.visibility ?? 0, lAnkle.visibility ?? 0);
      const rVis = Math.min(rHip.visibility ?? 0, rKnee.visibility ?? 0, rAnkle.visibility ?? 0);
      const useLeft = lVis >= rVis;

      const kneeRaw = useLeft
        ? angleBetween(lHip, lKnee, lAnkle)
        : angleBetween(rHip, rKnee, rAnkle);
      const hipRaw = useLeft
        ? angleBetween(lShoulder && (lShoulder.visibility ?? 0) >= VIS ? lShoulder : lHip, lHip, lKnee)
        : angleBetween(rShoulder && (rShoulder.visibility ?? 0) >= VIS ? rShoulder : rHip, rHip, rKnee);

      const knee = pushSmooth(kneeHist, kneeRaw);
      const hip  = pushSmooth(hipHist,  hipRaw);

      let formScore = 90;
      let feedback = '';

      // Torso lean check using shoulder vs hip Y
      if (lShoulder && rShoulder && (lShoulder.visibility ?? 0) >= VIS && (rShoulder.visibility ?? 0) >= VIS) {
        const shoulderY = avg(lShoulder.y, rShoulder.y);
        const hipY = avg(lHip.y, rHip.y);
        if (shoulderY > hipY + 0.05) {
          formScore -= 20;
          feedback = 'Keep your chest up — don\'t lean forward';
        }
      }

      // Knee cave check: knees should stay outside ankles in X
      const kneeWidth  = Math.abs(lKnee.x - rKnee.x);
      const ankleWidth = Math.abs(lAnkle.x - rAnkle.x);
      if (kneeWidth < ankleWidth * 0.7 && phase === 'down') {
        formScore -= 15;
        feedback = feedback || 'Push your knees out';
      }

      let rep = false;
      if (phase === 'up' && knee <= KNEE_DOWN && hip <= HIP_DOWN) {
        phase = 'down';
        feedback = feedback || 'Good depth — drive up through your heels';
      } else if (phase === 'down' && knee >= KNEE_UP && hip >= HIP_UP) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Nice rep!';
      } else if (phase === 'up') {
        feedback = feedback || (knee < 140 ? 'Keep going down' : 'Lower your squat — aim for parallel');
      } else {
        feedback = feedback || 'Stand tall — fully extend your hips and knees';
      }

      return { phase, rep, feedback, metric: Math.round(knee), metricLabel: 'Knee angle', formScore };
    },
    reset() { phase = 'up'; kneeHist = []; hipHist = []; },
  };
}

// ----- PUSH-UP V2 -----
export function createPushupDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  const HIST = 5;
  const VIS = 0.7;
  const DOWN = 95;
  const UP = 160;  // Must fully lock out before next rep
  const HIP_SAG_THRESHOLD = 0.12;  // Tighter hip alignment

  let elbowHist: number[] = [];

  function pushSmooth(hist: number[], val: number): number {
    hist.push(val);
    if (hist.length > HIST) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];

      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Position so your arms are visible', metric: null, metricLabel: 'Elbow angle', formScore: 0 };
      }

      const leftAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rightAngle = angleBetween(rShoulder, rElbow, rWrist);
      const elbowRaw = avg(leftAngle, rightAngle);
      const elbow = pushSmooth(elbowHist, elbowRaw);

      let formScore = 90;
      let feedback = '';

      // Hip sag/pike validation — tighter threshold
      if (lHip && rHip && (lHip.visibility ?? 0) >= VIS && (rHip.visibility ?? 0) >= VIS) {
        const shoulderY = avg(lShoulder.y, rShoulder.y);
        const hipY = avg(lHip.y, rHip.y);
        const sagDev = Math.abs(shoulderY - hipY);

        if (sagDev > HIP_SAG_THRESHOLD) {
          formScore -= 30;
          feedback = hipY > shoulderY ? 'Hips sagging — engage your core' : 'Lower your hips — body must be straight';
        }
      }

      // Knee bend check (if knees are visible, they should be extended)
      if (lKnee && rKnee && (lKnee.visibility ?? 0) >= VIS && (rKnee.visibility ?? 0) >= VIS) {
        const lKneeAngle = angleBetween(lHip!, lKnee, lm[27]!);
        const rKneeAngle = angleBetween(rHip!, rKnee, lm[28]!);
        if (Math.min(lKneeAngle, rKneeAngle) < 155) {
          formScore -= 20;
          feedback = feedback || 'Straighten your legs — no knee bending';
        }
      }

      let rep = false;
      if (phase === 'up' && elbow < DOWN) {
        phase = 'down';
        feedback = feedback || 'Good depth — push back up';
      } else if (phase === 'down' && elbow > UP) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Perfect rep!';
      } else if (phase === 'up') {
        feedback = feedback || (elbow >= UP ? 'Lower your chest to the floor' : 'Keep going down');
      } else {
        feedback = feedback || 'Lock out your elbows at the top';
      }

      return { phase, rep, feedback, metric: Math.round(elbow), metricLabel: 'Elbow angle', formScore };
    },
    reset() {
      phase = 'up';
      elbowHist = [];
    },
  };
}

// ----- JUMPING JACK V2 -----
export function createJumpingJackDetector(): Detector {
  let phase: 'up' | 'down' = 'down'; // down = arms at sides
  const VIS = 0.7;
  const ARM_ELEVATION_THRESHOLD = 0.08;  // Stricter: wrists must be well above shoulders
  const LEG_SPREAD_MULTIPLIER = 1.5;     // Stricter: ankles significantly wider than hips

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lWrist = lm[15], rWrist = lm[16];
      const lAnkle = lm[27], rAnkle = lm[28];
      const lHip = lm[23], rHip = lm[24];

      if (![lShoulder, rShoulder, lWrist, rWrist, lAnkle, rAnkle, lHip, rHip].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Stand back so your full body is visible', metric: null, metricLabel: 'Spread', formScore: 0 };
      }

      // Stricter arm check: wrists must be well above shoulders (y decreases upward)
      const lArmUp = lWrist.y < lShoulder.y - ARM_ELEVATION_THRESHOLD;
      const rArmUp = rWrist.y < rShoulder.y - ARM_ELEVATION_THRESHOLD;
      const armsUp = lArmUp && rArmUp;

      // Stricter leg spread: ankles must be significantly wider than hips
      const hipDist = Math.abs(lHip.x - rHip.x);
      const ankleDist = Math.abs(lAnkle.x - rAnkle.x);
      const legsApart = ankleDist > hipDist * LEG_SPREAD_MULTIPLIER;

      const isUp = armsUp && legsApart;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && isUp) {
        phase = 'up';
        feedback = 'Good — bring it back together';
      } else if (phase === 'up' && !armsUp && !legsApart) {
        phase = 'down';
        rep = true;
        feedback = 'Nice rep!';
      } else if (phase === 'down') {
        if (!armsUp && !legsApart) feedback = 'Jump — arms overhead, legs wide';
        else if (!armsUp) feedback = 'Raise your arms higher';
        else feedback = 'Spread your legs wider';
      } else {
        if (armsUp && !legsApart) feedback = 'Bring your legs together';
        else if (!armsUp && legsApart) feedback = 'Lower your arms';
        else feedback = 'Return to starting position';
      }

      const formScore = isUp || (!armsUp && !legsApart) ? 90 : 70;
      const spread = Math.round((ankleDist / Math.max(hipDist, 0.01)) * 100);
      return { phase, rep, feedback, metric: spread, metricLabel: 'Stance %', formScore };
    },
    reset() {
      phase = 'down';
    },
  };
}

// ----- PULL-UP -----
export function createPullupDetector(): Detector {
  let phase: 'up' | 'down' = 'down';

  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const nose = lm[0];

      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist, nose].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Make sure your upper body is visible', metric: null, metricLabel: 'Elbow angle', formScore: 0 };
      }

      const leftAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rightAngle = angleBetween(rShoulder, rElbow, rWrist);
      const elbow = avg(leftAngle, rightAngle);

      // Up = chin near or above wrists
      const wristY = avg(lWrist.y, rWrist.y);
      const chinUp = nose.y < wristY + 0.05;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && chinUp && elbow < 90) {
        phase = 'up';
        feedback = 'Top — lower with control';
      } else if (phase === 'up' && elbow > 155) {
        phase = 'down';
        rep = true;
        feedback = 'Nice rep';
      } else if (phase === 'down') {
        feedback = elbow > 100 ? 'Pull yourself up' : 'Keep going — chin to bar';
      } else {
        feedback = 'Lower until arms are straight';
      }

      const formScore = 90;
      return { phase, rep, feedback, metric: Math.round(elbow), metricLabel: 'Elbow angle', formScore };
    },
    reset() {
      phase = 'down';
    },
  };
}

// ----- PLANK V2 (timed — form-gated timer) -----
// formScore > 0 only while alignment is valid; the session tick is gated on formScore.
export function createPlankDetector(): Detector {
  const HIST = 5;
  const VIS = 0.7;
  const SAG_THRESHOLD = 0.04;   // hip too low relative to shoulder-ankle midpoint
  const PIKE_THRESHOLD = 0.04;  // hip too high
  const STANDING_THRESHOLD = 0.25; // shoulder-to-ankle vertical span too small = not in plank

  let sHist: number[] = [], hHist: number[] = [], aHist: number[] = [];

  function pushSmooth(hist: number[], val: number, size: number): number {
    hist.push(val);
    if (hist.length > size) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lAnkle, rAnkle].every(
        v => v && (v.visibility ?? 0) >= VIS
      )) {
        return { phase: 'up', rep: false, feedback: 'Get into plank — show your full body clearly', metric: null, metricLabel: 'Alignment', formScore: 0 };
      }

      const rawShoulderY = avg(lShoulder.y, rShoulder.y);
      const rawHipY     = avg(lHip.y, rHip.y);
      const rawAnkleY   = avg(lAnkle.y, rAnkle.y);

      const shoulderY = pushSmooth(sHist, rawShoulderY, HIST);
      const hipY      = pushSmooth(hHist, rawHipY,      HIST);
      const ankleY    = pushSmooth(aHist, rawAnkleY,    HIST);

      // Reject if the body is roughly vertical (person is standing, not planking)
      const verticalSpan = Math.abs(shoulderY - ankleY);
      if (verticalSpan < STANDING_THRESHOLD) {
        return { phase: 'up', rep: false, feedback: 'Get into plank position — face the camera sideways', metric: null, metricLabel: 'Alignment', formScore: 0 };
      }

      const midlineY = avg(shoulderY, ankleY);
      const dev = hipY - midlineY; // positive = sagging, negative = piking
      const sagging = dev > SAG_THRESHOLD;
      const piking  = dev < -PIKE_THRESHOLD;

      // Knee validation: knees should be roughly in line (not bent)
      let kneeBreak = false;
      if (lKnee && rKnee && (lKnee.visibility ?? 0) >= VIS && (rKnee.visibility ?? 0) >= VIS) {
        const kneeY = avg(lKnee.y, rKnee.y);
        // Knees should lie on the shoulder-ankle line ± tolerance
        const expectedKneeY = shoulderY + (ankleY - shoulderY) * 0.5;
        kneeBreak = Math.abs(kneeY - expectedKneeY) > 0.12;
      }

      const alignment = Math.max(0, Math.round(100 - Math.abs(dev) * 1200));

      if (sagging) return { phase: 'up', rep: false, feedback: 'Hips are sagging — squeeze your core and lift', metric: alignment, metricLabel: 'Alignment', formScore: 0 };
      if (piking)  return { phase: 'up', rep: false, feedback: 'Lower your hips — body must be a straight line', metric: alignment, metricLabel: 'Alignment', formScore: 0 };
      if (kneeBreak) return { phase: 'up', rep: false, feedback: 'Straighten your legs — no bending the knees', metric: alignment, metricLabel: 'Alignment', formScore: 0 };

      return { phase: 'up', rep: false, feedback: 'Perfect plank — hold it!', metric: alignment, metricLabel: 'Alignment', formScore: alignment > 60 ? alignment : 0 };
    },
    reset() { sHist = []; hHist = []; aHist = []; },
  };
}

// ----- LUNGE V2 -----
export function createLungeDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  const VIS = 0.7;
  const HIST = 5;
  let kneeHist: number[] = [];

  function pushSmooth(hist: number[], val: number): number {
    hist.push(val);
    if (hist.length > HIST) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lHip = lm[23], lKnee = lm[25], lAnkle = lm[27];
      const rHip = lm[24], rKnee = lm[26], rAnkle = lm[28];

      if (![lHip, lKnee, lAnkle, rHip, rKnee, rAnkle].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Show your full lower body', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }

      const lAngle = angleBetween(lHip, lKnee, lAnkle);
      const rAngle = angleBetween(rHip, rKnee, rAnkle);
      const minAngleRaw = Math.min(lAngle, rAngle);
      const minAngle = pushSmooth(kneeHist, minAngleRaw);

      let rep = false;
      let feedback = '';
      let formScore = 90;

      // Validate both knees are properly positioned
      // Front knee should be ~90°, back knee should drop low
      const lLow = lAngle < 110;
      const rLow = rAngle < 110;
      const bothKneesEngaged = (lLow && rAngle > 140) || (rLow && lAngle > 140);

      // Check if both knees are at valid lunge depth
      const validDepth = minAngle < 110;

      // Standing position: both knees extended
      const standing = lAngle > 155 && rAngle > 155;

      // Form validation: ensure front knee doesn't collapse inward (check X position)
      const kneeWidth = Math.abs(lKnee.x - rKnee.x);
      const ankleWidth = Math.abs(lAnkle.x - rAnkle.x);
      if (kneeWidth < ankleWidth * 0.6 && validDepth) {
        formScore -= 20;
        feedback = 'Keep your front knee aligned over your ankle';
      }

      if (phase === 'up' && validDepth) {
        phase = 'down';
        feedback = feedback || 'Good depth — drive back up through your front heel';
      } else if (phase === 'down' && standing) {
        phase = 'up';
        rep = true;
        feedback = 'Perfect lunge!';
      } else if (phase === 'up') {
        feedback = feedback || 'Step forward and lower your back knee';
      } else {
        feedback = feedback || 'Push through your front heel to stand';
      }

      return { phase, rep, feedback, metric: Math.round(minAngle), metricLabel: 'Knee angle', formScore };
    },
    reset() {
      phase = 'up';
      kneeHist = [];
    },
  };
}

// ----- GLUTE BRIDGE V2 -----
export function createGluteBridgeDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  const VIS = 0.7;
  const HIST = 5;
  let hipAngleHist: number[] = [];

  function pushSmooth(hist: number[], val: number): number {
    hist.push(val);
    if (hist.length > HIST) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Lie on your back and show full body from the side', metric: null, metricLabel: 'Hip angle', formScore: 0 };
      }

      // Hip angle validation: shoulder-hip-knee angle
      const lHipAngle = angleBetween(lShoulder, lHip, lKnee);
      const rHipAngle = angleBetween(rShoulder, rHip, rKnee);
      const rawHipAngle = avg(lHipAngle, rHipAngle);
      const hipAngle = pushSmooth(hipAngleHist, rawHipAngle);

      // Lift metric based on hip Y position relative to shoulder-ankle baseline
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = avg(lAnkle.y, rAnkle.y);
      const lift = avg(shoulderY, ankleY) - hipY; // positive = hip above baseline

      let rep = false;
      let feedback = '';

      // Bridge position: hips lifted + hip angle extended (>150°)
      const bridgeUp = lift > 0.06 && hipAngle > 150;

      // Floor position: hips at or below baseline + hip angle flexed (<140°)
      const onFloor = lift < 0.02 && hipAngle < 140;

      if (phase === 'down' && bridgeUp) {
        phase = 'up';
        feedback = 'Squeeze at the top — hold it!';
      } else if (phase === 'up' && onFloor) {
        phase = 'down';
        rep = true;
        feedback = 'Perfect bridge! Go again';
      } else if (phase === 'down') {
        feedback = 'Drive hips up toward the ceiling';
      } else {
        feedback = 'Lower hips back to the floor with control';
      }

      const formScore = bridgeUp ? 90 : (onFloor ? 85 : 75);
      return { phase, rep, feedback, metric: Math.round(hipAngle), metricLabel: 'Hip angle', formScore };
    },
    reset() {
      phase = 'down';
      hipAngleHist = [];
    },
  };
}

// ----- MOUNTAIN CLIMBER V2 -----
export function createMountainClimberDetector(): Detector {
  let phase: 'up' | 'down' = 'up'; // up = knee extended back
  let lastTuckedLeg: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const PLANK_SAG_THRESHOLD = 0.08;

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Show your full body in plank position', metric: null, metricLabel: 'Knee drive', formScore: 0 };
      }

      // Plank alignment validation
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = lAnkle && rAnkle && (lAnkle.visibility ?? 0) >= VIS && (rAnkle.visibility ?? 0) >= VIS
        ? avg(lAnkle.y, rAnkle.y)
        : hipY; // fallback if ankles not visible

      const midlineY = avg(shoulderY, ankleY);
      const hipDeviation = Math.abs(hipY - midlineY);

      let formScore = 90;
      let feedback = '';

      if (hipDeviation > PLANK_SAG_THRESHOLD) {
        formScore -= 20;
        feedback = hipY > midlineY ? 'Keep hips level — don\'t sag' : 'Lower hips — maintain plank';
      }

      const lTucked = lKnee.y < hipY - 0.08;
      const rTucked = rKnee.y < hipY - 0.08;
      const anyTucked = lTucked || rTucked;

      let rep = false;

      if (phase === 'up' && anyTucked) {
        const currentLeg = lTucked ? 'left' : 'right';

        // Enforce alternation
        if (lastTuckedLeg === currentLeg) {
          feedback = feedback || 'Switch legs — alternate the drive';
        } else {
          phase = 'down';
          lastTuckedLeg = currentLeg;
          feedback = feedback || 'Drive — switch legs!';
        }
      } else if (phase === 'down' && !anyTucked) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Rep! Keep the pace';
      } else if (phase === 'up') {
        feedback = feedback || 'Drive your knee toward your chest';
      } else {
        feedback = feedback || 'Extend back, switch legs';
      }

      const metric = Math.round(Math.max(hipY - lKnee.y, hipY - rKnee.y) * 100);
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee drive', formScore };
    },
    reset() {
      phase = 'up';
      lastTuckedLeg = null;
    },
  };
}

// ----- WALL SIT V2 (timed — form-gated timer) -----
export function createWallSitDetector(): Detector {
  const HIST = 5;
  const VIS = 0.7;
  const KNEE_MIN = 75;   // below this = too deep
  const KNEE_MAX = 105;  // above this = standing too high

  let lKneeHist: number[] = [], rKneeHist: number[] = [];
  let lHipHist: number[] = [],  rHipHist: number[] = [];

  function pushSmooth(hist: number[], val: number): number {
    hist.push(val);
    if (hist.length > HIST) hist.shift();
    return hist.reduce((s, v) => s + v, 0) / hist.length;
  }

  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];
      const lShoulder = lm[11], rShoulder = lm[12];

      if (![lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every(
        v => v && (v.visibility ?? 0) >= VIS
      )) {
        return { phase: 'down', rep: false, feedback: 'Show full lower body — back against the wall', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }

      const lKneeAngle = angleBetween(lHip, lKnee, lAnkle);
      const rKneeAngle = angleBetween(rHip, rKnee, rAnkle);

      const smoothLKnee = pushSmooth(lKneeHist, lKneeAngle);
      const smoothRKnee = pushSmooth(rKneeHist, rKneeAngle);
      const knee = avg(smoothLKnee, smoothRKnee);

      // Hip height check: hips should be roughly level with or below the knees (seated position).
      // In a wall sit from a side view, hipY should be >= kneeY (hips at or lower than knees in pixel coords).
      const smoothLHipY = pushSmooth(lHipHist, lHip.y);
      const smoothRHipY = pushSmooth(rHipHist, rHip.y);
      const hipY  = avg(smoothLHipY, smoothRHipY);
      const kneeY = avg(lKnee.y, rKnee.y);
      // In MediaPipe, y increases downward; hips seated = hipY > kneeY is normal for side view.
      // Standing = hipY < kneeY noticeably. Guard: if hips are clearly above knee level, person stood up.
      const hipsAboveKnees = hipY < kneeY - 0.08;

      // Shoulder check: back should be fairly upright (not bent forward)
      let torsoCollapsed = false;
      if (lShoulder && rShoulder && (lShoulder.visibility ?? 0) >= VIS && (rShoulder.visibility ?? 0) >= VIS) {
        const shoulderY = avg(lShoulder.y, rShoulder.y);
        // Shoulder should be well above hip in y (y increases downward, so shoulderY < hipY)
        torsoCollapsed = shoulderY > hipY - 0.05;
      }

      if (hipsAboveKnees) {
        return { phase: 'down', rep: false, feedback: 'Sit back down — lower your hips to 90°', metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 0 };
      }
      if (torsoCollapsed) {
        return { phase: 'down', rep: false, feedback: 'Keep your back straight against the wall', metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 0 };
      }
      if (knee > KNEE_MAX) {
        return { phase: 'down', rep: false, feedback: 'Sink lower — aim for a 90° knee angle', metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 0 };
      }
      if (knee < KNEE_MIN) {
        return { phase: 'down', rep: false, feedback: 'Rise slightly — knee angle is too sharp', metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 0 };
      }

      const quality = Math.round(100 - Math.abs(knee - 90) * 2);
      return { phase: 'down', rep: false, feedback: 'Good wall sit — hold strong!', metric: Math.round(knee), metricLabel: 'Knee angle', formScore: Math.max(70, quality) };
    },
    reset() { lKneeHist = []; rKneeHist = []; lHipHist = []; rHipHist = []; },
  };
}

// ----- HIGH KNEES V2 -----
export function createHighKneesDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  let lastRaisedLeg: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const HEIGHT_THRESHOLD = 0.08;  // Stricter: knee must be well above hip

  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];

      if (![lHip, rHip, lKnee, rKnee].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Stand back so hips and knees are visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }

      // y increases downward — knee above hip = lower y
      const lHigh = lKnee.y < lHip.y - HEIGHT_THRESHOLD;
      const rHigh = rKnee.y < rHip.y - HEIGHT_THRESHOLD;
      const anyHigh = lHigh || rHigh;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && anyHigh) {
        // Determine which leg was raised
        const currentLeg = lHigh ? 'left' : 'right';

        // Check alternation: if this is the same leg as last time, don't count it yet
        if (lastRaisedLeg === currentLeg) {
          feedback = 'Switch legs — alternate each knee';
        } else {
          phase = 'up';
          lastRaisedLeg = currentLeg;
          feedback = 'Good — now the other knee!';
        }
      } else if (phase === 'up' && !anyHigh) {
        phase = 'down';
        rep = true;
        feedback = 'Nice! Keep alternating';
      } else if (phase === 'down') {
        feedback = 'Drive your knee up above your hip';
      } else {
        feedback = 'Plant and switch — other knee up';
      }

      const metric = Math.round(Math.max((lHip.y - lKnee.y) * 100, (rHip.y - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: anyHigh ? 90 : 80 };
    },
    reset() {
      phase = 'down';
      lastRaisedLeg = null;
    },
  };
}

// ----- BIRD DOG V2 -----
export function createBirdDogDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  const VIS = 0.7;
  const ARM_EXTENSION_THRESHOLD = 155;
  const LEG_EXTENSION_THRESHOLD = 155;

  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist, lHip, rHip, lKnee, rKnee].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Show your full body from the side in tabletop position', metric: null, metricLabel: 'Extension', formScore: 0 };
      }

      // Arm extension angles
      const lArmAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rArmAngle = angleBetween(rShoulder, rElbow, rWrist);

      // Leg extension angles (hip-knee-ankle)
      let lLegAngle = 0, rLegAngle = 0;
      if (lAnkle && (lAnkle.visibility ?? 0) >= VIS) {
        lLegAngle = angleBetween(lHip, lKnee, lAnkle);
      }
      if (rAnkle && (rAnkle.visibility ?? 0) >= VIS) {
        rLegAngle = angleBetween(rHip, rKnee, rAnkle);
      }

      // Check for opposite arm-leg extension
      const lArmExtended = lArmAngle > ARM_EXTENSION_THRESHOLD;
      const rArmExtended = rArmAngle > ARM_EXTENSION_THRESHOLD;
      const lLegExtended = lLegAngle > LEG_EXTENSION_THRESHOLD;
      const rLegExtended = rLegAngle > LEG_EXTENSION_THRESHOLD;

      // Valid bird dog: one arm extended AND opposite leg extended
      const leftArmRightLeg = lArmExtended && rLegExtended;
      const rightArmLeftLeg = rArmExtended && lLegExtended;
      const validExtension = leftArmRightLeg || rightArmLeftLeg;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && validExtension) {
        phase = 'up';
        feedback = 'Hold — keep balance and extend opposite limbs';
      } else if (phase === 'up' && !validExtension) {
        phase = 'down';
        rep = true;
        feedback = 'Rep! Switch to the other side';
      } else if (phase === 'down') {
        if (lArmExtended || rArmExtended) {
          feedback = 'Good arm — now extend the opposite leg straight back';
        } else if (lLegExtended || rLegExtended) {
          feedback = 'Good leg — now extend the opposite arm straight out';
        } else {
          feedback = 'Extend opposite arm and leg simultaneously';
        }
      } else {
        feedback = 'Return to tabletop, then switch sides';
      }

      const maxArmExt = Math.max(lArmAngle, rArmAngle);
      const maxLegExt = Math.max(lLegAngle, rLegAngle);
      const formScore = validExtension ? 90 : (maxArmExt > ARM_EXTENSION_THRESHOLD || maxLegExt > LEG_EXTENSION_THRESHOLD ? 75 : 60);

      return { phase, rep, feedback, metric: Math.round(Math.min(maxArmExt, maxLegExt || maxArmExt)), metricLabel: 'Extension', formScore };
    },
    reset() {
      phase = 'down';
    },
  };
}

// ----- DEAD BUG V2 -----
export function createDeadBugDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  let lastExtendedSide: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const EXTENSION_THRESHOLD = 140;

  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist, lHip, rHip, lKnee, rKnee].every((v) => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Lie on your back and show arms and legs clearly', metric: null, metricLabel: 'Extension', formScore: 0 };
      }

      // Arm extension angles
      const lArmAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rArmAngle = angleBetween(rShoulder, rElbow, rWrist);

      // Leg extension angles (correct calculation: hip-knee-ankle, not shoulder-hip-knee)
      let lLegAngle = 0, rLegAngle = 0;
      if (lAnkle && (lAnkle.visibility ?? 0) >= VIS) {
        lLegAngle = angleBetween(lHip, lKnee, lAnkle);
      }
      if (rAnkle && (rAnkle.visibility ?? 0) >= VIS) {
        rLegAngle = angleBetween(rHip, rKnee, rAnkle);
      }

      // Check extensions
      const lArmExtended = lArmAngle > EXTENSION_THRESHOLD;
      const rArmExtended = rArmAngle > EXTENSION_THRESHOLD;
      const lLegExtended = lLegAngle > EXTENSION_THRESHOLD;
      const rLegExtended = rLegAngle > EXTENSION_THRESHOLD;

      // Valid dead bug: opposite arm and leg extended (left arm + right leg OR right arm + left leg)
      const leftArmRightLeg = lArmExtended && rLegExtended;
      const rightArmLeftLeg = rArmExtended && lLegExtended;
      const extended = leftArmRightLeg || rightArmLeftLeg;

      let rep = false;
      let feedback = '';

      if (phase === 'up' && extended) {
        const currentSide = leftArmRightLeg ? 'left' : 'right';

        // Enforce alternation
        if (lastExtendedSide === currentSide) {
          feedback = 'Switch sides — alternate opposite arm and leg';
        } else {
          phase = 'down';
          lastExtendedSide = currentSide;
          feedback = 'Extended — return to center';
        }
      } else if (phase === 'down' && !extended) {
        phase = 'up';
        rep = true;
        feedback = 'Rep! Switch to the other side';
      } else if (phase === 'up') {
        feedback = 'Extend opposite arm and leg toward the floor';
      } else {
        feedback = 'Bring arm and leg back to center';
      }

      const maxArmExt = Math.max(lArmAngle, rArmAngle);
      const maxLegExt = Math.max(lLegAngle, rLegAngle);
      const formScore = extended ? 90 : (maxArmExt > EXTENSION_THRESHOLD || maxLegExt > EXTENSION_THRESHOLD ? 75 : 60);

      return { phase, rep, feedback, metric: Math.round(Math.min(maxArmExt, maxLegExt || maxArmExt)), metricLabel: 'Extension', formScore };
    },
    reset() {
      phase = 'up';
      lastExtendedSide = null;
    },
  };
}

// ----- MARCH IN PLACE V2 -----
export function createMarchInPlaceDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  let lastRaisedLeg: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const HEIGHT_THRESHOLD = 0.05;  // Stricter than the old 0.02

  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];

      if (![lHip, rHip, lKnee, rKnee].every(v => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Stand back so hips and knees are visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }

      const hipY = avg(lHip.y, rHip.y);
      const lHigh = lKnee.y < hipY - HEIGHT_THRESHOLD;
      const rHigh = rKnee.y < hipY - HEIGHT_THRESHOLD;
      const anyHigh = lHigh || rHigh;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && anyHigh) {
        const currentLeg = lHigh ? 'left' : 'right';

        // Enforce alternation
        if (lastRaisedLeg === currentLeg) {
          feedback = 'Switch legs — alternate each step';
        } else {
          phase = 'up';
          lastRaisedLeg = currentLeg;
          feedback = 'Good march — keep the rhythm!';
        }
      } else if (phase === 'up' && !anyHigh) {
        phase = 'down';
        rep = true;
        feedback = 'Step! Other leg up';
      } else if (phase === 'down') {
        feedback = 'Lift your knees — start marching';
      } else {
        feedback = 'Keep the rhythm going';
      }

      const metric = Math.round(Math.max((hipY - lKnee.y) * 100, (hipY - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: anyHigh ? 88 : 75 };
    },
    reset() {
      phase = 'down';
      lastRaisedLeg = null;
    },
  };
}

// ----- HEEL RAISES -----
export function createHeelRaisesDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  return {
    detect(lm) {
      const lAnkle = lm[27], rAnkle = lm[28], lHeel = lm[29], rHeel = lm[30], lToe = lm[31], rToe = lm[32];
      if (![lAnkle, rAnkle, lHeel, rHeel, lToe, rToe].every(v => visible(v, 0.4))) {
        return { phase, rep: false, feedback: 'Stand with your feet visible at the bottom', metric: null, metricLabel: 'Heel lift', formScore: 0 };
      }
      const lift = avg(lToe.y - lHeel.y, rToe.y - rHeel.y);
      let rep = false, feedback = '';
      if (phase === 'down' && lift > 0.03) { phase = 'up'; feedback = 'Hold at the top'; }
      else if (phase === 'up' && lift < 0.01) { phase = 'down'; rep = true; feedback = 'Lower and rise again'; }
      else if (phase === 'down') { feedback = 'Rise up onto your toes'; }
      else { feedback = 'Lower heels back to the floor'; }
      return { phase, rep, feedback, metric: Math.round(lift * 100), metricLabel: 'Heel lift', formScore: 88 };
    },
    reset() { phase = 'down'; },
  };
}

// ----- ARM CIRCLES V2 (circular motion detection) -----
export function createArmCirclesDetector(): Detector {
  type CircleState = 'FRONT' | 'UP' | 'BACK' | 'DOWN';
  let leftState: CircleState = 'FRONT';
  let rightState: CircleState = 'FRONT';
  let leftHistory: { x: number; y: number }[] = [];
  let rightHistory: { x: number; y: number }[] = [];
  const HISTORY_SIZE = 5;
  const MIN_RADIUS = 0.12; // Minimum circle radius relative to shoulder span

  function smoothLandmark(current: NormalizedLandmark, history: { x: number; y: number }[]): { x: number; y: number } {
    history.push({ x: current.x, y: current.y });
    if (history.length > HISTORY_SIZE) history.shift();
    const avgX = history.reduce((sum, p) => sum + p.x, 0) / history.length;
    const avgY = history.reduce((sum, p) => sum + p.y, 0) / history.length;
    return { x: avgX, y: avgY };
  }

  function getQuadrant(wrist: { x: number; y: number }, shoulder: { x: number; y: number }): CircleState {
    const dx = wrist.x - shoulder.x;
    const dy = wrist.y - shoulder.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // FRONT: -45 to 45, UP: 45 to 135, BACK: 135 to -135, DOWN: -135 to -45
    if (angle >= -45 && angle < 45) return 'FRONT';
    if (angle >= 45 && angle < 135) return 'DOWN';
    if (angle >= 135 || angle < -135) return 'BACK';
    return 'UP';
  }

  function advanceState(current: CircleState, next: CircleState): { newState: CircleState; repComplete: boolean } {
    const progression: Record<CircleState, CircleState> = {
      FRONT: 'UP',
      UP: 'BACK',
      BACK: 'DOWN',
      DOWN: 'FRONT',
    };
    if (progression[current] === next) {
      const repComplete = current === 'DOWN' && next === 'FRONT';
      return { newState: next, repComplete };
    }
    return { newState: current, repComplete: false };
  }

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lElbow = lm[13], rElbow = lm[14];
      const lWrist = lm[15], rWrist = lm[16];
      const HIGH_VIS = 0.7;

      if (![lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist].every(v => v && (v.visibility ?? 0) >= HIGH_VIS)) {
        return { phase: 'up', rep: false, feedback: 'Step back — show full upper body clearly', metric: null, metricLabel: 'Circle quality', formScore: 0 };
      }

      // Smooth landmarks
      const smoothLeft = smoothLandmark(lWrist, leftHistory);
      const smoothRight = smoothLandmark(rWrist, rightHistory);

      // Check minimum radius (arms must be extended)
      const shoulderSpan = Math.abs(lShoulder.x - rShoulder.x);
      const leftRadius = Math.hypot(smoothLeft.x - lShoulder.x, smoothLeft.y - lShoulder.y);
      const rightRadius = Math.hypot(smoothRight.x - rShoulder.x, smoothRight.y - rShoulder.y);
      const minRequiredRadius = shoulderSpan * MIN_RADIUS;

      if (leftRadius < minRequiredRadius || rightRadius < minRequiredRadius) {
        return {
          phase: 'up', rep: false,
          feedback: 'Extend arms wider — make bigger circles',
          metric: Math.round(Math.min(leftRadius, rightRadius) * 100),
          metricLabel: 'Circle radius',
          formScore: 0,
        };
      }

      // Determine quadrants
      const leftQuad = getQuadrant(smoothLeft, lShoulder);
      const rightQuad = getQuadrant(smoothRight, rShoulder);

      // Advance state machines
      const leftResult = advanceState(leftState, leftQuad);
      const rightResult = advanceState(rightState, rightQuad);
      leftState = leftResult.newState;
      rightState = rightResult.newState;

      // Rep counted only when both arms complete a circle
      const rep = leftResult.repComplete && rightResult.repComplete;

      // Feedback based on synchronization
      let feedback = 'Keep rotating in full circles';
      if (leftState !== rightState) {
        feedback = 'Try to sync both arms';
      } else if (rep) {
        feedback = 'Perfect circle!';
      }

      // Form score based on radius and arm extension
      const armExtension = Math.min(leftRadius / minRequiredRadius, rightRadius / minRequiredRadius);
      const formScore = Math.min(100, Math.round(armExtension * 85));

      return {
        phase: 'up',
        rep,
        feedback,
        metric: Math.round(Math.min(leftRadius, rightRadius) * 100),
        metricLabel: 'Circle radius',
        formScore,
      };
    },
    reset() {
      leftState = 'FRONT';
      rightState = 'FRONT';
      leftHistory = [];
      rightHistory = [];
    },
  };
}

// ----- KNEE TO ELBOW V2 -----
export function createKneeToElbowDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  let lastRaisedLeg: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const KNEE_HEIGHT_THRESHOLD = 0.1;

  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lElbow = lm[13], rElbow = lm[14];

      if (![lHip, rHip, lKnee, rKnee, lElbow, rElbow].every(v => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Stand so your full body is visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }

      const hipY = avg(lHip.y, rHip.y);
      const lKneeHigh = lKnee.y < hipY - KNEE_HEIGHT_THRESHOLD;
      const rKneeHigh = rKnee.y < hipY - KNEE_HEIGHT_THRESHOLD;

      // Check proximity of knee to OPPOSITE elbow
      const lKneeToRElbow = Math.hypot(lKnee.x - rElbow.x, lKnee.y - rElbow.y);
      const rKneeToLElbow = Math.hypot(rKnee.x - lElbow.x, rKnee.y - lElbow.y);

      const PROXIMITY_THRESHOLD = 0.15;
      const lKneeToOppositeElbow = lKneeHigh && lKneeToRElbow < PROXIMITY_THRESHOLD;
      const rKneeToOppositeElbow = rKneeHigh && rKneeToLElbow < PROXIMITY_THRESHOLD;

      const crunch = lKneeToOppositeElbow || rKneeToOppositeElbow;

      let rep = false;
      let feedback = '';

      if (phase === 'up' && crunch) {
        const currentLeg = lKneeToOppositeElbow ? 'left' : 'right';

        // Enforce alternation
        if (lastRaisedLeg === currentLeg) {
          feedback = 'Switch sides — alternate each crunch';
        } else {
          phase = 'down';
          lastRaisedLeg = currentLeg;
          feedback = 'Touch — switch sides!';
        }
      } else if (phase === 'down' && !lKneeHigh && !rKneeHigh) {
        phase = 'up';
        rep = true;
        feedback = 'Rep! Drive the other knee';
      } else if (phase === 'up') {
        if (lKneeHigh || rKneeHigh) {
          feedback = 'Crunch your elbow to meet the opposite knee';
        } else {
          feedback = 'Drive knee up, crunch opposite elbow to meet it';
        }
      } else {
        feedback = 'Lower leg, switch sides';
      }

      const metric = Math.round(Math.max((hipY - lKnee.y) * 100, (hipY - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: crunch ? 90 : 80 };
    },
    reset() {
      phase = 'up';
      lastRaisedLeg = null;
    },
  };
}

// ----- PLANK KNEE TAPS V2 -----
export function createPlankKneeTapsDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  let lastTappedKnee: 'left' | 'right' | null = null;
  const VIS = 0.7;
  const PLANK_ALIGNMENT_THRESHOLD = 0.08;

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every(v => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Get into plank — show full body from the side', metric: null, metricLabel: 'Plank alignment', formScore: 0 };
      }

      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = avg(lAnkle.y, rAnkle.y);

      // Plank validation: hips should be aligned with shoulder-ankle midline
      const midlineY = avg(shoulderY, ankleY);
      const hipDeviation = Math.abs(hipY - midlineY);
      const inPlank = hipDeviation < PLANK_ALIGNMENT_THRESHOLD;

      // Knee tap detection: either knee drops significantly below hip line
      const lKneeDrop = lKnee.y > hipY + 0.06;
      const rKneeDrop = rKnee.y > hipY + 0.06;
      const kneeTapped = lKneeDrop || rKneeDrop;

      let rep = false;
      let feedback = '';
      let formScore = 90;

      if (!inPlank) {
        formScore -= 20;
        feedback = hipY > midlineY ? 'Keep hips level — don\'t sag' : 'Lower hips — maintain straight plank';
      }

      if (phase === 'up' && inPlank && kneeTapped) {
        const currentKnee = lKneeDrop ? 'left' : 'right';

        // Enforce alternation
        if (lastTappedKnee === currentKnee) {
          feedback = feedback || 'Switch knees — alternate each tap';
        } else {
          phase = 'down';
          lastTappedKnee = currentKnee;
          feedback = feedback || 'Tap! Lift back up';
        }
      } else if (phase === 'down' && !lKneeDrop && !rKneeDrop) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Rep! Tap the other knee';
      } else if (phase === 'up') {
        feedback = feedback || (inPlank ? 'Good plank — tap a knee to the floor' : 'Hold a straight plank first');
      } else {
        feedback = feedback || 'Lift knee back to plank position';
      }

      return { phase, rep, feedback, metric: Math.round(hipDeviation * 100), metricLabel: 'Plank alignment', formScore };
    },
    reset() {
      phase = 'up';
      lastTappedKnee = null;
    },
  };
}

// ----- SLOW BURPEE V2 -----
export function createSlowBurpeeDetector(): Detector {
  type BurpeePhase = 'STANDING' | 'SQUATTING' | 'PLANK' | 'PUSHUP' | 'PLANK_RETURN' | 'STANDING_UP';
  let phase: 'up' | 'down' = 'up';
  let burpeePhase: BurpeePhase = 'STANDING';
  const VIS = 0.7;

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lElbow = lm[13], rElbow = lm[14];
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every(v => v && (v.visibility ?? 0) >= VIS)) {
        return { phase, rep: false, feedback: 'Camera further back — show full body', metric: null, metricLabel: 'Burpee phase', formScore: 0 };
      }

      const kneeAngleL = angleBetween(lHip, lKnee, lAnkle);
      const kneeAngleR = angleBetween(rHip, rKnee, rAnkle);
      const knee = avg(kneeAngleL, kneeAngleR);
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);

      // Elbow angle for push-up detection
      let elbowAngle = 180;
      if (lElbow && rElbow && (lElbow.visibility ?? 0) >= VIS && (rElbow.visibility ?? 0) >= VIS) {
        const lElbowAngle = angleBetween(lShoulder, lElbow, lm[15]!);
        const rElbowAngle = angleBetween(rShoulder, rElbow, lm[16]!);
        elbowAngle = avg(lElbowAngle, rElbowAngle);
      }

      let rep = false;
      let feedback = '';

      // State machine transitions
      switch (burpeePhase) {
        case 'STANDING':
          if (knee < 110) {
            burpeePhase = 'SQUATTING';
            feedback = 'Good squat — hands to floor, jump back to plank';
          } else {
            feedback = 'Squat down, hands to the floor';
          }
          break;

        case 'SQUATTING':
          // Check if in plank position (hips aligned, knees extended)
          if (knee > 150 && shoulderY > 0.5) {
            burpeePhase = 'PLANK';
            feedback = 'Hold plank — now do a push-up';
          } else {
            feedback = 'Jump or step back to plank position';
          }
          break;

        case 'PLANK':
          // Check for push-up (elbow bend)
          if (elbowAngle < 100) {
            burpeePhase = 'PUSHUP';
            feedback = 'Push back up to plank';
          } else {
            feedback = 'Lower chest to the floor — push-up';
          }
          break;

        case 'PUSHUP':
          // Check for return to plank (elbows extended)
          if (elbowAngle > 155) {
            burpeePhase = 'PLANK_RETURN';
            feedback = 'Good push-up — jump feet forward';
          } else {
            feedback = 'Push up — lock out your elbows';
          }
          break;

        case 'PLANK_RETURN':
          // Check for feet returned (squat position)
          if (knee < 110 && shoulderY < 0.6) {
            burpeePhase = 'STANDING_UP';
            feedback = 'Feet in — now stand up tall';
          } else {
            feedback = 'Jump or step feet back to your hands';
          }
          break;

        case 'STANDING_UP':
          // Check for full stand
          if (knee > 160 && shoulderY < 0.55) {
            burpeePhase = 'STANDING';
            rep = true;
            feedback = 'Excellent burpee!';
          } else {
            feedback = 'Stand tall — complete the rep';
          }
          break;
      }

      return { phase, rep, feedback, metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 88 };
    },
    reset() {
      phase = 'up';
      burpeePhase = 'STANDING';
    },
  };
}

// ----- SHADOW BOXING V2 (punch state machine) -----
export function createShadowBoxingDetector(): Detector {
  type PunchState = 'IDLE' | 'EXTENDING' | 'FULL_EXTENSION' | 'RETURNING';

  const HISTORY = 4;
  const VIS_THRESHOLD = 0.7;
  const EXTEND_ANGLE = 145;   // elbow angle to enter EXTENDING
  const FULL_ANGLE = 158;     // elbow angle to reach FULL_EXTENSION
  const RETURN_ANGLE = 135;   // elbow angle to confirm arm returned
  const MIN_PUNCH_DIST = 0.22; // min wrist-to-shoulder distance relative to shoulder span

  let lState: PunchState = 'IDLE';
  let rState: PunchState = 'IDLE';
  let lHist: { x: number; y: number }[] = [];
  let rHist: { x: number; y: number }[] = [];
  let lastFeedback = 'Get into guard — fists near shoulders';

  function smooth(
    lm: NormalizedLandmark,
    hist: { x: number; y: number }[]
  ): { x: number; y: number } {
    hist.push({ x: lm.x, y: lm.y });
    if (hist.length > HISTORY) hist.shift();
    return {
      x: hist.reduce((s, p) => s + p.x, 0) / hist.length,
      y: hist.reduce((s, p) => s + p.y, 0) / hist.length,
    };
  }

  function wristDist(
    wrist: { x: number; y: number },
    shoulder: NormalizedLandmark,
    span: number
  ): number {
    return Math.hypot(wrist.x - shoulder.x, wrist.y - shoulder.y) / Math.max(span, 0.01);
  }

  return {
    detect(lm) {
      const lS = lm[11], rS = lm[12];
      const lE = lm[13], rE = lm[14];
      const lW = lm[15], rW = lm[16];

      if (![lS, rS, lE, rE, lW, rW].every(v => v && (v.visibility ?? 0) >= VIS_THRESHOLD)) {
        return { phase: 'up', rep: false, feedback: 'Show full upper body — arms must be visible', metric: null, metricLabel: 'Punch extension', formScore: 0 };
      }

      const shoulderSpan = Math.abs(lS.x - rS.x);
      const lWSmooth = smooth(lW, lHist);
      const rWSmooth = smooth(rW, rHist);

      const lAngle = angleBetween(lS, lE, lW);
      const rAngle = angleBetween(rS, rE, rW);
      const lDist = wristDist(lWSmooth, lS, shoulderSpan);
      const rDist = wristDist(rWSmooth, rS, shoulderSpan);

      let repCount = 0;

      // --- Left arm state machine ---
      switch (lState) {
        case 'IDLE':
          if (lAngle >= EXTEND_ANGLE && lDist >= MIN_PUNCH_DIST) lState = 'EXTENDING';
          break;
        case 'EXTENDING':
          if (lAngle >= FULL_ANGLE) lState = 'FULL_EXTENSION';
          else if (lAngle < EXTEND_ANGLE - 10) lState = 'IDLE'; // aborted
          break;
        case 'FULL_EXTENSION':
          if (lAngle < RETURN_ANGLE) lState = 'RETURNING';
          break;
        case 'RETURNING':
          if (lDist < MIN_PUNCH_DIST * 0.65) { lState = 'IDLE'; repCount++; }
          else if (lAngle > FULL_ANGLE) lState = 'FULL_EXTENSION'; // re-extended, no partial
          break;
      }

      // --- Right arm state machine ---
      switch (rState) {
        case 'IDLE':
          if (rAngle >= EXTEND_ANGLE && rDist >= MIN_PUNCH_DIST) rState = 'EXTENDING';
          break;
        case 'EXTENDING':
          if (rAngle >= FULL_ANGLE) rState = 'FULL_EXTENSION';
          else if (rAngle < EXTEND_ANGLE - 10) rState = 'IDLE';
          break;
        case 'FULL_EXTENSION':
          if (rAngle < RETURN_ANGLE) rState = 'RETURNING';
          break;
        case 'RETURNING':
          if (rDist < MIN_PUNCH_DIST * 0.65) { rState = 'IDLE'; repCount++; }
          else if (rAngle > FULL_ANGLE) rState = 'FULL_EXTENSION';
          break;
      }

      const rep = repCount > 0;
      const maxAngle = Math.max(lAngle, rAngle);
      const activeState = lState !== 'IDLE' ? lState : rState;

      if (rep) {
        lastFeedback = repCount >= 2 ? 'Double punch! Keep the combos coming' : 'Good punch! Stay in guard';
      } else if (activeState === 'FULL_EXTENSION') {
        lastFeedback = 'Snap it back — don\'t hold the extension';
      } else if (activeState === 'EXTENDING') {
        lastFeedback = 'Extend fully — drive through the punch';
      } else if (activeState === 'RETURNING') {
        lastFeedback = 'Return to guard quickly';
      } else {
        lastFeedback = maxAngle > 120 ? 'Stay in guard between punches' : 'Throw punches — fists out and back';
      }

      const formScore = activeState !== 'IDLE'
        ? Math.min(100, Math.round((maxAngle / 170) * 95))
        : 75;

      return {
        phase: 'up',
        rep,
        feedback: lastFeedback,
        metric: Math.round(maxAngle),
        metricLabel: 'Punch extension',
        formScore,
      };
    },
    reset() {
      lState = 'IDLE';
      rState = 'IDLE';
      lHist = [];
      rHist = [];
      lastFeedback = 'Get into guard — fists near shoulders';
    },
  };
}

export function getDetectorForSlug(slug: string): Detector {
  switch (slug) {
    case 'squat':             return createSquatDetector();
    case 'pushup':            return createPushupDetector();
    case 'jumping-jack':      return createJumpingJackDetector();
    case 'pullup':            return createPullupDetector();
    case 'plank':             return createPlankDetector();
    case 'lunge':             return createLungeDetector();
    case 'glute-bridge':      return createGluteBridgeDetector();
    case 'mountain-climber':  return createMountainClimberDetector();
    case 'wall-sit':          return createWallSitDetector();
    case 'high-knees':        return createHighKneesDetector();
    case 'bird-dog':          return createBirdDogDetector();
    case 'dead-bug':          return createDeadBugDetector();
    case 'march-in-place':    return createMarchInPlaceDetector();
    case 'heel-raises':       return createHeelRaisesDetector();
    case 'arm-circles':       return createArmCirclesDetector();
    case 'knee-to-elbow':     return createKneeToElbowDetector();
    case 'plank-knee-taps':   return createPlankKneeTapsDetector();
    case 'slow-burpee':       return createSlowBurpeeDetector();
    case 'shadow-boxing':     return createShadowBoxingDetector();
    default:                  return createSquatDetector();
  }
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[]
) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [i, j] of POSE_CONNECTIONS) {
    const a = landmarks[i], b = landmarks[j];
    if (!a || !b) continue;
    if ((a.visibility ?? 0) < 0.5 || (b.visibility ?? 0) < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  }
  ctx.fillStyle = '#22C55E';
  for (const idx of KEY_LANDMARKS) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 0) < 0.5) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
