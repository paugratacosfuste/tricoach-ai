import { TrainingPlan, Workout, WorkoutType, WeekPlan } from '@/types/training';

const workoutTemplates: Record<WorkoutType, Partial<Workout>[]> = {
  run: [
    {
      name: 'Easy Recovery Run',
      duration: 45,
      distance: 7,
      purpose: 'Active recovery to promote blood flow and aid muscle repair while maintaining aerobic fitness.',
      description: '🏃 EASY RECOVERY RUN\n\n📍 Duration: 45min | Distance: ~7km\n\n🎯 PURPOSE:\nThis recovery run promotes blood flow to tired muscles and maintains your aerobic base without adding stress. Keep it genuinely easy - this is active rest.',
      structure: [
        { name: 'Warm-up', duration: '5 min', description: 'Very easy jog to loosen up' },
        { name: 'Main run', duration: '35 min', description: 'Steady Zone 1-2 effort' },
        { name: 'Cool-down', duration: '5 min', description: 'Easy jog to walk' },
      ],
      heartRateGuidance: '• Target: 120-140 bpm (Zone 1-2)\n• Stay BELOW 145 bpm at all times\n• If breathing becomes labored, slow down',
      paceGuidance: '• Target pace: 6:00-6:45 /km\n• This should feel EASY\n• Conversation pace throughout',
      coachingTips: [
        'Leave your ego at the door - slower is better today',
        'Focus on relaxed form and quick turnover',
        'Great opportunity for mindfulness and mental reset',
        'If legs feel heavy, walking breaks are fine',
      ],
      adaptationNotes: 'If you\'re feeling particularly fatigued, reduce to 30 minutes or substitute with a 30-minute walk.',
    },
    {
      name: 'Long Run - Aerobic Base',
      duration: 105,
      distance: 18,
      purpose: 'Build aerobic endurance and teach your body to efficiently burn fat as fuel during extended efforts.',
      description: '🏃 LONG RUN - Building Aerobic Base\n\n📍 Duration: 1h 45min | Distance: ~18km\n\n🎯 PURPOSE:\nThis long run builds your aerobic endurance and teaches your body to burn fat efficiently. Keep it conversational - you should be able to hold a conversation throughout.',
      structure: [
        { name: 'Warm-up', duration: '10 min', description: 'Start very easy, gradually building to your easy pace' },
        { name: 'Main set', duration: '1h 25min', description: 'Steady Zone 2 effort' },
        { name: 'Cool-down', duration: '10 min', description: 'Gradually slow to a walk' },
      ],
      heartRateGuidance: '• Target: 135-150 bpm (Zone 2)\n• Stay BELOW 155 bpm - if you drift above, slow down or walk\n• Based on your LTHR of 172 bpm',
      paceGuidance: '• Target pace: 5:45-6:15 /km\n• This should feel EASY - slower than you think!\n• Based on your threshold pace of 4:45/km',
      coachingTips: [
        'Fuel: Take water every 20min, consider a gel at 60min',
        'Terrain: Flat to rolling preferred, avoid major hills',
        'Mental: Break it into 3 x 35min segments mentally',
        'If legs feel heavy, it\'s OK to slow down further',
      ],
      adaptationNotes: 'If coming off a hard week, reduce to 1h 30min. If feeling great, you can extend by 10-15min max.',
    },
    {
      name: 'Tempo Run - Threshold Development',
      duration: 55,
      distance: 10,
      purpose: 'Train your body to clear lactate more efficiently and raise your threshold pace.',
      description: '🏃 TEMPO RUN - Lactate Threshold Development\n\n📍 Duration: 55min | Distance: ~10km\n\n🎯 PURPOSE:\nTempo runs train your body to clear lactate more efficiently and raise your threshold pace. This is "comfortably hard" - challenging but sustainable.',
      structure: [
        { name: 'Warm-up', duration: '15 min', description: 'Easy jog + 4 x 20sec strides' },
        { name: 'Main set', duration: '3 x 10min', description: 'Tempo pace with 2min easy jog recovery' },
        { name: 'Cool-down', duration: '10 min', description: 'Easy jog' },
      ],
      heartRateGuidance: '• Warm-up: 130-145 bpm (Zone 1-2)\n• Tempo intervals: 165-175 bpm (Zone 4)\n• Recovery: Let it drop to 140 bpm before next interval',
      paceGuidance: '• Warm-up: 6:00-6:30 /km\n• Tempo intervals: 4:35-4:50 /km\n• Recovery jog: 6:00+ /km',
      coachingTips: [
        'Start each interval conservatively - don\'t go out too fast',
        'Focus on relaxed shoulders and quick cadence',
        'Breathe rhythmically (3:2 or 2:2 pattern)',
        'The last interval should feel hard but you could do one more',
      ],
      adaptationNotes: 'If struggling, reduce to 2 x 10min or 3 x 8min. Better to complete at slightly slower pace than to stop.',
    },
    {
      name: 'Interval Training - VO2max',
      duration: 50,
      distance: 9,
      purpose: 'Develop your maximum oxygen uptake capacity and improve running economy at high speeds.',
      description: '🏃 INTERVAL TRAINING - VO2max Development\n\n📍 Duration: 50min | Distance: ~9km\n\n🎯 PURPOSE:\nThese high-intensity intervals push your aerobic system to its limits, improving your VO2max and running economy.',
      structure: [
        { name: 'Warm-up', duration: '15 min', description: 'Easy jog + dynamic stretches + 4 strides' },
        { name: 'Main set', duration: '5 x 3min', description: 'Hard effort with 2min easy jog recovery' },
        { name: 'Cool-down', duration: '10 min', description: 'Easy jog' },
      ],
      heartRateGuidance: '• Intervals: 90-95% max HR\n• Recovery: Let HR drop to 65% before next interval\n• Don\'t start too fast - build into each interval',
      paceGuidance: '• Interval pace: 4:00-4:20 /km\n• This feels HARD - breathing is labored\n• Recovery: 6:00+ /km',
      coachingTips: [
        'First interval should feel "too easy" - trust the pace',
        'Focus on maintaining form as you fatigue',
        'Quick, light feet - imagine running on hot coals',
        'Full recovery between intervals is crucial',
      ],
      adaptationNotes: 'If HR stays elevated in recovery, add 30 seconds rest. Can reduce to 4 intervals if needed.',
    },
  ],
  bike: [
    {
      name: 'Easy Spin',
      duration: 60,
      distance: 25,
      purpose: 'Active recovery ride to flush the legs and maintain cycling fitness without adding stress.',
      description: '🚴 EASY SPIN - Active Recovery\n\n📍 Duration: 60min | Distance: ~25km\n\n🎯 PURPOSE:\nThis easy spin keeps your legs moving without adding training stress. Perfect after a hard run day.',
      structure: [
        { name: 'Warm-up', duration: '10 min', description: 'Very easy spinning, high cadence' },
        { name: 'Main ride', duration: '45 min', description: 'Steady Zone 1-2 effort' },
        { name: 'Cool-down', duration: '5 min', description: 'Very easy spinning' },
      ],
      heartRateGuidance: '• Keep HR below 130 bpm\n• If you feel your legs burning, you\'re going too hard\n• This is true recovery',
      paceGuidance: '• Power: 100-150W (below 55% FTP)\n• Cadence: 90-100 rpm\n• Flat terrain preferred',
      coachingTips: [
        'High cadence, low resistance',
        'Great time to practice smooth pedaling technique',
        'Keep it social if riding with others',
        'Indoor trainer is fine for this session',
      ],
      adaptationNotes: 'Can substitute with 45-60 minute easy walk if feeling particularly fatigued.',
    },
    {
      name: 'Long Endurance Ride',
      duration: 180,
      distance: 75,
      purpose: 'Build aerobic endurance for the bike leg and practice nutrition strategy.',
      description: '🚴 LONG ENDURANCE RIDE\n\n📍 Duration: 3h | Distance: ~75km\n\n🎯 PURPOSE:\nThis long ride builds your cycling endurance and is perfect for practicing race nutrition.',
      structure: [
        { name: 'Warm-up', duration: '15 min', description: 'Easy spinning, gradually building' },
        { name: 'Main set', duration: '2h 30min', description: 'Steady Zone 2 effort' },
        { name: 'Cool-down', duration: '15 min', description: 'Easy spinning' },
      ],
      heartRateGuidance: '• Target: 130-150 bpm (Zone 2)\n• Avoid Zone 3 creep - stay patient\n• HR may drift up late - that\'s normal if pace is consistent',
      paceGuidance: '• Power: 150-180W (65-75% FTP)\n• Cadence: 85-95 rpm\n• Aim for consistent effort, not speed',
      coachingTips: [
        'Practice race nutrition: aim for 60-80g carbs per hour',
        'Stay aero on the flats, sit up on climbs',
        'Use this to test equipment and bike fit',
        'Perfect opportunity for a brick run after (optional 15min easy jog)',
      ],
      adaptationNotes: 'If weather is bad, can split into 2 x 1.5h rides or do 2.5h on trainer with entertainment.',
    },
  ],
  swim: [
    {
      name: 'Technique & Endurance Swim',
      duration: 50,
      distance: 2,
      purpose: 'Build swimming endurance while maintaining good technique through focused drills.',
      description: '🏊 TECHNIQUE & ENDURANCE SWIM\n\n📍 Duration: 50min | Distance: ~2,000m\n\n🎯 PURPOSE:\nBuild swimming endurance while maintaining good technique. Focus on efficiency over speed.',
      structure: [
        { name: 'Warm-up', duration: '400m', description: '200m easy freestyle + 4 x 50m drill/swim by 25m' },
        { name: 'Technique set', duration: '600m', description: '6 x 100m as: 25m drill + 75m swim with 15sec rest' },
        { name: 'Endurance set', duration: '800m', description: '4 x 200m steady with 20sec rest' },
        { name: 'Cool-down', duration: '200m', description: 'Easy backstroke or choice' },
      ],
      heartRateGuidance: '• Warm-up: Very easy, focus on feeling the water\n• Drills: Slow and deliberate\n• Main endurance set: Moderate effort (6/10)',
      paceGuidance: '• Target 200m pace: 3:30-3:45\n• Drill segments: Don\'t rush - quality over speed\n• You should finish feeling like you could do more',
      coachingTips: [
        'Count your strokes per length - aim for consistency',
        'Breathe every 3 strokes (bilateral) during warm-up',
        'Breathe every 2 strokes if needed during main set',
        'Push off walls strong - free speed!',
      ],
      adaptationNotes: 'If pool is crowded, adjust rest intervals. Can reduce to 1,600m if short on time.',
    },
  ],
  strength: [
    {
      name: 'Core & Stability',
      duration: 30,
      purpose: 'Build core strength and stability to improve running form and prevent injury.',
      description: '💪 CORE & STABILITY SESSION\n\n📍 Duration: 30min\n\n🎯 PURPOSE:\nStrengthen your core and improve stability for better running form and injury prevention.',
      structure: [
        { name: 'Warm-up', duration: '5 min', description: 'Dynamic stretches and activation' },
        { name: 'Circuit 1', duration: '10 min', description: 'Plank variations, dead bugs, bird dogs' },
        { name: 'Circuit 2', duration: '10 min', description: 'Single-leg exercises, glute bridges, clamshells' },
        { name: 'Cool-down', duration: '5 min', description: 'Static stretching' },
      ],
      heartRateGuidance: '• This isn\'t about HR - focus on quality movements\n• Take your time with each exercise\n• Rest as needed between exercises',
      paceGuidance: '• 8-12 reps per exercise\n• 2-3 rounds of each circuit\n• 30-45 seconds between exercises',
      coachingTips: [
        'Quality over quantity - perfect form is essential',
        'Engage your core throughout every movement',
        'Breathe! Don\'t hold your breath',
        'Great to do after an easy run',
      ],
      adaptationNotes: 'Can extend to 45 minutes if feeling good. Skip if you have a hard run the next day.',
    },
  ],
  rest: [
    {
      name: 'Rest Day',
      duration: 0,
      purpose: 'Complete rest to allow your body to adapt and recover from training stress.',
      description: '😴 REST DAY\n\n🎯 PURPOSE:\nRest is when your body adapts and gets stronger. Embrace it!\n\n✅ WHAT TO DO:\n• Sleep 7-9 hours\n• Eat nutritious food\n• Stay hydrated\n• Light stretching if desired\n• Foam rolling optional\n\n❌ WHAT NOT TO DO:\n• Don\'t sneak in a workout\n• Don\'t feel guilty\n• Avoid strenuous activities',
      structure: [],
      heartRateGuidance: '',
      paceGuidance: '',
      coachingTips: [
        'Rest is training - this is when you get stronger',
        'Light walking or stretching is fine',
        'Focus on sleep quality tonight',
        'Good time to meal prep for the week',
      ],
      adaptationNotes: '',
    },
  ],
};

