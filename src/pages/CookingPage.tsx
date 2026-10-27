import React, { useState, useEffect } from 'react';
import { Recipe, RecipeIngredient } from '../types';
import { api } from '../services/api';
import {
  ChefHat,
  Sparkles,
  Plus,
  X,
  Clock,
  Users,
  Flame,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Search,
  MessageSquare,
  Send,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const CookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [ingredients, setIngredients] = useState<string[]>([
    'Eggs',
    'Cherry tomatoes',
    'Baby spinach',
    'Garlic',
  ]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [cuisine, setCuisine] = useState('Any Cuisine');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState('30 minutes');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [servings, setServings] = useState(2);

  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Followup Q&A
  const [followupQuery, setFollowupQuery] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupResponse, setFollowupResponse] = useState<any | null>(null);

  // Saved recipes search
  const [searchQuery, setSearchQuery] = useState('');

  const COMMON_PANTRY = [
    'Chicken breast',
    'Olive oil',
    'Rice',
    'Onion',
    'Pasta',
    'Bell pepper',
    'Black beans',
    'Tofu',
    'Greek yogurt',
    'Cheddar cheese',
  ];

  const CUISINES = [
    'Any Cuisine',
    'Mediterranean',
    'Italian',
    'East Asian',
    'Mexican & Latin',
    'Indian & South Asian',
    'Healthy Casual',
  ];

  const DIETARY_OPTIONS = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'High-Protein',
    'Keto / Low-Carb',
  ];

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const data = await api.getSavedRecipes();
      setSavedRecipes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddIngredient = (itemToAdd?: string) => {
    const val = (itemToAdd || ingredientInput).trim();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedRecipe(null);
    setFollowupResponse(null);

    try {
      const data = await api.generateRecipes({
        ingredients,
        cuisine: cuisine === 'Any Cuisine' ? undefined : cuisine,
        dietary: selectedDietary,
        cookingTime,
        skillLevel,
        servings,
        pantryStaplesAllowed: true,
      });

      setRecipes(data.recipes);
      if (data.recipes.length > 0) {
        setSelectedRecipe(data.recipes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipes with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (recipe: Recipe) => {
    const isAlreadySaved = savedRecipes.some((r) => r.id === recipe.id);
    if (isAlreadySaved) {
      await api.deleteRecipe(recipe.id);
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } else {
      const toSave = { ...recipe, savedAt: new Date().toISOString() };
      await api.saveRecipe(toSave);
      setSavedRecipes((prev) => [toSave, ...prev]);
    }
  };

  const handleServingsChange = (delta: number) => {
    if (!selectedRecipe) return;
    const newServings = Math.max(1, selectedRecipe.servings + delta);
    const ratio = newServings / selectedRecipe.servings;

    // Recalculate local quantities proportionally
    const updatedIngredients = selectedRecipe.ingredients.map((ing) => {
      // Look for numbers in amount
      const numMatch = ing.amount.match(/(\d+(\.\d+)?)/);
      if (numMatch) {
        const originalNum = parseFloat(numMatch[1]);
        const newNum = Math.round(originalNum * ratio * 10) / 10;
        return {
          ...ing,
          amount: ing.amount.replace(numMatch[1], newNum.toString()),
        };
      }
      return ing;
    });

    setSelectedRecipe({
      ...selectedRecipe,
      servings: newServings,
      ingredients: updatedIngredients,
    });
  };

  const handleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe || !followupQuery.trim()) return;

    setFollowupLoading(true);
    try {
      const res = await api.recipeFollowup({
        recipe: selectedRecipe,
        query: followupQuery,
        newServings: selectedRecipe.servings,
      });
      setFollowupResponse(res);
      setFollowupQuery('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setFollowupLoading(false);
    }
  };

  const isCurrentSaved = selectedRecipe
    ? savedRecipes.some((r) => r.id === selectedRecipe.id)
    : false;

  const filteredSavedRecipes = savedRecipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span>Culinary AI Assistant</span>
            <span aria-hidden="true">·</span>
            <span>Zero Food Waste Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
            Smart Cooking & Chef Reasoning
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Turn leftover fridge ingredients into delicious, chef-grade recipes with step-by-step
            instructions, substitutions, and interactive serving adjustments.
          </p>
        </div>

        {/* Tab switcher: Create vs Saved */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Recipes
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saved ({savedRecipes.length})
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved Recipes Explorer */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved recipes by name or cuisine..."
                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              />
            </div>
            <span className="text-xs text-stone-500 self-start sm:self-auto">
              {filteredSavedRecipes.length} recipes in your cookbook
            </span>
          </div>

          {filteredSavedRecipes.length === 0 ? (
            <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-12 text-center space-y-3">
              <ChefHat className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-base text-stone-800">
                No Saved Recipes Found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Generate creative dishes from your available pantry ingredients and bookmark them to build your personal culinary library.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-[#0E3B2E] text-white text-xs font-semibold rounded-xl hover:bg-[#14532D] cursor-pointer"
              >
                Generate a Recipe Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSavedRecipes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                          {r.cuisine}
                        </span>
                        <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                          {r.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleToggleSave(r)}
                        title="Remove bookmark"
                        className="text-[#65A30D] hover:text-red-500 p-1 cursor-pointer"
                      >
                        <BookmarkCheck className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {r.totalTimeMinutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {r.servings} serv
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        {r.nutritionalEstimatePerServing?.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedRecipe(r);
                        setActiveTab('create');
                      }}
                      className="text-xs font-semibold text-[#0E3B2E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View & Cook</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Create Recipes Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Ingredient & Filter Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                1. What Ingredients Do You Have?
              </h3>

              {/* Tag Input */}
              <div className="space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddIngredient();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    placeholder="Type an ingredient (e.g. broccoli, chicken, rice)..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#0E3B2E] text-white rounded-lg text-xs font-semibold hover:bg-[#14532D] transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                {/* Selected Ingredients List */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ingredients.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-stone-100 text-stone-800 border border-stone-200"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveIngredient(item)}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Add Common Pantry items */}
              <div>
                <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
                  Quick add common staples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_PANTRY.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleAddIngredient(item)}
                      disabled={ingredients.includes(item)}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 disabled:opacity-40 disabled:cursor-default transition-colors cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Selector */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <label className="text-xs font-medium text-stone-700 block">Preferred Cuisine</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                >
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Preferences Checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 block">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {DIETARY_OPTIONS.map((diet) => {
                    const isChecked = selectedDietary.includes(diet);
                    return (
                      <button
                        type="button"
                        key={diet}
                        onClick={() => toggleDietary(diet)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-[#0E3B2E]/10 border-[#0E3B2E] text-[#0E3B2E] font-medium'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {isChecked ? '✓ ' : ''}
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time & Servings Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700 block">Max Time</label>
                  <select
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                  >
                    <option value="15-20 minutes">15-20 mins (Quick)</option>
                    <option value="30 minutes">30 mins (Standard)</option>
                    <option value="45 minutes">45 mins</option>
                    <option value="60+ minutes">60+ mins (Simmered)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700 block">Skill Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced Chef">Advanced Chef</option>
                  </select>
                </div>
              </div>

              {/* Servings Counter */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-stone-700">Initial Servings:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-stone-900 w-6 text-center">
                    {servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => setServings(servings + 1)}
                    className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateRecipes}
                disabled={loading || ingredients.length === 0}
                className="w-full py-3 bg-[#0E3B2E] hover:bg-[#14532D] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting Recipes with Gemini...</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4 text-[#65A30D]" />
                    <span>Generate Recipes ({ingredients.length} Ingredients)</span>
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

          {/* Right: Recipe Details & Followup */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-800 flex items-center justify-center mx-auto animate-pulse">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Formulating Culinary Compositions
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Synthesizing ingredient chemistry, cooking temperatures, flavor balance, and nutritional estimates...
                </p>
              </div>
            ) : selectedRecipe ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                {/* Recipe Selection Tabs if multiple recipes generated */}
                {recipes.length > 1 && (
                  <div className="flex gap-2 border-b border-stone-100 pb-3 overflow-x-auto scrollbar-none">
                    {recipes.map((r, idx) => (
                      <button
                        key={r.id || idx}
                        onClick={() => {
                          setSelectedRecipe(r);
                          setFollowupResponse(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          selectedRecipe.id === r.id
                            ? 'bg-[#0E3B2E] text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Option {idx + 1}: {r.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Recipe Header */}
                <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                      {selectedRecipe.cuisine} · {selectedRecipe.skillLevel}
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">
                      {selectedRecipe.title}
                    </h2>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                      {selectedRecipe.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleSave(selectedRecipe)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer ${
                      isCurrentSaved
                        ? 'bg-[#0E3B2E] text-white border-[#0E3B2E]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isCurrentSaved ? 'fill-current' : ''}`} />
                    <span>{isCurrentSaved ? 'Saved in Cookbook' : 'Save Recipe'}</span>
                  </button>
                </div>

                {/* Metric Quick Stats & Servings Recalibrator */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase text-stone-500 font-medium block">
                      Total Time
                    </span>
                    <span className="text-sm font-semibold text-stone-900 mt-0.5 block">
                      {selectedRecipe.totalTimeMinutes} mins
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      {selectedRecipe.prepTimeMinutes}m prep / {selectedRecipe.cookTimeMinutes}m cook
                    </span>
                  </div>

                  {/* Servings Adjuster */}
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase text-stone-500 font-medium block">
                      Servings Adjuster
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleServingsChange(-1)}
                        className="w-5 h-5 rounded bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                        title="Reduce servings"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-stone-900">
                        {selectedRecipe.servings}
                      </span>
                      <button
                        onClick={() => handleServingsChange(1)}
                        className="w-5 h-5 rounded bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Scales amounts</span>
                  </div>

                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase text-stone-500 font-medium block">
                      Calories / Serv
                    </span>
                    <span className="text-sm font-semibold text-[#0E3B2E] mt-0.5 block">
                      ~{selectedRecipe.nutritionalEstimatePerServing?.calories} kcal
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      P: {selectedRecipe.nutritionalEstimatePerServing?.protein}
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase text-stone-500 font-medium block">
                      Macros (C / F)
                    </span>
                    <span className="text-sm font-semibold text-stone-900 mt-0.5 block">
                      {selectedRecipe.nutritionalEstimatePerServing?.carbohydrates} / {selectedRecipe.nutritionalEstimatePerServing?.fat}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Fiber: {selectedRecipe.nutritionalEstimatePerServing?.fiber}
                    </span>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Ingredients (Scaled to {selectedRecipe.servings} Servings)
                    </h4>
                    <span className="text-[11px] text-stone-400">Pantry staples indicated</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between"
                      >
                        <span className="font-medium text-stone-900">{ing.item}</span>
                        <span className="text-stone-600 font-semibold text-[11px]">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Cooking Instructions */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Step-by-Step Instructions
                  </h4>
                  <div className="space-y-3">
                    {selectedRecipe.instructions.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-100 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0E3B2E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {step.stepNumber}
                          </span>
                          <span className="font-semibold text-stone-900">Step {step.stepNumber}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed pl-7">{step.instruction}</p>
                        {step.tip && (
                          <div className="ml-7 p-2 rounded-md bg-amber-500/10 text-amber-900 text-[11px]">
                            💡 <span className="font-medium">Chef Tip:</span> {step.tip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Substitutions & Food Safety Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {selectedRecipe.substitutions?.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5 text-xs">
                      <span className="font-semibold text-stone-800 block">
                        Smart Substitutions
                      </span>
                      <ul className="space-y-1 text-stone-600">
                        {selectedRecipe.substitutions.map((sub, i) => (
                          <li key={i}>
                            <strong>{sub.original}:</strong> {sub.substitute}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRecipe.foodSafetyTips?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                        <span>Food Safety Standards</span>
                      </span>
                      <ul className="space-y-1 text-amber-800/90">
                        {selectedRecipe.foodSafetyTips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Chef Secret Tip */}
                {selectedRecipe.chefTips && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950">
                    <span className="font-semibold text-[#0E3B2E] block mb-1">
                      Chef Technique Note
                    </span>
                    <p className="leading-relaxed">{selectedRecipe.chefTips}</p>
                  </div>
                )}

                {/* Interactive Follow-up Question Box */}
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#65A30D]" />
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Ask Follow-up Questions About This Dish
                    </h4>
                  </div>

                  <form onSubmit={handleFollowup} className="flex gap-2">
                    <input
                      type="text"
                      value={followupQuery}
                      onChange={(e) => setFollowupQuery(e.target.value)}
                      placeholder="e.g. Can I air-fry this? Make it spicier? Simplify step 2..."
                      disabled={followupLoading}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                    />
                    <button
                      type="submit"
                      disabled={followupLoading || !followupQuery.trim()}
                      className="px-4 py-2 bg-[#0E3B2E] text-white rounded-lg text-xs font-semibold hover:bg-[#14532D] disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {followupLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Ask Chef</span>
                    </button>
                  </form>

                  {followupResponse && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                      <div className="font-semibold text-[#0E3B2E]">Chef Recommendation:</div>
                      <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                        {followupResponse.answer}
                      </p>
                      {followupResponse.practicalTip && (
                        <div className="text-[11px] text-stone-500 italic">
                          Tip: {followupResponse.practicalTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-800">
                  Ready to Cook
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Enter your available fridge and pantry ingredients on the left and select your preferred cuisine to generate custom recipes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
