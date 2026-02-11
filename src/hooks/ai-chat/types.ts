
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  buttons?: string[];
}

export interface WebhookResponse {
  output: {
    text: string;
    button?: string;
  };
}

export interface UserData {
  user: {
    id?: string;
    email?: string;
    name?: string;
    coach_company?: string;
  };
  profile: {
    weight_kg?: number;
    height_cm?: number;
    age?: number | null;
    gender?: string;
    body_fat_percentage?: number;
    main_goal?: string;
    target_weight_kg?: number;
    target_pace?: string;
    target_kg_per_week?: number;
    trainings_per_week?: number;
    previous_app_experience?: string;
  };
  nutrition: {
    daily_targets: {
      calories: number;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
    today_consumed: {
      calories: number;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
    food_entries_today: Array<{
      food_name?: string;
      portion_size?: number;
      calories?: number;
      protein_g?: number;
      carbs_g?: number;
      fat_g?: number;
      meal_type?: string;
    }>;
  };
  routines: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    estimated_duration_minutes?: number;
    exercise_count?: number;
  }>;
  chat_history: Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>;
}
