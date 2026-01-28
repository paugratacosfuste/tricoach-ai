// src/lib/claudeApi.ts
// 
// PURPOSE: This file handles all communication with the Claude API.
// It takes user data, builds a prompt, sends it to Claude, and parses the response.

import { OnboardingData, TrainingPlan, WeekPlan, Workout, WorkoutType } from '@/types/training';

// Get the API key from environment variables
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// The API endpoint for Claude
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Calculates the training phase based on weeks until race
 */
function calculateTrainingPhase(weeksUntilRace: number): string {
  if (weeksUntilRace > 16) return 'Base Building';
  if (weeksUntilRace > 12) return 'Build Phase 1';
  if (weeksUntilRace > 8) return 'Build Phase 2';
  if (weeksUntilRace > 4) return 'Peak Phase';
  return 'Taper';
}

/**
 * Calculates weeks until the race date
 */
function getWeeksUntilRace(raceDate: Date): number {
  const now = new Date();
  const diffTime = raceDate.getTime() - now.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, diffWeeks);
}

/**
 * Builds a CONCISE prompt to avoid response truncation
 */
function buildPrompt(userData: OnboardingData): string {
  const weeksUntilRace = getWeeksUntilRace(new Date(userData.goal.raceDate));
  const phase = calculateTrainingPhase(weeksUntilRace);
  const isTriathlon = ['olympic-triathlon', 'sprint-triathlon', '70.3-ironman', 'full-ironman'].includes(userData.goal.raceType);
  
  return `You are an expert endurance coach. Create a 4-week training plan as JSON.

ATHLETE: ${userData.profile.firstName}, ${userData.profile.age}yo, ${userData.profile.weight}kg
FITNESS: ${userData.fitness.fitnessLevel}, LTHR ${userData.fitness.lthr}bpm, threshold pace ${userData.fitness.thresholdPace}/km, max HR ${userData.fitness.maxHR}bpm
GOAL: ${userData.goal.raceType} "${userData.goal.raceName}" on ${new Date(userData.goal.raceDate).toLocaleDateString()} (${weeksUntilRace} weeks away)
PHASE: ${phase}
DISCIPLINES: ${isTriathlon ? 'swim, bike, run' : 'run only'}

AVAILABILITY:
Mon: ${userData.availability.monday.available ? userData.availability.monday.maxDuration : 'off'}
Tue: ${userData.availability.tuesday.available ? userData.availability.tuesday.maxDuration : 'off'}
Wed: ${userData.availability.wednesday.available ? userData.availability.wednesday.maxDuration : 'off'}
Thu: ${userData.availability.thursday.available ? userData.availability.thursday.maxDuration : 'off'}
Fri: ${userData.availability.friday.available ? userData.availability.friday.maxDuration : 'off'}
Sat: ${userData.availability.saturday.available ? userData.availability.saturday.maxDuration + (userData.availability.saturday.longSession ? ' LONG' : '') : 'off'}
Sun: ${userData.availability.sunday.available ? userData.availability.sunday.maxDuration + (userData.availability.sunday.longSession ? ' LONG' : '') : 'off'}

Return ONLY this JSON structure (no markdown, no extra text):
{
  "phase": "${phase}",
  "notes": "brief overview",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "week theme",
      "focus": "week focus",
      "workouts": [
        {
          "dayOfWeek": "monday",
          "type": "run",
          "name": "Workout Name",
          "duration": 45,
          "distance": 8,
          "purpose": "why this workout",
          "description": "Full workout description with warm-up, main set, cool-down details. Include HR zones and pace targets.",
          "coachingTips": ["tip1", "tip2"]
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Include 4-6 workouts per week based on availability
- Keep descriptions under 200 characters
- Use type: "run", "bike", "swim", "strength", or "rest"
- distance is in km (null for strength/rest)
- duration is in minutes
- Return valid JSON only - no trailing commas`;
}

/**
 * Attempts to fix and complete truncated JSON
 */
