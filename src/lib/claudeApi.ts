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
 * This determines what type of training focus the athlete needs
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
 * Builds the prompt that we send to Claude
 * This is the most important part - a good prompt = good training plan
 */
function buildPrompt(userData: OnboardingData): string {
  const weeksUntilRace = getWeeksUntilRace(new Date(userData.goal.raceDate));
  const phase = calculateTrainingPhase(weeksUntilRace);
  
  // Determine which disciplines based on race type
  const isTriathlon = ['olympic-triathlon', 'sprint-triathlon', '70.3-ironman', 'full-ironman'].includes(userData.goal.raceType);
  
  return `You are an expert endurance coach creating a personalized 4-week training plan.

## ATHLETE PROFILE
- Name: ${userData.profile.firstName}
- Age: ${userData.profile.age}
- Gender: ${userData.profile.gender}
- Weight: ${userData.profile.weight}kg
- Height: ${userData.profile.height}cm

## CURRENT FITNESS
- Experience Level: ${userData.fitness.fitnessLevel}
- Max Heart Rate: ${userData.fitness.maxHR} bpm
- Lactate Threshold HR: ${userData.fitness.lthr} bpm
- Threshold Running Pace: ${userData.fitness.thresholdPace} /km
${userData.fitness.ftp ? `- FTP (cycling): ${userData.fitness.ftp} watts` : ''}
- Swimming Level: ${userData.fitness.swimLevel}

## GOAL
- Race Type: ${userData.goal.raceType}
- Race Name: ${userData.goal.raceName}
- Race Date: ${new Date(userData.goal.raceDate).toLocaleDateString()}
- Weeks Until Race: ${weeksUntilRace}
- Current Training Phase: ${phase}
- Goal: ${userData.goal.priority}
${userData.goal.goalTime ? `- Target Time: ${userData.goal.goalTime}` : ''}

## WEEKLY AVAILABILITY
- Monday: ${userData.availability.monday.available ? `Available (${userData.availability.monday.timeSlots.join(', ')}, max ${userData.availability.monday.maxDuration})` : 'Not available'}
- Tuesday: ${userData.availability.tuesday.available ? `Available (${userData.availability.tuesday.timeSlots.join(', ')}, max ${userData.availability.tuesday.maxDuration})` : 'Not available'}
- Wednesday: ${userData.availability.wednesday.available ? `Available (${userData.availability.wednesday.timeSlots.join(', ')}, max ${userData.availability.wednesday.maxDuration})` : 'Not available'}
- Thursday: ${userData.availability.thursday.available ? `Available (${userData.availability.thursday.timeSlots.join(', ')}, max ${userData.availability.thursday.maxDuration})` : 'Not available'}
- Friday: ${userData.availability.friday.available ? `Available (${userData.availability.friday.timeSlots.join(', ')}, max ${userData.availability.friday.maxDuration})` : 'Not available'}
- Saturday: ${userData.availability.saturday.available ? `Available (${userData.availability.saturday.timeSlots.join(', ')}, max ${userData.availability.saturday.maxDuration})${userData.availability.saturday.longSession ? ' - LONG SESSION DAY' : ''}` : 'Not available'}
- Sunday: ${userData.availability.sunday.available ? `Available (${userData.availability.sunday.timeSlots.join(', ')}, max ${userData.availability.sunday.maxDuration})${userData.availability.sunday.longSession ? ' - LONG SESSION DAY' : ''}` : 'Not available'}
- Weekly Hours Target: ${userData.availability.weeklyHoursTarget}

## INSTRUCTIONS
Create a 4-week training plan. ${isTriathlon ? 'Include swim, bike, and run workouts.' : 'Focus on running workouts.'}

For each workout, provide:
1. A clear name
2. Duration in minutes
3. Distance (if applicable)
4. Detailed purpose explanation
5. Complete structure (warm-up, main set, cool-down)
6. Heart rate guidance based on their LTHR
7. Pace guidance based on their threshold pace
8. 3-4 coaching tips
9. Adaptation notes for if they're tired or feeling great

IMPORTANT: Return ONLY valid JSON matching this exact structure, no other text:

{
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "string",
      "focus": "string",
      "workouts": [
        {
          "dayOfWeek": "monday|tuesday|wednesday|thursday|friday|saturday|sunday",
          "type": "run|bike|swim|strength|rest",
          "name": "string",
          "duration": number,
          "distance": number or null,
          "purpose": "string",
          "description": "string with full formatted workout details",
          "structure": [
            {"name": "string", "duration": "string", "description": "string"}
          ],
          "heartRateGuidance": "string",
          "paceGuidance": "string",
          "coachingTips": ["string"],
          "adaptationNotes": "string"
        }
      ]
    }
  ],
  "phase": "string",
  "notes": "string"
}`;
}

