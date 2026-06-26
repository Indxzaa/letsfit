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

// ----- LUNGE -----
export function createLungeDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  return {
    detect(lm) {
      const lHip = lm[23], lKnee = lm[25], lAnkle = lm[27];
      const rHip = lm[24], rKnee = lm[26], rAnkle = lm[28];
      if (![lHip, lKnee, lAnkle, rHip, rKnee, rAnkle].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Show your full lower body', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }
      const lAngle = angleBetween(lHip, lKnee, lAnkle);
      const rAngle = angleBetween(rHip, rKnee, rAnkle);
      const minAngle = Math.min(lAngle, rAngle);
      let rep = false, feedback = '';
      if (phase === 'up' && minAngle < 110) { phase = 'down'; feedback = 'Good depth — drive back up'; }
      else if (phase === 'down' && lAngle > 155 && rAngle > 155) { phase = 'up'; rep = true; feedback = 'Nice lunge'; }
      else if (phase === 'up') { feedback = 'Step forward and lower your back knee'; }
      else { feedback = 'Push through your front heel to stand'; }
      return { phase, rep, feedback, metric: Math.round(minAngle), metricLabel: 'Knee angle', formScore: minAngle < 110 ? 90 : 80 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- GLUTE BRIDGE -----
export function createGluteBridgeDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24];
      const lAnkle = lm[27], rAnkle = lm[28];
      if (![lShoulder, rShoulder, lHip, rHip, lAnkle, rAnkle].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Lie on your back and show full body from the side', metric: null, metricLabel: 'Hip lift', formScore: 0 };
      }
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = avg(lAnkle.y, rAnkle.y);
      const lift = avg(shoulderY, ankleY) - hipY; // positive = hip above baseline
      let rep = false, feedback = '';
      if (phase === 'down' && lift > 0.06) { phase = 'up'; feedback = 'Squeeze at the top'; }
      else if (phase === 'up' && lift < 0.02) { phase = 'down'; rep = true; feedback = 'Nice bridge! Go again'; }
      else if (phase === 'down') { feedback = 'Drive hips up toward the ceiling'; }
      else { feedback = 'Lower hips back to the floor'; }
      return { phase, rep, feedback, metric: Math.round(lift * 100), metricLabel: 'Hip lift', formScore: lift > 0.06 ? 90 : 75 };
    },
    reset() { phase = 'down'; },
  };
}

// ----- MOUNTAIN CLIMBER -----
export function createMountainClimberDetector(): Detector {
  let phase: 'up' | 'down' = 'up'; // up = knee extended back
  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      if (![lHip, rHip, lKnee, rKnee].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Show your full body in plank position', metric: null, metricLabel: 'Knee drive', formScore: 0 };
      }
      const hipY = avg(lHip.y, rHip.y);
      const lTucked = lKnee.y < hipY - 0.05;
      const rTucked = rKnee.y < hipY - 0.05;
      const anyTucked = lTucked || rTucked;
      let rep = false, feedback = '';
      if (phase === 'up' && anyTucked) { phase = 'down'; feedback = 'Drive — switch legs!'; }
      else if (phase === 'down' && !anyTucked) { phase = 'up'; rep = true; feedback = 'Rep! Keep the pace'; }
      else if (phase === 'up') { feedback = 'Drive your knee toward your chest'; }
      else { feedback = 'Extend back, switch legs'; }
      const metric = Math.round(Math.max(hipY - lKnee.y, hipY - rKnee.y) * 100);
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee drive', formScore: 88 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- WALL SIT (timed) -----
export function createWallSitDetector(): Detector {
  return {
    detect(lm) {
      const lHip = lm[23], lKnee = lm[25], lAnkle = lm[27];
      const rHip = lm[24], rKnee = lm[26], rAnkle = lm[28];
      if (![lHip, lKnee, lAnkle, rHip, rKnee, rAnkle].every((v) => visible(v))) {
        return { phase: 'down', rep: false, feedback: 'Show full lower body against the wall', metric: null, metricLabel: 'Knee angle', formScore: 0 };
      }
      const knee = avg(angleBetween(lHip, lKnee, lAnkle), angleBetween(rHip, rKnee, rAnkle));
      let feedback = 'Hold your position';
      let formScore = 95;
      if (knee > 120) { feedback = 'Sink lower — aim for 90°'; formScore = 60; }
      else if (knee < 75) { feedback = 'Rise slightly — too deep'; formScore = 70; }
      return { phase: 'down', rep: false, feedback, metric: Math.round(knee), metricLabel: 'Knee angle', formScore };
    },
    reset() {},
  };
}

// ----- HIGH KNEES -----
export function createHighKneesDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      if (![lHip, rHip, lKnee, rKnee].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Stand back so hips and knees are visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }
      // y increases downward — knee above hip = lower y
      const lHigh = lKnee.y < lHip.y - 0.05;
      const rHigh = rKnee.y < rHip.y - 0.05;
      const anyHigh = lHigh || rHigh;
      let rep = false, feedback = '';
      if (phase === 'down' && anyHigh) { phase = 'up'; feedback = 'Down — other knee up!'; }
      else if (phase === 'up' && !anyHigh) { phase = 'down'; rep = true; feedback = 'Nice! Keep alternating'; }
      else if (phase === 'down') { feedback = 'Drive your knee above your hip'; }
      else { feedback = 'Switch legs quickly'; }
      const metric = Math.round(Math.max((lHip.y - lKnee.y) * 100, (rHip.y - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: 88 };
    },
    reset() { phase = 'down'; },
  };
}