function fixTruncatedJson(str: string): string {
  // Remove markdown code blocks
  str = str.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  // Count brackets to see what's missing
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
  }
  
  // If we're in a string, close it
  if (inString) {
    str += '"';
  }
  
  // Remove any trailing commas
  str = str.replace(/,\s*$/, '');
  
  // Add missing closing brackets and braces
  while (openBrackets > 0) {
    // Check if we need to close an object first
    const lastOpenBracket = str.lastIndexOf('[');
    const lastOpenBrace = str.lastIndexOf('{');
    const lastCloseBracket = str.lastIndexOf(']');
    const lastCloseBrace = str.lastIndexOf('}');
    
    if (lastOpenBrace > lastOpenBracket && lastOpenBrace > lastCloseBrace) {
      str = str.replace(/,\s*$/, '') + '}';
      openBraces--;
    } else {
      str = str.replace(/,\s*$/, '') + ']';
      openBrackets--;
    }
  }
  
  while (openBraces > 0) {
    str = str.replace(/,\s*$/, '') + '}';
    openBraces--;
  }
  
  // Final cleanup of trailing commas
  str = str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
  
  return str;
}

/**
 * Parses Claude's JSON response into our TrainingPlan type
 */
function parseClaudeResponse(responseText: string): TrainingPlan {
  console.log('Parsing Claude response, length:', responseText.length);
  
  // Extract JSON from response
  let jsonStr = responseText.trim();
  
  // Find JSON boundaries
  const startIndex = jsonStr.indexOf('{');
  if (startIndex > 0) {
    jsonStr = jsonStr.substring(startIndex);
  }
  
  // Try to fix truncated JSON
  jsonStr = fixTruncatedJson(jsonStr);
  
  console.log('Cleaned JSON length:', jsonStr.length);
  
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON parse error:', error);
    console.log('First 300 chars:', jsonStr.substring(0, 300));
    console.log('Last 300 chars:', jsonStr.substring(jsonStr.length - 300));
    throw new Error('Failed to parse training plan from AI response');
  }
  
  // Validate basic structure
  if (!parsed.weeks || !Array.isArray(parsed.weeks)) {
    throw new Error('Invalid response: missing weeks array');
  }
  
  console.log('Parsed', parsed.weeks.length, 'weeks');
  
  // Get Monday of current week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  
  const dayToNumber: Record<string, number> = {
    monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
    friday: 4, saturday: 5, sunday: 6
  };
  
  // Transform to our TrainingPlan type
  const weeks: WeekPlan[] = parsed.weeks.map((week: any, weekIndex: number) => {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + weekIndex * 7);
    
    const workouts: Workout[] = (week.workouts || []).map((w: any) => {
      const workoutDate = new Date(weekStart);
      const dayStr = (w.dayOfWeek || 'monday').toLowerCase();
      workoutDate.setDate(weekStart.getDate() + (dayToNumber[dayStr] ?? 0));
      
      return {
        id: `w${weekIndex + 1}-${dayStr}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        date: workoutDate,
        type: (w.type || 'run') as WorkoutType,
        name: w.name || 'Workout',
        duration: w.duration || 45,
        distance: w.distance || undefined,
        description: w.description || w.purpose || '',
        purpose: w.purpose || '',
        structure: w.structure || [],
        heartRateGuidance: w.heartRateGuidance || '',
        paceGuidance: w.paceGuidance || '',
        coachingTips: w.coachingTips || [],
        adaptationNotes: w.adaptationNotes || '',
        status: 'planned' as const,
      };
    });
    
    return {
      weekNumber: week.weekNumber || weekIndex + 1,
      theme: week.theme || `Week ${weekIndex + 1}`,
      focus: week.focus || '',
      totalHours: Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60 * 10) / 10,
      workouts,
    };
  });
  
  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date(),
    weeks,
    phase: parsed.phase || 'Training',
    notes: parsed.notes || '',
  };
}

/**
 * Main function: Generates a training plan using Claude AI
 */
export async function generateTrainingPlanWithClaude(userData: OnboardingData): Promise<TrainingPlan> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured. Add VITE_ANTHROPIC_API_KEY to .env.local');
  }
  
  const prompt = buildPrompt(userData);
  console.log('Sending request to Claude API...');
  
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Claude API error:', errorData);
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Received response from Claude');
  
  // Check if response was truncated
  if (data.stop_reason === 'max_tokens') {
    console.warn('Response was truncated due to max_tokens limit');
  }
  
  const responseText = data.content[0].text;
  return parseClaudeResponse(responseText);
}