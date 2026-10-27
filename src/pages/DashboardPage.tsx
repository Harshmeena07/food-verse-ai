import React, { useState, useEffect } from 'react';
import { PageView, HistoryItem, Recipe, UserProfile, NutritionPlan } from '../types';
import { api } from '../services/api';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  ChefHat,
  Apple,
  ArrowRight,
  Clock,
  Plus,
  BookOpen,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onOpenChat: () => void;
  onViewHistoryItem?: (item: HistoryItem) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenChat,
  onViewHistoryItem,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, histData, recipeData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getHistory().catch(() => []),
          api.getSavedRecipes().catch(() => []),
        ]);
        if (profData) setProfile(profData);
        setHistory(histData || []);
        setSavedRecipes(recipeData || []);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDemoData = async () => {
    try {
      const demoItem: HistoryItem = {
        id: 'rec_' + Date.now(),
        timestamp: new Date().toISOString(),
        toolType: 'recognition',
        title: 'Grilled Salmon Power Bowl',
        summary: 'Wild salmon with roasted asparagus, edamame and quinoa. ~480 kcal, 34g protein.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        details: {
          foodName: 'Grilled Salmon Power Bowl',
          cuisine: 'Healthy Mediterranean',
          estimatedCalories: { min: 450, max: 520, unit: 'kcal' },
          macronutrients: { proteinGrams: '34g', carbsGrams: '42g', fatGrams: '18g', fiberGrams: '7g' },
          preparationMethod: 'Pan-seared / grilled',
          confidenceNotes: 'Portions estimated visually from plating volume.',
        },
      };

      const demoRecipe: Recipe = {
        id: 'rec_crispy_tofu_stirfry',
        title: 'Sesame Ginger Crispy Tofu Stir-Fry',
        description: 'Golden pressed tofu cubes tossed with crisp bell peppers, snap peas, and fragrant ginger sesame sauce.',
        cuisine: 'Pan-Asian',
        prepTimeMinutes: 15,
        cookTimeMinutes: 15,
        totalTimeMinutes: 30,
        skillLevel: 'Easy',
        servings: 2,
        ingredients: [
          { item: 'Firm Tofu', amount: '400g block, pressed and cubed' },
          { item: 'Snap Peas', amount: '1 cup' },
          { item: 'Red Bell Pepper', amount: '1 sliced' },
          { item: 'Soy Sauce & Toasted Sesame Oil', amount: '2 tbsp each' },
        ],
        instructions: [
          { stepNumber: 1, instruction: 'Press tofu with a clean towel and cut into bite-sized 2cm cubes.' },
          { stepNumber: 2, instruction: 'Pan-sear in hot oil for 7-8 minutes until crisp and golden on all sides.' },
          { stepNumber: 3, instruction: 'Toss vegetables and sauce for 3 minutes until tender-crisp.' },
        ],
        nutritionalEstimatePerServing: {
          calories: 340,
          protein: '22g',
          carbohydrates: '16g',
          fat: '21g',
          fiber: '5g',
        },
        substitutions: [{ original: 'Firm Tofu', substitute: 'Chicken breast or Tempeh' }],
        foodSafetyTips: ['Keep fresh tofu refrigerated in water and change water daily if unused.'],
        chefTips: 'Dust tofu cubes in 1 tsp cornstarch before pan searing for ultra-crisp edges.',
      };

      await Promise.all([
        api.saveHistory(demoItem),
        api.saveRecipe(demoRecipe),
      ]);

      setHistory((prev) => [demoItem, ...prev]);
      setSavedRecipes((prev) => [demoRecipe, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const userName = profile?.name || 'Chef';
  const calorieTarget = profile?.dailyCalorieTarget || 2100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#65A30D]">
            <span>Active Profile Session</span>
            <span aria-hidden="true">·</span>
            <span>{profile?.dietaryPreference || 'Standard Balanced'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Your centralized food intelligence hub. Analyze meals, evaluate freshness indicators,
            explore fridge recipes, and track your dietary goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('recognition')}
            className="px-4 py-2.5 bg-[#0E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Food</span>
          </button>

          <button
            onClick={onOpenChat}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#65A30D]" />
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* 5 Quick Tool Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-serif font-bold text-stone-900">
            AI Food Tools
          </h2>
          <span className="text-xs text-stone-500">5 multimodal modules ready</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <button
            onClick={() => onNavigate('recognition')}
            className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0E3B2E]/10 text-[#0E3B2E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">Recognition</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">Portions & macros from photos</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('freshness')}
            className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#65A30D]/10 text-[#65A30D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">Freshness</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">Visual spoilage indicators</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('hygiene')}
            className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">Hygiene</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">Kitchen & video inspection</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('cooking')}
            className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">Smart Cooking</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">Recipes from pantry items</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('nutrition')}
            className="bg-white border border-stone-200 rounded-xl p-4 text-left hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-lg bg-lime-500/10 text-[#65A30D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">Nutrition</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">Daily meal plan & grocery list</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Nutrition Overview & Saved Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Nutrition Progress & Profile Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Nutrition Target Overview
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Energy balance baseline</p>
              </div>
              <button
                onClick={() => onNavigate('nutrition')}
                className="text-xs font-semibold text-[#0E3B2E] hover:underline cursor-pointer"
              >
                Plan Meal
              </button>
            </div>

            {/* Calorie Dial / Stat */}
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
                  Daily Calorie Target
                </span>
                <span className="text-2xl font-serif font-bold text-[#0E3B2E]">
                  {calorieTarget} <span className="text-xs font-sans font-normal text-stone-500">kcal</span>
                </span>
              </div>
              <div className="text-right text-xs text-stone-500">
                <span>Goal: {profile?.dietaryPreference || 'Balanced eating'}</span>
              </div>
            </div>

            {/* Target Macro Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-700">Target Macronutrient Ratio</div>

              {/* Protein */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">Protein (25-30%)</span>
                  <span className="font-medium text-stone-900">~140g</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0E3B2E] rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">Carbohydrates (45-50%)</span>
                  <span className="font-medium text-stone-900">~220g</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#65A30D] rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Healthy Fats */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">Healthy Fats (25-30%)</span>
                  <span className="font-medium text-stone-900">~65g</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '27%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Estimates based on Mifflin-St Jeor TDEE energy equation.</span>
            </div>
          </div>

          {/* Saved Recipes Widget */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">Saved Recipes</h3>
                <p className="text-xs text-stone-500 mt-0.5">{savedRecipes.length} recipes in collection</p>
              </div>
              <button
                onClick={() => onNavigate('cooking')}
                className="text-xs font-semibold text-[#0E3B2E] hover:underline cursor-pointer"
              >
                Cook New
              </button>
            </div>

            {savedRecipes.length === 0 ? (
              <div className="text-center py-6 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-600 font-medium">No saved recipes yet</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Generate recipes from available ingredients in Smart Cooking and save them here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedRecipes.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onNavigate('cooking')}
                    className="p-3 rounded-xl border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-stone-900">{r.title}</h4>
                      <p className="text-[11px] text-stone-500">
                        {r.cuisine} · {r.totalTimeMinutes}m total · {r.servings} servings
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Analysis Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Recent Analysis Logs
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Multimodal inferences and reports</p>
            </div>
            <div className="flex items-center gap-3">
              {history.length === 0 && (
                <button
                  onClick={handleSeedDemoData}
                  className="text-xs text-[#65A30D] hover:underline font-medium cursor-pointer"
                >
                  Load Sample Data
                </button>
              )}
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-[#0E3B2E] hover:underline cursor-pointer"
              >
                View All History
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-stone-500 bg-white border border-stone-200 rounded-2xl">
              Loading recent logs...
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-stone-800">No Analysis History Yet</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Start by scanning a meal, testing vegetable freshness, or analyzing kitchen hygiene.
                Your records will automatically be logged here.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onNavigate('recognition')}
                  className="px-4 py-2 bg-[#0E3B2E] text-white text-xs font-semibold rounded-lg hover:bg-[#14532D] cursor-pointer"
                >
                  Analyze Food
                </button>
                <button
                  onClick={handleSeedDemoData}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-200 cursor-pointer"
                >
                  Load Demo Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onViewHistoryItem ? onViewHistoryItem(item) : onNavigate('history')}
                  className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer group"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#65A30D]">
                        {item.toolType}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(item.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-stone-900 truncate mt-0.5 group-hover:text-[#0E3B2E] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-normal">
                      {item.summary}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteHistory(item.id, e)}
                    title="Delete record"
                    className="text-stone-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
