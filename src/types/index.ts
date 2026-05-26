export type RaceType =
  | "hyrox"
  | "marathon"
  | "half_marathon"
  | "10k"
  | "5k"
  | "triathlon"
  | "ocr"
  | "other";

export type RaceSubtype =
  | "hyrox_open"
  | "hyrox_pro"
  | "hyrox_doubles"
  | "marathon"
  | "half_marathon"
  | "10k"
  | "5k"
  | "other";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface Race {
  id: string;
  user_id: string;
  name: string;
  race_type: RaceType;
  race_subtype: RaceSubtype | null;
  race_date: string;
  location: string | null;
  distance_km: number | null;
  goal_time_seconds: number | null;
  current_fitness: FitnessLevel | null;
  notes: string | null;
  created_at: string;
}

export type SessionType =
  | "run"
  | "ride"
  | "swim"
  | "strength"
  | "hyrox"
  | "ocr"
  | "yoga"
  | "rest"
  | "other";

export type SessionSource = "manual" | "strava" | "whoop" | "google_calendar" | "screenshot_import" | "ai_generated";

export interface TrainingSession {
  id: string;
  user_id: string;
  race_id: string | null;
  session_date: string;
  title: string;
  session_type: SessionType;
  duration_minutes: number | null;
  distance_km: number | null;
  perceived_effort: number | null;
  pace_per_km_seconds: number | null;
  notes: string | null;
  source: SessionSource;
  external_id: string | null;
  created_at: string;
}

export interface NutritionGoals {
  id: string;
  user_id: string;
  calories_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  updated_at: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: MealType;
  food_name: string;
  brand: string | null;
  serving_size_g: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  usda_fdc_id: string | null;
  created_at: string;
}

export interface RecoveryLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  soreness: number | null;
  energy: number | null;
  hrv_ms: number | null;
  resting_hr: number | null;
  notes: string | null;
  source: "manual" | "whoop";
  created_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  name: string;
  dose: string | null;
  timing: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface SupplementLog {
  id: string;
  user_id: string;
  supplement_id: string;
  taken_date: string;
  taken_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
}

export type IntegrationProvider = "strava" | "whoop" | "google_calendar" | "gmail";

export interface Integration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  athlete_id: string | null;
  scope: string | null;
  gcal_calendar_id: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type JournalEntryType = "morning" | "evening";

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: JournalEntryType;
  intention: string | null;
  content: string | null;
  ai_prompts: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  weight_goal_kg: number | null;
  pace_unit: "km" | "mile";
  created_at: string;
}

// USDA food search result
export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  nutrients: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

// Pace calculation types
export interface PaceZones {
  race_pace_sec_per_km: number;
  tempo_sec_per_km: number;
  easy_sec_per_km: number;
  interval_sec_per_km: number;
}

// RAG status
export type RAGStatus = "green" | "amber" | "red" | "none";

export interface DimensionStatus {
  status: RAGStatus;
  label: string;
  value: string;
  trend: number[];
}

// Strava activity (simplified)
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  average_speed: number;
  total_elevation_gain: number;
}

// Whoop recovery cycle (simplified)
export interface WhoopCycle {
  id: number;
  start: string;
  end: string;
  score: {
    recovery_score: number;
    hrv_rmssd_milli: number;
    resting_heart_rate: number;
    sleep_performance_percentage: number;
  } | null;
}

// Training plan week
export interface TrainingPlanWeek {
  week_number: number;
  start_date: string;
  sessions: {
    day: string;
    title: string;
    session_type: SessionType;
    duration_minutes: number;
    distance_km?: number;
    pace_zone?: "easy" | "tempo" | "race" | "interval";
    coaching_note: string;
  }[];
}

export interface Podcast {
  name: string;
  host: string;
  description: string;
  url: string;
  category: "endurance" | "strength" | "mindset" | "nutrition" | "hyrox";
}
