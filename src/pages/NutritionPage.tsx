import React, { useState, useEffect } from 'react';
import { NutritionPlan, UserProfile } from '../types';
import { api } from '../services/api';
import {
  Apple,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Activity,
  Droplet,
  BookmarkCheck,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Utensils,
} from 'lucide-react';

export const NutritionPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form states
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState('Female');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [activityLevel, setActivityLevel] = useState('Moderately active (exercise 3-5 days/week)');
  const [dietaryPreference, setDietaryPreference] = useState('Mediterranean Balanced');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [nutritionGoal, setNutritionGoal] = useState('General balanced eating & longevity');
  const [mealSchedule, setMealSchedule] = useState('3 meals + 1 afternoon snack');
  const [foodsToAvoid, setFoodsToAvoid] = useState<string[]>([]);
  const [avoidInput, setAvoidInput] = useState('');
  const [saveProfileConsent, setSaveProfileConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const GOALS = [
    'General balanced eating & longevity',
    'Healthy weight management / fat loss',
    'Muscle-building & athletic support',
    'High-protein metabolic conditioning',
    'Plant-based gut health optimization',
  ];

  const ACTIVITY_LEVELS = [
    'Sedentary (desk job, minimal exercise)',
    'Lightly active (light exercise 1-3 days/week)',
    'Moderately active (exercise 3-5 days/week)',
    'Very active (heavy workouts 6-7 days/week)',
  ];

  const DIETS = [
    'Standard Balanced',
    'Mediterranean Balanced',
    'Vegetarian',
    'Vegan Plant-Based',
    'Pescatarian',
    'Low-Carb / Keto Friendly',
    'High-Protein Athletic',
  ];

  const COMMON_ALLERGENS = [
    'Peanuts',
    'Tree Nuts',
    'Dairy / Lactose',
    'Gluten / Wheat',
    'Shellfish',
    'Soy',
    'Eggs',
  ];

  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const p = await api.getProfile();
        if (p) {
          setProfile(p);
          if (p.age) setAge(p.age);
          if (p.heightCm) setHeightCm(p.heightCm);
          if (p.weightKg) setWeightKg(p.weightKg);
          if (p.dietaryPreference) setDietaryPreference(p.dietaryPreference);
          if (p.allergies?.length) setAllergies(p.allergies);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInitialProfile();
  }, []);

  const handleToggleAllergy = (allergen: string) => {
    if (allergies.includes(allergen)) {
      setAllergies(allergies.filter((a) => a !== allergen));
    } else {
      setAllergies([...allergies, allergen]);
    }
  };

  const handleAddCustomAvoid = () => {
    const val = avoidInput.trim();
    if (val && !foodsToAvoid.includes(val)) {
      setFoodsToAvoid([...foodsToAvoid, val]);
      setAvoidInput('');
    }
  };

  const handleRemoveAvoid = (item: string) => {
    setFoodsToAvoid(foodsToAvoid.filter((i) => i !== item));
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const generated = await api.planNutrition({
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        dietaryPreference,
        allergies,
        nutritionGoal,
        mealSchedule,
        foodsToAvoid,
      });

      setPlan(generated);

      // Save profile if consented
      if (saveProfileConsent) {
        await api.saveProfile({
          name: profile?.name || 'Food Enthusiast',
          age,
          gender,
          heightCm,
          weightKg,
          activityLevel,
          dietaryPreference,
          allergies,
          measurementUnits: profile?.measurementUnits || 'metric',
          privacyConsent: true,
          dailyCalorieTarget: generated.energyCalculations?.targetDailyCalories || 2100,
        });
      }

      // Save to history
      await api.saveHistory({
        toolType: 'nutrition',
        title: `${nutritionGoal} - Meal Plan`,
        summary: `Target: ${generated.energyCalculations?.targetDailyCalories || 2100} kcal · P: ${generated.energyCalculations?.macroTargets?.proteinGrams || 140}g · C: ${generated.energyCalculations?.macroTargets?.carbsGrams || 220}g · F: ${generated.energyCalculations?.macroTargets?.fatGrams || 70}g`,
        details: generated,
      });

      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate personalized nutrition plan.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroceryItem = (item: string) => {
    setCheckedGroceryItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#65A30D] uppercase tracking-wider mb-1">
          <span>Evidence-Based Dietetics</span>
          <span aria-hidden="true">·</span>
          <span>Energy Balance & Meal Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
          Personalized Nutrition & Meal Planner
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Scientific BMR & TDEE calculations combined with generative culinary planning.
          Produces actionable daily meals, exact portion sizes, and a consolidated shopping list.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Profile Stats */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Biometrics & Dietary Goals
            </h3>

            {/* Age, Gender, Height, Weight */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-stone-700 block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={14}
                  max={100}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700 block">Gender / Sex</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700 block">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  min={100}
                  max={250}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-stone-700 block">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  min={35}
                  max={250}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-stone-700 block">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              >
                {ACTIVITY_LEVELS.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Nutrition Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 block">Primary Nutrition Goal</label>
              <select
                value={nutritionGoal}
                onChange={(e) => setNutritionGoal(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 block">Dietary Pattern</label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              >
                {DIETS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Allergies / Intolerances */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-stone-700 block">
                Food Allergies & Intolerances
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.map((all) => {
                  const isChecked = allergies.includes(all);
                  return (
                    <button
                      type="button"
                      key={all}
                      onClick={() => handleToggleAllergy(all)}
                      className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-red-50 border-red-300 text-red-800 font-medium'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {isChecked ? '✕ ' : '+ '}
                      {all}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Foods to Avoid */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-stone-700 block">
                Disliked Foods to Avoid
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  placeholder="e.g. mushrooms, cilantro, olives..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAvoid}
                  className="px-3 py-1.5 bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-300 cursor-pointer"
                >
                  Add
                </button>
              </div>
              {foodsToAvoid.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {foodsToAvoid.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                    >
                      <span>{f}</span>
                      <button
                        onClick={() => handleRemoveAvoid(f)}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* User Consent & Privacy check */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveProfileConsent}
                  onChange={(e) => setSaveProfileConsent(e.target.checked)}
                  className="rounded text-[#0E3B2E] focus:ring-[#0E3B2E]"
                />
                <span>Save biometric profile to browser settings for future plans</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full py-3 bg-[#0E3B2E] hover:bg-[#14532D] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculating Metabolic Ratios & Recipes...</span>
                </>
              ) : (
                <>
                  <Apple className="w-4 h-4 text-[#65A30D]" />
                  <span>Generate Personalized Meal Plan</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Nutrition Plan & Grocery List */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-lime-500/10 text-[#65A30D] flex items-center justify-center mx-auto animate-pulse">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Architecting Metabolic Nutrition Plan
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Calculating Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and designing 4 balanced meals...
              </p>
            </div>
          ) : plan ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header */}
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                    Daily Nutrition Architecture
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    Target: ~{plan.energyCalculations?.targetDailyCalories} kcal / day
                  </h2>
                </div>

                {savedSuccess && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#0E3B2E] font-medium bg-[#0E3B2E]/5 px-3 py-1.5 rounded-lg border border-[#0E3B2E]/10 self-start sm:self-auto">
                    <BookmarkCheck className="w-4 h-4 text-[#65A30D]" />
                    <span>Saved to Profile</span>
                  </div>
                )}
              </div>

              {/* Energy Calculations Breakdown */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">
                      Metabolic Calculations
                    </span>
                    <span className="text-xs text-stone-600 mt-0.5 block">
                      Estimated BMR: <strong className="text-stone-900">{plan.energyCalculations?.estimatedBMR} kcal</strong> · Estimated TDEE: <strong className="text-stone-900">{plan.energyCalculations?.estimatedTDEE} kcal</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-auto">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Hydration: ~{plan.hydrationGoalLiters || 2.5}L water</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed italic border-t border-stone-200/60 pt-2">
                  "{plan.energyCalculations?.calorieGoalRationale}"
                </p>

                {/* Macro Split Progress Bars */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-stone-700">
                      <span>Protein</span>
                      <span className="font-semibold">{plan.energyCalculations?.macroTargets?.proteinGrams}g</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0E3B2E] rounded-full"
                        style={{ width: `${plan.energyCalculations?.macroTargets?.proteinPercent || 30}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {plan.energyCalculations?.macroTargets?.proteinPercent}% total calories
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-stone-700">
                      <span>Carbs</span>
                      <span className="font-semibold">{plan.energyCalculations?.macroTargets?.carbsGrams}g</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#65A30D] rounded-full"
                        style={{ width: `${plan.energyCalculations?.macroTargets?.carbsPercent || 45}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {plan.energyCalculations?.macroTargets?.carbsPercent}% total calories
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-stone-700">
                      <span>Fats</span>
                      <span className="font-semibold">{plan.energyCalculations?.macroTargets?.fatGrams}g</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${plan.energyCalculations?.macroTargets?.fatPercent || 25}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {plan.energyCalculations?.macroTargets?.fatPercent}% total calories
                    </span>
                  </div>
                </div>
              </div>

              {/* The 4 Meals Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Today's Daily Meal Architecture
                </h4>

                <div className="space-y-3">
                  {plan.meals?.map((meal, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0E3B2E] uppercase text-[11px] tracking-wider">
                            {meal.mealType}
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="font-semibold text-stone-900 text-sm">{meal.title}</span>
                        </div>
                        <div className="text-stone-600 font-medium">
                          ~{meal.calories} kcal (P: {meal.proteinGrams}g · C: {meal.carbsGrams}g · F: {meal.fatGrams}g)
                        </div>
                      </div>

                      <p className="text-stone-600 leading-relaxed text-[11px]">{meal.description}</p>

                      <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
                        <span><strong>Prep:</strong> {meal.prepTimeMinutes} mins</span>
                        <span><strong>Portions:</strong> {meal.ingredients?.map((i) => `${i.name} (${i.portion})`).join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidated Grocery List */}
              {plan.consolidatedGroceryList?.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#0E3B2E]" />
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Consolidated Grocery Checklist
                      </h4>
                    </div>
                    <span className="text-[11px] text-stone-400">Click to check off items</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plan.consolidatedGroceryList.map((cat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-2 text-xs"
                      >
                        <span className="font-semibold text-stone-900 block border-b border-stone-200/60 pb-1">
                          {cat.category}
                        </span>
                        <div className="space-y-1.5">
                          {cat.items.map((item, i) => {
                            const isChecked = Boolean(checkedGroceryItems[item]);
                            return (
                              <button
                                key={i}
                                onClick={() => toggleGroceryItem(item)}
                                className={`w-full text-left flex items-start gap-1.5 text-[11px] transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'text-stone-400 line-through'
                                    : 'text-stone-700 hover:text-stone-900'
                                }`}
                              >
                                <span className="text-[#65A30D] mt-0.5">{isChecked ? '✓' : '○'}</span>
                                <span>{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietitian Lifestyle Guidance */}
              {plan.dietitianGuidance && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 space-y-1">
                  <div className="font-semibold text-[#0E3B2E] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#65A30D]" />
                    <span>Dietitian Guidance & Meal Timing</span>
                  </div>
                  <p className="leading-relaxed">{plan.dietitianGuidance}</p>
                </div>
              )}

              {/* Medical Disclaimer */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-stone-500" />
                  <span>Medical & Nutritional Disclaimer</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {plan.medicalDisclaimer ||
                    'Nutritional calculations are estimates calculated for general informational planning. Food Verse AI does not provide medical diagnoses or prescribe medical dietary therapy. For specialized metabolic needs, diabetes management, or kidney disease, always consult a licensed registered dietitian or physician.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-[#65A30D] flex items-center justify-center mx-auto shadow-xs">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-800">
                Ready to Personalize Your Nutrition
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Adjust your biometrics and dietary preferences on the left to calculate your personalized daily calorie baseline, macronutrients, and grocery list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