function getRandomWorkout(type: WorkoutType): Partial<Workout> {
  const templates = workoutTemplates[type];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateWeek(weekNumber: number, startDate: Date): WeekPlan {
  const themes = [
    { theme: 'Base Building', focus: 'Aerobic foundation and easy volume' },
    { theme: 'Endurance Development', focus: 'Longer sessions, steady effort' },
    { theme: 'Threshold Building', focus: 'Quality tempo work' },
    { theme: 'Recovery Week', focus: 'Reduced volume, maintain intensity' },
  ];
  
  const { theme, focus } = themes[(weekNumber - 1) % 4];
  
  const workouts: Workout[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Weekly pattern
  const weekPattern: (WorkoutType | null)[] = [
    'run', // Monday - easy run
    'strength', // Tuesday - strength
    'run', // Wednesday - quality run
    'bike', // Thursday - bike (for triathletes) or run
    'rest', // Friday - rest
    'run', // Saturday - long run
    'swim', // Sunday - swim (for triathletes) or rest
  ];
  
  weekPattern.forEach((type, index) => {
    const workoutDate = new Date(startDate);
    workoutDate.setDate(startDate.getDate() + index);
    
    if (type) {
      const template = getRandomWorkout(type);
      const workout: Workout = {
        id: `week${weekNumber}-day${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: workoutDate,
        type,
        name: template.name || 'Workout',
        duration: template.duration || 45,
        distance: template.distance,
        description: template.description || '',
        purpose: template.purpose || '',
        structure: template.structure || [],
        heartRateGuidance: template.heartRateGuidance || '',
        paceGuidance: template.paceGuidance || '',
        coachingTips: template.coachingTips || [],
        adaptationNotes: template.adaptationNotes || '',
        status: 'planned',
      };
      workouts.push(workout);
    }
  });
  
  const totalHours = workouts.reduce((sum, w) => sum + w.duration, 0) / 60;
  
  return {
    weekNumber,
    theme,
    focus,
    totalHours: Math.round(totalHours * 10) / 10,
    workouts,
  };
}

export function generateMockPlan(): TrainingPlan {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1); // Get this Monday
  
  const weeks: WeekPlan[] = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + i * 7);
    weeks.push(generateWeek(i + 1, weekStart));
  }
  
  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date(),
    weeks,
    phase: 'Base Building',
    notes: 'This plan focuses on building your aerobic foundation while gradually introducing quality sessions.',
  };
}
