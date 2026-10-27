// Client API service for Food Verse AI

import {
  FoodRecognitionResult,
  FreshnessResult,
  HygieneResult,
  Recipe,
  NutritionPlan,
  HistoryItem,
  UserProfile,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected server error occurred.';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = `Server error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async checkHealth(): Promise<{ status: string; hasApiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      return await handleResponse(res);
    } catch (err: any) {
      return { status: 'error', hasApiKey: false };
    }
  },

  async recognizeFood(image: string, notes?: string): Promise<FoodRecognitionResult> {
    const res = await fetch('/api/food-recognition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, notes }),
    });
    return handleResponse<FoodRecognitionResult>(res);
  },

  async analyzeFreshness(params: {
    image: string;
    category: string;
    storageConditions?: string;
    purchaseDate?: string;
  }): Promise<FreshnessResult> {
    const res = await fetch('/api/freshness-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<FreshnessResult>(res);
  },

  async analyzeHygiene(params: {
    mediaType: 'image' | 'video';
    image?: string;
    frames?: Array<{ data: string; timestamp?: string }>;
    notes?: string;
  }): Promise<HygieneResult> {
    const res = await fetch('/api/hygiene-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<HygieneResult>(res);
  },

  async generateRecipes(params: {
    ingredients: string[];
    cuisine?: string;
    dietary?: string[];
    cookingTime?: string;
    skillLevel?: string;
    servings?: number;
    pantryStaplesAllowed?: boolean;
  }): Promise<{ recipes: Recipe[] }> {
    const res = await fetch('/api/recipe-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<{ recipes: Recipe[] }>(res);
  },

  async recipeFollowup(params: {
    recipe: Recipe;
    query: string;
    newServings?: number;
    detailLevel?: 'simpler' | 'detailed';
  }): Promise<{
    answer: string;
    adjustedIngredients?: Array<{ item: string; amount: string }>;
    clarifiedSteps?: string[];
    practicalTip?: string;
  }> {
    const res = await fetch('/api/recipe-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async planNutrition(params: {
    age?: number;
    gender?: string;
    heightCm?: number;
    weightKg?: number;
    activityLevel: string;
    dietaryPreference: string;
    allergies: string[];
    nutritionGoal: string;
    mealSchedule?: string;
    foodsToAvoid?: string[];
  }): Promise<NutritionPlan> {
    const res = await fetch('/api/nutrition-planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<NutritionPlan>(res);
  },

  async chat(params: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    image?: string;
  }): Promise<{ reply: string }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<{ reply: string }>(res);
  },

  // History & Persistence
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await fetch('/api/history');
      return await handleResponse<HistoryItem[]>(res);
    } catch {
      return [];
    }
  },

  async saveHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse<HistoryItem>(res);
  },

  async deleteHistoryItem(id: string): Promise<void> {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
  },

  async clearAllHistory(): Promise<void> {
    await fetch('/api/history', { method: 'DELETE' });
  },

  // Saved Recipes
  async getSavedRecipes(): Promise<Recipe[]> {
    try {
      const res = await fetch('/api/recipes');
      return await handleResponse<Recipe[]>(res);
    } catch {
      return [];
    }
  },

  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    return handleResponse<Recipe>(res);
  },

  async deleteRecipe(id: string): Promise<void> {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile');
    return handleResponse<UserProfile>(res);
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  },
};
