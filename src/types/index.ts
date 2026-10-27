// Food Verse AI TypeScript Interfaces

export type PageView =
  | 'home'
  | 'dashboard'
  | 'recognition'
  | 'freshness'
  | 'hygiene'
  | 'cooking'
  | 'nutrition'
  | 'history'
  | 'settings';

export interface UserProfile {
  name: string;
  email?: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel: string;
  dietaryPreference: string;
  allergies: string[];
  measurementUnits: 'metric' | 'imperial';
  privacyConsent: boolean;
  dailyCalorieTarget: number;
}

export interface FoodRecognitionResult {
  foodName: string;
  cuisine: string;
  identifiedItems: Array<{
    name: string;
    category: string;
    visibility: 'High' | 'Medium' | 'Low';
  }>;
  possibleIngredients: string[];
  estimatedPortion: string;
  portionConfidence: 'High' | 'Medium' | 'Low';
  estimatedCalories: {
    min: number;
    max: number;
    unit: string;
  };
  macronutrients: {
    proteinGrams: string;
    carbsGrams: string;
    fatGrams: string;
    fiberGrams: string;
  };
  preparationMethod: string;
  dietaryObservations: string[];
  potentialAllergens: string[];
  confidenceNotes: string;
  culinaryInsight: string;
}

export interface FreshnessResult {
  itemDetected: string;
  category: string;
  apparentFreshnessGrade: 'Fresh' | 'Peak Quality' | 'Slightly Aged' | 'Degraded / Past Peak' | 'Questionable / Visible Spoilage';
  freshnessScore: number; // 0 - 100
  visualIndicators: Array<{
    indicator: string;
    status: 'Not Observed' | 'Minor / Early' | 'Moderate' | 'Severe';
    details: string;
  }>;
  observedConcerns: string[];
  recommendedAction: string;
  storageOptimizationTips: string[];
  sensoryChecklist: string[];
  safetyDisclaimer: string;
}

export interface HygieneCategory {
  name: string;
  status: string;
  details: string;
}

export interface HygieneResult {
  environmentType: string;
  overallHygieneRating: 'Good' | 'Satisfactory' | 'Needs Attention' | 'Significant Risk Observed';
  riskSeverity: 'Low' | 'Moderate' | 'High';
  summary: string;
  categories: HygieneCategory[];
  positivePractices: string[];
  areasForImprovement: string[];
  limitationsAndDisclaimer: string;
}

export interface RecipeIngredient {
  item: string;
  amount: string;
  isPantryStaple?: boolean;
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  skillLevel: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutritionalEstimatePerServing: {
    calories: number;
    protein: string;
    carbohydrates: string;
    fat: string;
    fiber: string;
  };
  substitutions: Array<{ original: string; substitute: string }>;
  foodSafetyTips: string[];
  chefTips: string;
  savedAt?: string;
}

export interface NutritionPlan {
  energyCalculations: {
    estimatedBMR: number;
    estimatedTDEE: number;
    targetDailyCalories: number;
    calorieGoalRationale: string;
    macroTargets: {
      proteinGrams: number;
      proteinPercent: number;
      carbsGrams: number;
      carbsPercent: number;
      fatGrams: number;
      fatPercent: number;
      fiberGrams: number;
    };
  };
  meals: Array<{
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    title: string;
    description: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    ingredients: Array<{ name: string; portion: string; category: string }>;
    prepTimeMinutes: number;
    quickInstructions: string;
  }>;
  consolidatedGroceryList: Array<{
    category: string;
    items: string[];
  }>;
  hydrationGoalLiters: number;
  dietitianGuidance: string;
  medicalDisclaimer: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  toolType: 'recognition' | 'freshness' | 'hygiene' | 'cooking' | 'nutrition';
  title: string;
  summary: string;
  imageUrl?: string;
  details: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: string;
}
