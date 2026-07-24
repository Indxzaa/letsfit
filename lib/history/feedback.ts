const EXCELLENT = 90;
const GOOD = 75;
const FAIR = 55;

type Tier = { messages: string[] };
type ExerciseFeedbackDef = { excellent: Tier; good: Tier; fair: Tier; poor: Tier };

function pick(score: number, messages: string[]): string {
  return messages[Math.floor(Math.abs(score)) % messages.length];
}

const FEEDBACK: Record<string, ExerciseFeedbackDef> = {
  'Squat': {
    excellent: { messages: [
      'Textbook depth and control your hip crease is clearing the knee every rep. That\'s the standard.',
      'Excellent squat mechanics. Keep driving through your heels and staying upright through the torso.',
    ]},
    good: { messages: [
      'Solid squats. Try to hit just below parallel on every rep to get the full glute and hamstring activation.',
      'Good form overall nudge that depth a little further and you\'ll unlock the real strength gains.',
    ]},
    fair: { messages: [
      'Watch your knees they\'re drifting in. Focus on pushing them out over your toes and brace your core before you descend.',
      'Keep your chest tall and don\'t let your heels rise. Slow down the descent to find your balance.',
    ]},
    poor: { messages: [
      'Prioritize form over speed. Plant your feet shoulder-width, brace your core, and lower slowly — depth comes with practice.',
      'Take it slower. Pause at the bottom for a second to build body awareness, then drive up through your heels.',
    ]},
  },

  'Push-up': {
    excellent: { messages: [
      'Perfect alignment from crown to heel your core is locked in. That\'s what clean push-ups look like.',
      'Outstanding push-ups. Full range of motion with a solid body line — keep that standard on every rep.',
    ]},
    good: { messages: [
      'Good push-ups. Lower your chest all the way to just above the floor to build that last inch of range.',
      'Nice control. Tighten your glutes slightly at the top to enforce full-body tension through the set.',
    ]},
    fair: { messages: [
      'Keep your hips level — they\'re starting to sag or pike. Squeeze your core and glutes as one unit.',
      'Focus on a straight body line. A drooping or raised hip means your core needs more engagement.',
    ]},
    poor: { messages: [
      'Drop to your knees if needed a perfect kneeling push-up is worth more than a sloppy full one.',
      'Reset your position: hands under shoulders, core tight, and lower as one rigid plank. Quality over quantity.',
    ]},
  },

  'Jumping Jack': {
    excellent: { messages: [
      'Clean, rhythmic, and explosive. Your coordination is sharp keep that arm and leg sync locked in.',
      'Perfect jumping jacks — arms reaching overhead, full leg spread, and great landing control.',
    ]},
    good: { messages: [
      'Good energy. Extend your arms fully overhead on each rep to maximize shoulder engagement and range.',
      'Nice rhythm. Keep your landings soft to protect your joints and maintain that pace.',
    ]},
    fair: { messages: [
      'Make sure your arms reach fully overhead and your feet spread wide half reps limit your warm-up benefit.',
      'Slow it down slightly to ensure full extension at the top before closing back in.',
    ]},
    poor: { messages: [
      'Focus on coordination first — arms go out as legs spread, then both return together. Build the pattern before adding speed.',
      'Take it at a comfortable pace and nail the full movement. Crisp reps beat rushed ones every time.',
    ]},
  },

  'March in Place': {
    excellent: { messages: [
      'Great knee drive and steady rhythm — you\'re maximizing every step. Keep that upright posture.',
      'Excellent marching cadence. Arms swinging and knees lifting — this is exactly how it should look.',
    ]},
    good: { messages: [
      'Good march. Try to drive your knees higher, to at least hip level, to activate your hip flexors fully.',
      'Nice effort. Maintain an upright chest and pump your arms to boost your heart rate more effectively.',
    ]},
    fair: { messages: [
      'Lift those knees higher — they should reach hip level on each step. It\'s the difference between walking and marching.',
      'Keep your core engaged and stand tall. Leaning forward reduces the cardio benefit.',
    ]},
    poor: { messages: [
      'Start with a comfortable pace and focus on lifting each knee intentionally. Posture and control first, speed second.',
      'Slow, high-knee marches beat fast, shuffly steps. Build movement quality before adding pace.',
    ]},
  },

  'Heel Raises': {
    excellent: { messages: [
      'Full rise onto the balls of your feet and a slow, controlled descent your calves are working perfectly.',
      'Excellent heel raises. You\'re achieving maximum calf contraction at the top and a full stretch at the bottom.',
    ]},
    good: { messages: [
      'Solid raises. Pause briefly at the top of each rep to squeeze the calf fully before lowering.',
      'Good form. Slow the descent down — the lowering phase is where you build the most strength.',
    ]},
    fair: { messages: [
      'Make sure you\'re rising fully onto your toes, not just partially. Full range of motion is what builds the calf.',
      'Control the movement — don\'t bounce at the bottom. Lower slowly to keep tension on the muscle.',
    ]},
    poor: { messages: [
      'Use a wall for balance and focus on a complete rise to the tiptoe position, then a slow lower. Build the range first.',
      'Go slower and prioritize full extension. A partial rep barely engages the calf muscle.',
    ]},
  },

  'Arm Circles': {
    excellent: { messages: [
      'Smooth, controlled circles with great shoulder engagement throughout. Your mobility warm-up is working.',
      'Excellent arm circles full range, steady pace, and your shoulders are clearly loose and warmed up.',
    ]},
    good: { messages: [
      'Good circles. Make them slightly bigger to get a deeper shoulder mobility stretch through the full rotation.',
      'Nice pace. Focus on keeping your shoulders down and relaxed avoid shrugging as you circle.',
    ]},
    fair: { messages: [
      'Keep the circles large and even. Small, choppy circles limit the warm-up benefit for your shoulder joint.',
      'Relax your neck and keep your core braced. Let the movement come from the shoulder, not the whole torso.',
    ]},
    poor: { messages: [
      'Start with slow, wide circles and focus on feeling each phase of the rotation. Warm-up quality matters.',
      'Make deliberate, full circles — don\'t rush. The goal is to open the shoulder joint, not just move your arms.',
    ]},
  },

  'Plank': {
    excellent: { messages: [
      'Rock-solid plank. Core, glutes, and quads all firing that\'s the full-body tension that makes a plank effective.',
      'Flawless hold. Your body line is straight from head to heel. That\'s elite core stability.',
    ]},
    good: { messages: [
      'Strong plank. Keep your neck neutral looking straight down, not forward — to protect your spine.',
      'Good hold. On your next set, focus on actively pushing the floor away to deepen the core engagement.',
    ]},
    fair: { messages: [
      'Your hips are starting to drift. Reset: squeeze your glutes, brace your abs like bracing for a punch, and level out.',
      'Engage your core more consistently throughout the hold the first 10 seconds don\'t count if you lose form after.',
    ]},
    poor: { messages: [
      'A 15-second perfect plank beats a 60-second sagging one. Drop to your knees if you need to maintain the line.',
      'Focus on positioning: elbows under shoulders, toes tucked, whole body as one rigid line. Hold that, then time it.',
    ]},
  },

  'Mountain Climber': {
    excellent: { messages: [
      'Explosive and controlled — you\'re keeping the hips level and driving each knee with purpose. Excellent work.',
      'Perfect mountain climbers. Full hip extension on the back leg and a strong drive forward — serious cardio and core.',
    ]},
    good: { messages: [
      'Good pace and form. Focus on keeping your hips from rising when you drive each knee in — stay parallel to the floor.',
      'Strong effort. Drive each knee toward the opposite shoulder to maximize oblique and hip flexor activation.',
    ]},
    fair: { messages: [
      'Keep your hips flat — they\'re bobbing up with each step. Slow down and maintain the plank position throughout.',
      'Brace your core before every rep. If you can\'t hold the plank base, the climbers won\'t be effective.',
    ]},
    poor: { messages: [
      'Start slow. Set a solid plank first, then alternate driving each knee in deliberately. Speed is the last thing to add.',
      'Reset your plank: straight back, hips level. Do slow, controlled reps until the position feels natural.',
    ]},
  },

  'Dead Bug': {
    excellent: { messages: [
      'Excellent dead bug — your lower back is staying flat the entire time. That\'s exactly the spine stability this drill trains.',
      'Perfect execution. Opposite arm and leg extending fully without any arch in the lower back — outstanding core control.',
    ]},
    good: { messages: [
      'Good control. Make sure your lower back stays pressed into the floor throughout — even a slight arch means your core lost the battle.',
      'Nice deliberate pace. Extend your arm and leg a bit further with each rep to increase range and difficulty.',
    ]},
    fair: { messages: [
      'Slow this down further. The dead bug only works when every rep is intentional. If your back lifts, the rep doesn\'t count.',
      'Exhale as you lower your limbs — it helps keep your core compressed and your back flat.',
    ]},
    poor: { messages: [
      'This is a precision exercise, not a power one. Start with just leg lowering, then add the arm when you feel ready.',
      'Less range is fine — only lower as far as you can while keeping your lower back glued to the mat.',
    ]},
  },

  'Knee to Elbow': {
    excellent: { messages: [
      'Sharp oblique activation and clean balance — you\'re twisting through the full range on every rep. Great work.',
      'Excellent knee-to-elbow form. The rotation is coming from your torso, not just your limbs — that\'s the key.',
    ]},
    good: { messages: [
      'Good movement. Pull your knee and elbow actively toward each other instead of just lifting your leg — the crunch is the point.',
      'Nice balance. Add a brief pause at the point of contact to increase time under tension for your obliques.',
    ]},
    fair: { messages: [
      'Focus on the twist — your elbow needs to move toward the knee, not stay static. The rotation is where the work happens.',
      'Slow it down and control each rep. Fast, sloppy knee-to-elbow barely works your core.',
    ]},
    poor: { messages: [
      'Take it one rep at a time with a pause in between. Find your balance, then initiate the crunch from the torso.',
      'Start with a smaller range of motion and build up. The goal is a full torso twist meeting your raised knee.',
    ]},
  },

  'Plank Knee Taps': {
    excellent: { messages: [
      'Excellent control — your hips stay level through every tap and recovery. That\'s advanced core stability in action.',
      'Perfect plank knee taps. You\'re maintaining plank tension even as you break and restore the position each rep.',
    ]},
    good: { messages: [
      'Good form. Tap your knee gently — don\'t collapse into it and drive back up to full plank immediately.',
      'Nice work. Keep your hips square; they\'ll want to rotate as you tap. Resist that with your obliques.',
    ]},
    fair: { messages: [
      'Your hips are shifting with each tap. Brace harder before you lower the knee and control the return.',
      'Slow down between reps to fully re-establish your plank position before the next tap.',
    ]},
    poor: { messages: [
      'Master a static plank first. Once you can hold 20 seconds without form breaking, add the taps.',
      'One tap at a time — lower your knee slowly, touch lightly, and push back to plank before going again.',
    ]},
  },

  'Pull-up': {
    excellent: { messages: [
      'Full range of motion, chin clearing the bar, and a controlled descent that\'s a technically perfect pull-up.',
      'Outstanding pull-ups. You\'re using your back, not just your arms the lat engagement is exactly right.',
    ]},
    good: { messages: [
      'Good pull-ups. Make sure your chin clears the bar on every rep partial reps limit strength development.',
      'Strong effort. Slow the descent to a 3-count lower the eccentric is where you build the most pulling strength.',
    ]},
    fair: { messages: [
      'Initiate each pull from your shoulder blades, not your arms. Think of pulling your elbows toward your hips.',
      'Your arms are doing most of the work. Start the pull by depressing your shoulder blades first, then pull.',
    ]},
    poor: { messages: [
      'Dead hangs and scapular pulls are your foundation. Build lat engagement there before attempting full pull-ups.',
      'Use a resistance band or a box for assisted reps. Perfect assisted pull-ups will get you to unassisted faster.',
    ]},
  },

  'Lunge': {
    excellent: { messages: [
      'Perfect lunge mechanics — knee tracking over the toe, 90-degree angles on both legs, and a tall torso.',
      'Great lunges. Front shin is vertical, rear knee hovering just above the floor that\'s the complete range.',
    ]},
    good: { messages: [
      'Good lunges. Make sure your front knee doesn\'t push past your toes drive your hips straight down, not forward.',
      'Nice control. Keep your torso vertical throughout. Leaning forward shifts load off your legs and onto your lower back.',
    ]},
    fair: { messages: [
      'Watch your knee tracking — it\'s caving inward on the lead leg. Push that knee out to align with your second toe.',
      'Slow your descent. A faster lunge with bad form builds imbalances. Control the drop and feel both legs load evenly.',
    ]},
    poor: { messages: [
      'Shorten your stride and focus on a straight drop both knees forming 90 degrees as you lower. Build the pattern first.',
      'Use a wall for balance support. A controlled partial lunge beats a wobbly deep one every time.',
    ]},
  },

  'Glute Bridge': {
    excellent: { messages: [
      'Full hip extension at the top, neutral spine throughout your glutes are the prime mover. That\'s exactly right.',
      'Excellent glute bridges. Squeezing at the top and controlling the descent — maximum posterior chain activation.',
    ]},
    good: { messages: [
      'Good bridges. Pause and squeeze hard at the top for 2 seconds before lowering it dramatically increases glute activation.',
      'Nice form. Make sure your feet are flat and knees track straight — don\'t let them fall inward at the top.',
    ]},
    fair: { messages: [
      'You\'re not reaching full extension at the top. Drive your hips up until knees, hips, and shoulders form a straight line.',
      'Engage your glutes before you lift. Squeeze them first, then bridge up this activates the right muscles from the start.',
    ]},
    poor: { messages: [
      'Focus on the squeeze: tighten your glutes before and throughout the lift. If you don\'t feel it in your glutes, they\'re not working.',
      'Slow the movement down and focus on the mind-muscle connection. Feel each glute contracting as you bridge up.',
    ]},
  },

  'Slow Burpee': {
    excellent: { messages: [
      'Every phase is clean the squat, the plank, the push-up, and the return. You\'re making this advanced move look easy.',
      'Outstanding slow burpees. Deliberate transitions between each phase show real full-body strength and control.',
    ]},
    good: { messages: [
      'Good burpees. Keep your plank tight during the step-out phase — hips shouldn\'t drop when you extend back.',
      'Nice control. Make your push-up a complete rep — chest to just above the floor and full arm extension.',
    ]},
    fair: { messages: [
      'Don\'t rush the transitions. Each phase squat, plank, push-up, recover should be deliberate and controlled.',
      'Your hips are dropping during the plank phase. Brace your core before you step out, not after.',
    ]},
    poor: { messages: [
      'Break it into parts: squat down, step back to plank, step forward, stand up. Master each phase separately.',
      'Slow is the point if form breaks, stop and reset. One perfect slow burpee is worth ten sloppy ones.',
    ]},
  },

  'Wall Sit': {
    excellent: { messages: [
      'Rock-solid hold with thighs parallel to the floor. Your quad endurance is exceptional that time speaks for itself.',
      'Flawless wall sit. Back flat, weight through your heels, and 90-degree knees held all the way through.',
    ]},
    good: { messages: [
      'Good hold. Try to get your thighs fully parallel to the floor if you\'re above parallel, you\'re leaving gains on the table.',
      'Nice endurance. Push your back flat into the wall throughout don\'t let it peel away as fatigue sets in.',
    ]},
    fair: { messages: [
      'Your knees drifted above 90 degrees as fatigue hit. Slide down further and push your back firmly into the wall.',
      'Focus on even weight distribution across both legs. If one is working harder, you\'re developing an imbalance.',
    ]},
    poor: { messages: [
      'A shorter hold with proper form is far better. Thighs parallel, back flat, feet under knees hold that, however briefly.',
      'Set a closer target and nail it. 15 perfect seconds builds more than 45 seconds of compensating.',
    ]},
  },

  'High Knees': {
    excellent: { messages: [
      'Explosive knee drive and great posture you\'re getting full hip flexion on every step. That\'s real intensity.',
      'Excellent high knees. Arms pumping, knees at hip height, and landing lightly your form is dialed in.',
    ]},
    good: { messages: [
      'Good pace. Drive your knees to hip level if they\'re not clearing your hip crease, you\'re missing the hip flexor work.',
      'Nice effort. Pump your arms to help power the knee drive and maintain your rhythm as you fatigue.',
    ]},
    fair: { messages: [
      'Your knees aren\'t reaching high enough. Aim for hip height on each step and lean very slightly forward to drive them up.',
      'Slow down to ensure each knee hits the target height before increasing pace.',
    ]},
    poor: { messages: [
      'Start with a controlled march at double-time, focusing on knee height. Add speed only once you\'re consistently hitting hip level.',
      'Slow high knees beat fast low knees. Height is everything in this exercise nail that before you add pace.',
    ]},
  },

  'Bird Dog': {
    excellent: { messages: [
      'Perfect balance and extension you\'re achieving full length on every rep without any spinal deviation. Excellent stability.',
      'Outstanding bird dogs. Hip-level arm and leg, neutral spine, no sway this is exactly what spinal stability looks like.',
    ]},
    good: { messages: [
      'Good form. Extend your arm and leg fully — there\'s often a tendency to hold back range of motion as you tire.',
      'Nice control. Hold each fully extended position for a beat before returning it increases the stability challenge significantly.',
    ]},
    fair: { messages: [
      'Your hips are rotating when you extend. Keep them square to the floor imagine balancing a glass of water on your lower back.',
      'Slow down and feel the extension before moving to the other side. Speed is the enemy of balance in this exercise.',
    ]},
    poor: { messages: [
      'Start with just leg extensions no arm yet. Once your hips stay still during that, add the opposite arm.',
      'Move at half your current speed. Every hip shift means your core isn\'t stabilizing properly. Less range, more control.',
    ]},
  },

  'Shadow Boxing': {
    excellent: { messages: [
      'Sharp punches with proper extension and great footwork your cardio and coordination are working together perfectly.',
      'Outstanding session. Full extension on every punch, active footwork, and maintained guard textbook technique.',
    ]},
    good: { messages: [
      'Good combinations. Make sure you\'re fully extending each punch and returning your hand to guard before throwing the next.',
      'Nice energy. Add more intentional footwork lateral steps and pivots will raise your heart rate and coordination further.',
    ]},
    fair: { messages: [
      'Focus on punch extension — a punch that stops short doesn\'t train your shoulder stabilizers or your cardio effectively.',
      'Keep your guard up between punches. Dropping your hands between combinations is a habit to break early.',
    ]},
    poor: { messages: [
      'Slow down and focus on one punch at a time. Jab, extend fully, return to guard. Build each combination deliberately.',
      'Quality over speed. A crisp, slow jab-cross with full extension is more valuable than frantic windmill arms.',
    ]},
  },
};

