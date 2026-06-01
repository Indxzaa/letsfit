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

// ----- SQUAT -----
export function createSquatDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  const DOWN = 110;
  const UP = 160;

  return {
    detect(lm) {
      const lHip = lm[23], lKnee = lm[25], lAnkle = lm[27];
      const rHip = lm[24], rKnee = lm[26], rAnkle = lm[28];
      const lShoulder = lm[11], rShoulder = lm[12];

      if (![lHip, lKnee, lAnkle, rHip, rKnee, rAnkle].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Step back so your full lower body is visible', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }

      const leftAngle = angleBetween(lHip, lKnee, lAnkle);
      const rightAngle = angleBetween(rHip, rKnee, rAnkle);
      const knee = avg(leftAngle, rightAngle);

      // Back angle for posture check
      let formScore = 90;
      let feedback = '';

      if (visible(lShoulder) && visible(rShoulder)) {
        const shoulderY = avg(lShoulder.y, rShoulder.y);
        const hipY = avg(lHip.y, rHip.y);
        // Healthy back leans forward slightly when squatting
        if (shoulderY > hipY) {
          formScore -= 30;
          feedback = 'Keep your chest up';
        }
      }

      let rep = false;
      if (phase === 'up' && knee < DOWN) {
        phase = 'down';
        feedback = feedback || 'Good depth — drive up';
      } else if (phase === 'down' && knee > UP) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Nice rep';
      } else if (phase === 'up') {
        if (knee > UP) feedback = feedback || 'Lower your squat more';
        else feedback = feedback || 'Keep going down';
      } else {
        feedback = feedback || 'Push through your heels to stand';
      }

      return { phase, rep, feedback, metric: Math.round(knee), metricLabel: 'Knee angle', formScore };
    },
    reset() {
      phase = 'up';
    },
  };
}

// ----- PUSH-UP -----
export function createPushupDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  const DOWN = 95;
  const UP = 155;

  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const lHip = lm[23], rHip = lm[24];

      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Position so your arms are visible', metric: null, metricLabel: 'Elbow angle', formScore: 0 };
      }

      const leftAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rightAngle = angleBetween(rShoulder, rElbow, rWrist);
      const elbow = avg(leftAngle, rightAngle);

      // Hip sag check
      let formScore = 90;
      let feedback = '';
      if (visible(lHip) && visible(rHip)) {
        const shoulderY = avg(lShoulder.y, rShoulder.y);
        const hipY = avg(lHip.y, rHip.y);
        if (Math.abs(shoulderY - hipY) > 0.15) {
          formScore -= 25;
          feedback = 'Keep your body straight';
        }
      }

      let rep = false;
      if (phase === 'up' && elbow < DOWN) {
        phase = 'down';
        feedback = feedback || 'Good — push back up';
      } else if (phase === 'down' && elbow > UP) {
        phase = 'up';
        rep = true;
        feedback = feedback || 'Nice rep';
      } else if (phase === 'up') {
        feedback = feedback || (elbow > UP ? 'Lower your chest' : 'Go deeper');
      } else {
        feedback = feedback || 'Extend your arms fully';
      }

      return { phase, rep, feedback, metric: Math.round(elbow), metricLabel: 'Elbow angle', formScore };
    },
    reset() {
      phase = 'up';
    },
  };
}

// ----- JUMPING JACK -----
export function createJumpingJackDetector(): Detector {
  let phase: 'up' | 'down' = 'down'; // down = arms at sides

  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lWrist = lm[15], rWrist = lm[16];
      const lAnkle = lm[27], rAnkle = lm[28];
      const lHip = lm[23], rHip = lm[24];

      if (![lShoulder, rShoulder, lWrist, rWrist, lAnkle, rAnkle].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Stand back so your full body is visible', metric: null, metricLabel: 'Spread', formScore: 0 };
      }

      // Arms up = wrists above shoulders
      const armsUp = lWrist.y < lShoulder.y - 0.05 && rWrist.y < rShoulder.y - 0.05;
      // Legs apart = ankles wider than hips
      const hipDist = Math.abs(lHip.x - rHip.x);
      const ankleDist = Math.abs(lAnkle.x - rAnkle.x);
      const legsApart = ankleDist > hipDist * 1.4;

      const isUp = armsUp && legsApart;

      let rep = false;
      let feedback = '';

      if (phase === 'down' && isUp) {
        phase = 'up';
        feedback = 'Good — back to start';
      } else if (phase === 'up' && !armsUp && !legsApart) {
        phase = 'down';
        rep = true;
        feedback = 'Nice rep';
      } else if (phase === 'down') {
        if (!armsUp && !legsApart) feedback = 'Jump — arms up, legs out';
        else if (!armsUp) feedback = 'Raise your arms higher';
        else feedback = 'Spread your legs wider';
      } else {
        feedback = 'Bring arms and legs back together';
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

// ----- PLANK (timed) -----
// For plank, "rep" never fires; the active session counts seconds while form is good.
export function createPlankDetector(): Detector {
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24];
      const lAnkle = lm[27], rAnkle = lm[28];

      if (![lShoulder, rShoulder, lHip, rHip, lAnkle, rAnkle].every((v) => visible(v))) {
        return { phase: 'up', rep: false, feedback: 'Get into plank — show full body', metric: null, metricLabel: 'Body line', formScore: 0 };
      }

      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = avg(lAnkle.y, rAnkle.y);

      // For a good plank, shoulder, hip, ankle should form a near-straight line
      const sagging = hipY > avg(shoulderY, ankleY) + 0.04;
      const piking = hipY < avg(shoulderY, ankleY) - 0.04;

      let feedback = 'Hold steady';
      let formScore = 95;

      if (sagging) {
        feedback = 'Lift your hips — straighten your back';
        formScore = 60;
      } else if (piking) {
        feedback = 'Lower your hips slightly';
        formScore = 70;
      }

      // Body alignment metric (0-100, higher = straighter)
      const dev = Math.abs(hipY - avg(shoulderY, ankleY));
      const alignment = Math.max(0, Math.round(100 - dev * 1000));

      return { phase: 'up', rep: false, feedback, metric: alignment, metricLabel: 'Alignment', formScore };
    },
    reset() {},
  };
}

export function getDetectorForSlug(slug: string): Detector {
  switch (slug) {
    case 'squat': return createSquatDetector();
    case 'pushup': return createPushupDetector();
    case 'jumping-jack': return createJumpingJackDetector();
    case 'pullup': return createPullupDetector();
    case 'plank': return createPlankDetector();
    default: return createSquatDetector();
  }
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[]
) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)';
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
  ctx.fillStyle = '#ffffff';
  for (const idx of KEY_LANDMARKS) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 0) < 0.5) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