/**
 * Cleans and fixes common JSON issues from Claude's response
 */
function cleanJsonString(str: string): string {
  // Remove any markdown code blocks
  str = str.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove trailing commas before ] or }
  str = str.replace(/,(\s*[\]}])/g, '$1');
  
  // Fix any unescaped newlines in strings
  str = str.replace(/(?<!\\)\n(?=(?:[^"]*"[^"]*")*[^"]*"[^"]*$)/g, '\\n');
  
  return str.trim();
}

/**
 * Parses Claude's JSON response into our TrainingPlan type
 */
function parseClaudeResponse(responseText: string, userData: OnboardingData): TrainingPlan {
  console.log('Parsing Claude response...');
  
  // Try to extract JSON from the response (Claude sometimes adds extra text)
  let jsonStr = responseText;
  
  // Find JSON object in response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }
  
  // Clean the JSON string
  jsonStr = cleanJsonString(jsonStr);
  
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (firstError) {
    console.log('First parse attempt failed, trying to fix JSON...');
    
    // Try more aggressive cleaning
    // Remove all control characters except newlines in strings
    jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (match) => {
      if (match === '\n' || match === '\r' || match === '\t') {
        return match;
      }
      return '';
    });
    
    // Try parsing again
    try {
      parsed = JSON.parse(jsonStr);
    } catch (secondError) {
      console.error('JSON parsing failed after cleanup:', secondError);
      console.log('Raw response (first 1000 chars):', responseText.substring(0, 1000));
      throw new Error('Failed to parse Claude response as JSON');
    }
  }
  
  console.log('Successfully parsed Claude response');
  
  // Get the Monday of the current week as our start date
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  // Map days to numbers for date calculation
  const dayToNumber: Record<string, number> = {
    monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
    friday: 4, saturday: 5, sunday: 6
  };
  
  // Transform the parsed data into our TrainingPlan structure
  const weeks: WeekPlan[] = parsed.weeks.map((week: any, weekIndex: number) => {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + weekIndex * 7);
    
    const workouts: Workout[] = week.workouts.map((w: any) => {
      const workoutDate = new Date(weekStart);
      const dayNum = dayToNumber[w.dayOfWeek?.toLowerCase()] ?? 0;
      workoutDate.setDate(weekStart.getDate() + dayNum);
      
      return {
        id: `week${weekIndex + 1}-${w.dayOfWeek}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: workoutDate,
        type: w.type as WorkoutType,
        name: w.name || 'Workout',
        duration: w.duration || 45,
        distance: w.distance || undefined,
        description: w.description || '',
        purpose: w.purpose || '',
        structure: w.structure || [],
        heartRateGuidance: w.heartRateGuidance || '',
        paceGuidance: w.paceGuidance || '',
        coachingTips: w.coachingTips || [],
        adaptationNotes: w.adaptationNotes || '',
        status: 'planned' as const,
      };
    });
    
    const totalHours = workouts.reduce((sum, w) => sum + w.duration, 0) / 60;
    
    return {
      weekNumber: week.weekNumber,
      theme: week.theme || `Week ${weekIndex + 1}`,
      focus: week.focus || '',
      totalHours: Math.round(totalHours * 10) / 10,
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
  // Check if API key is configured
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is not configured. Please add VITE_ANTHROPIC_API_KEY to your .env.local file.');
  }
  
  // Build the prompt
  const prompt = buildPrompt(userData);
  
  console.log('Sending request to Claude API...');
  
  // Make the API request
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true', // Required for browser requests
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000, // Training plans are long, need lots of tokens
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });
  
  // Check for errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Claude API error:', errorData);
    throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }
  
  // Parse the response
  const data = await response.json();
  console.log('Received response from Claude');
  
  // Extract the text content from Claude's response
  const responseText = data.content[0].text;
  
  // Parse and return the training plan
  return parseClaudeResponse(responseText, userData);
}