const FALLBACK: ExerciseFeedbackDef = {
  excellent: { messages: [
    'Outstanding performance your form and control are right where they need to be. Keep it up.',
    'Excellent work. Consistency at this level builds real, lasting fitness.',
  ]},
  good: { messages: [
    'Solid effort. Focus on the movement quality details and you\'ll push into the excellent range.',
    'Good session. Small refinements in form will compound into big improvements over time.',
  ]},
  fair: { messages: [
    'Decent effort slow down and focus on controlled, intentional movement to improve your score.',
    'You\'re building the habit. Prioritize form over speed and the accuracy will follow.',
  ]},
  poor: { messages: [
    'Focus on the basics: posture, breathing, and controlled movement. Form always comes before intensity.',
    'Take it slower and break the movement into phases. Every rep done correctly is progress.',
  ]},
};

export type AccuracyTier = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export function getAccuracyTier(accuracyScore: number): AccuracyTier {
  const score = Math.max(0, Math.min(100, accuracyScore));
  if (score >= EXCELLENT) return 'Excellent';
  if (score >= GOOD) return 'Good';
  if (score >= FAIR) return 'Fair';
  return 'Poor';
}

export function getExerciseFeedback(exerciseName: string, accuracyScore: number): string {
  const def = FEEDBACK[exerciseName] ?? FALLBACK;
  const score = Math.max(0, Math.min(100, accuracyScore));

  let tier: Tier;
  if (score >= EXCELLENT) tier = def.excellent;
  else if (score >= GOOD) tier = def.good;
  else if (score >= FAIR) tier = def.fair;
  else tier = def.poor;

  return pick(score, tier.messages);
}