// ----- BIRD DOG -----
export function createBirdDogDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Show your arms from the side', metric: null, metricLabel: 'Arm extension', formScore: 0 };
      }
      const lAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rAngle = angleBetween(rShoulder, rElbow, rWrist);
      const maxExt = Math.max(lAngle, rAngle);
      let rep = false, feedback = '';
      if (phase === 'down' && maxExt > 155) { phase = 'up'; feedback = 'Hold — extend your opposite leg'; }
      else if (phase === 'up' && maxExt < 120) { phase = 'down'; rep = true; feedback = 'Rep! Switch sides'; }
      else if (phase === 'down') { feedback = 'Extend your arm straight out'; }
      else { feedback = 'Return arm to starting position'; }
      return { phase, rep, feedback, metric: Math.round(maxExt), metricLabel: 'Arm extension', formScore: maxExt > 155 ? 90 : 75 };
    },
    reset() { phase = 'down'; },
  };
}

// ----- DEAD BUG -----
export function createDeadBugDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  return {
    detect(lm) {
      const lShoulder = lm[11], lElbow = lm[13], lWrist = lm[15];
      const rShoulder = lm[12], rElbow = lm[14], rWrist = lm[16];
      const lHip = lm[23], rHip = lm[24];
      const lKnee = lm[25], rKnee = lm[26];
      if (![lShoulder, lElbow, lWrist, rShoulder, rElbow, rWrist, lHip, rHip].every((v) => visible(v))) {
        return { phase, rep: false, feedback: 'Lie on your back and show arms and legs', metric: null, metricLabel: 'Extension', formScore: 0 };
      }
      const armExt = Math.max(angleBetween(lShoulder, lElbow, lWrist), angleBetween(rShoulder, rElbow, rWrist));
      const legExt = visible(lKnee) && visible(rKnee) ? Math.max(
        angleBetween(lShoulder, lHip, lKnee), angleBetween(rShoulder, rHip, rKnee)
      ) : armExt;
      const extended = armExt > 140 && legExt > 140;
      let rep = false, feedback = '';
      if (phase === 'up' && extended) { phase = 'down'; feedback = 'Extended — return to center'; }
      else if (phase === 'down' && !extended) { phase = 'up'; rep = true; feedback = 'Rep! Switch sides'; }
      else if (phase === 'up') { feedback = 'Extend opposite arm and leg toward the floor'; }
      else { feedback = 'Bring arm and leg back to center'; }
      return { phase, rep, feedback, metric: Math.round(armExt), metricLabel: 'Extension', formScore: extended ? 90 : 75 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- MARCH IN PLACE -----
export function createMarchInPlaceDetector(): Detector {
  let phase: 'up' | 'down' = 'down';
  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      if (![lHip, rHip, lKnee, rKnee].every(v => visible(v))) {
        return { phase, rep: false, feedback: 'Stand back so hips and knees are visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }
      const hipY = avg(lHip.y, rHip.y);
      const anyHigh = lKnee.y < hipY - 0.02 || rKnee.y < hipY - 0.02;
      let rep = false, feedback = '';
      if (phase === 'down' && anyHigh) { phase = 'up'; feedback = 'Good — keep marching!'; }
      else if (phase === 'up' && !anyHigh) { phase = 'down'; rep = true; feedback = 'Step! Other knee up'; }
      else if (phase === 'down') { feedback = 'Lift your knees — start marching'; }
      else { feedback = 'Keep the rhythm going'; }
      const metric = Math.round(Math.max((hipY - lKnee.y) * 100, (hipY - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: 88 };
    },
    reset() { phase = 'down'; },
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

// ----- ARM CIRCLES (timed) -----
export function createArmCirclesDetector(): Detector {
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12], lWrist = lm[15], rWrist = lm[16];
      if (![lShoulder, rShoulder, lWrist, rWrist].every(v => visible(v))) {
        return { phase: 'up', rep: false, feedback: 'Extend arms to the sides — show full upper body', metric: null, metricLabel: 'Arm span', formScore: 0 };
      }
      const shoulderSpan = Math.abs(lShoulder.x - rShoulder.x);
      const wristSpan = Math.abs(lWrist.x - rWrist.x);
      const extended = wristSpan > shoulderSpan * 1.4;
      return {
        phase: 'up', rep: false,
        feedback: extended ? 'Keep rotating — big circles' : 'Extend arms wider to your sides',
        metric: Math.round(wristSpan * 100), metricLabel: 'Arm span',
        formScore: extended ? 90 : 45,
      };
    },
    reset() {},
  };
}

// ----- KNEE TO ELBOW -----
export function createKneeToElbowDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  return {
    detect(lm) {
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lElbow = lm[13], rElbow = lm[14];
      if (![lHip, rHip, lKnee, rKnee, lElbow, rElbow].every(v => visible(v))) {
        return { phase, rep: false, feedback: 'Stand so your full body is visible', metric: null, metricLabel: 'Knee height', formScore: 0 };
      }
      const hipY = avg(lHip.y, rHip.y);
      const anyKneeHigh = lKnee.y < hipY - 0.08 || rKnee.y < hipY - 0.08;
      const elbowLow = avg(lElbow.y, rElbow.y) > hipY - 0.1;
      const crunch = anyKneeHigh && elbowLow;
      let rep = false, feedback = '';
      if (phase === 'up' && crunch) { phase = 'down'; feedback = 'Touch — switch sides!'; }
      else if (phase === 'down' && !anyKneeHigh) { phase = 'up'; rep = true; feedback = 'Rep! Drive the other knee'; }
      else if (phase === 'up') { feedback = 'Drive knee up, crunch elbow to meet it'; }
      else { feedback = 'Lower leg, switch sides'; }
      const metric = Math.round(Math.max((hipY - lKnee.y) * 100, (hipY - rKnee.y) * 100));
      return { phase, rep, feedback, metric: Math.max(0, metric), metricLabel: 'Knee height', formScore: 88 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- PLANK KNEE TAPS -----
export function createPlankKneeTapsDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];
      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every(v => visible(v))) {
        return { phase, rep: false, feedback: 'Get into plank — show full body from the side', metric: null, metricLabel: 'Hip line', formScore: 0 };
      }
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const hipY = avg(lHip.y, rHip.y);
      const ankleY = avg(lAnkle.y, rAnkle.y);
      const kneeY = avg(lKnee.y, rKnee.y);
      const inPlank = Math.abs(hipY - avg(shoulderY, ankleY)) < 0.1;
      const kneeDrop = kneeY > hipY + 0.04;
      let rep = false, feedback = '';
      if (phase === 'up' && inPlank && kneeDrop) { phase = 'down'; feedback = 'Tap! Lift back up'; }
      else if (phase === 'down' && !kneeDrop) { phase = 'up'; rep = true; feedback = 'Rep! Tap the other knee'; }
      else if (phase === 'up') { feedback = inPlank ? 'Good plank — tap a knee to the floor' : 'Hold a straight plank'; }
      else { feedback = 'Lift knee back to plank position'; }
      return { phase, rep, feedback, metric: Math.round(Math.abs(hipY - avg(shoulderY, ankleY)) * 100), metricLabel: 'Hip line', formScore: inPlank ? 90 : 60 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- SLOW BURPEE -----
export function createSlowBurpeeDetector(): Detector {
  let phase: 'up' | 'down' = 'up';
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lHip = lm[23], rHip = lm[24], lKnee = lm[25], rKnee = lm[26];
      const lAnkle = lm[27], rAnkle = lm[28];
      if (![lShoulder, rShoulder, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle].every(v => visible(v))) {
        return { phase, rep: false, feedback: 'Camera further back — show full body', metric: null, metricLabel: 'Hip height', formScore: 0 };
      }
      const knee = avg(angleBetween(lHip, lKnee, lAnkle), angleBetween(rHip, rKnee, rAnkle));
      const shoulderY = avg(lShoulder.y, rShoulder.y);
      const onFloor = knee < 90 || shoulderY > 0.65;
      let rep = false, feedback = '';
      if (phase === 'up' && onFloor) { phase = 'down'; feedback = 'Good — plank, push-up, then stand'; }
      else if (phase === 'down' && knee > 160 && shoulderY < 0.6) { phase = 'up'; rep = true; feedback = 'Excellent rep!'; }
      else if (phase === 'up') { feedback = 'Squat down, hands to floor'; }
      else { feedback = 'Push up and stand tall'; }
      return { phase, rep, feedback, metric: Math.round(knee), metricLabel: 'Knee angle', formScore: 88 };
    },
    reset() { phase = 'up'; },
  };
}

// ----- SHADOW BOXING (timed) -----
export function createShadowBoxingDetector(): Detector {
  return {
    detect(lm) {
      const lShoulder = lm[11], rShoulder = lm[12];
      const lElbow = lm[13], rElbow = lm[14], lWrist = lm[15], rWrist = lm[16];
      if (![lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist].every(v => visible(v))) {
        return { phase: 'up', rep: false, feedback: 'Show your upper body — arms visible', metric: null, metricLabel: 'Arm extension', formScore: 0 };
      }
      const lAngle = angleBetween(lShoulder, lElbow, lWrist);
      const rAngle = angleBetween(rShoulder, rElbow, rWrist);
      const punching = lAngle > 140 || rAngle > 140;
      return {
        phase: 'up', rep: false,
        feedback: punching ? 'Keep punching — stay light on your feet' : 'Extend your punches — arms out',
        metric: Math.round(Math.max(lAngle, rAngle)), metricLabel: 'Arm extension',
        formScore: punching ? 92 : 50,
      };
    },
    reset() {},
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
