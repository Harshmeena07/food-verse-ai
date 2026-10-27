import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for image parts
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
  if (matches) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// Local mock/persistence store for user profile & history
const DATA_DIR = path.resolve(__dirname, '.data');
const HISTORY_FILE = path.resolve(DATA_DIR, 'history.json');
const PROFILE_FILE = path.resolve(DATA_DIR, 'profile.json');
const RECIPES_FILE = path.resolve(DATA_DIR, 'saved_recipes.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {
  // directory might exist or read-only fallback
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.length > 5),
    timestamp: new Date().toISOString(),
  });
});

// 1. Food Recognition Endpoint
app.post('/api/food-recognition', async (req, res) => {
  try {
    const { image, notes } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const img = parseDataUrl(image);
    const prompt = `You are a culinary vision AI. Analyze this food image thoroughly.
User context/notes: "${notes || 'None provided'}".

Return a strictly valid JSON object matching this exact schema:
{
  "foodName": "Primary name of the dish or food items",
  "cuisine": "Cuisine type (e.g. Mediterranean, Italian, Japanese, Casual, etc.)",
  "identifiedItems": [
    { "name": "Item name", "category": "Produce | Protein | Grain | Sauce | Dairy | Other", "visibility": "High | Medium | Low" }
  ],
  "possibleIngredients": ["Ingredient 1", "Ingredient 2"],
  "estimatedPortion": "Portion estimate (e.g., ~350g, 1 bowl, 2 slices)",
  "portionConfidence": "High | Medium | Low",
  "estimatedCalories": {
    "min": 400,
    "max": 520,
    "unit": "kcal"
  },
  "macronutrients": {
    "proteinGrams": "24-30g",
    "carbsGrams": "45-55g",
    "fatGrams": "14-18g",
    "fiberGrams": "5-8g"
  },
  "preparationMethod": "Visual indications of preparation (e.g., grilled, roasted, pan-fried, raw)",
  "dietaryObservations": ["Vegetarian-friendly", "High-protein", "Contains Dairy"],
  "potentialAllergens": ["Gluten", "Dairy", "Soy"],
  "confidenceNotes": "Clear transparent explanation of why visual portions/calories are approximate estimates and factors that cannot be seen (e.g., hidden cooking fats, sodium, exact cuts).",
  "culinaryInsight": "A brief chef note or culinary tip regarding this dish."
}

Do not wrap in markdown quotes if possible, output pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: img.mimeType, data: img.data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Food recognition error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze food image with Gemini.',
    });
  }
});

// 2. Freshness Detection Endpoint
app.post('/api/freshness-analysis', async (req, res) => {
  try {
    const { image, category, storageConditions, purchaseDate } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const img = parseDataUrl(image);
    const prompt = `You are a food quality and visible freshness analysis AI.
Inspect this food image for visible signs of freshness, aging, and spoilage indicators.
Category: "${category || 'General food'}".
Reported Storage: "${storageConditions || 'Standard/Unknown'}".
Reported Date/Age: "${purchaseDate || 'Not specified'}".

Return a strictly valid JSON object matching this schema:
{
  "itemDetected": "Name of the food item in the image",
  "category": "${category || 'Produce'}",
  "apparentFreshnessGrade": "Fresh | Peak Quality | Slightly Aged | Degraded / Past Peak | Questionable / Visible Spoilage",
  "freshnessScore": 75,
  "visualIndicators": [
    {
      "indicator": "Discoloration | Wilting | Bruising | Mold-like Growth | Surface Texture | Moisture Loss",
      "status": "Not Observed | Minor / Early | Moderate | Severe",
      "details": "Specific visual observation from the image"
    }
  ],
  "observedConcerns": [
    "Specific concern noted or 'No major visual degradation observed'"
  ],
  "recommendedAction": "Eat within 1-2 days | Cook immediately | Trim superficial spots | Discard immediately | Safely store",
  "storageOptimizationTips": [
    "Tip 1 for preserving this item",
    "Tip 2"
  ],
  "sensoryChecklist": [
    "Smell: Check for off, sour, or fermented odors",
    "Touch: Inspect for mushiness or unnatural slimy coating"
  ],
  "safetyDisclaimer": "Visual analysis via image cannot detect invisible pathogens (e.g. Salmonella, E. coli, Listeria) or chemical contamination. Always follow standard health and food safety guidelines. If in doubt, discard."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: img.mimeType, data: img.data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Freshness analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to assess food freshness.',
    });
  }
});

// 3. Hygiene Monitor Endpoint (Image or multi-frame video)
app.post('/api/hygiene-analysis', async (req, res) => {
  try {
    const { mediaType, image, frames, notes } = req.body;
    if (!image && (!frames || frames.length === 0)) {
      return res.status(400).json({ error: 'Image or video frames are required.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const parts: any[] = [];
    if (frames && Array.isArray(frames) && frames.length > 0) {
      // Up to 6 video frames
      frames.slice(0, 6).forEach((f: { data: string; timestamp?: string }) => {
        const parsed = parseDataUrl(f.data);
        parts.push({
          inlineData: { mimeType: parsed.mimeType, data: parsed.data },
        });
      });
    } else if (image) {
      const parsed = parseDataUrl(image);
      parts.push({
        inlineData: { mimeType: parsed.mimeType, data: parsed.data },
      });
    }

    const prompt = `You are an expert commercial kitchen safety and food hygiene visual inspector.
Review the provided ${mediaType === 'video' ? 'sampled video frames' : 'image'} of this food preparation or dining environment.
Context notes: "${notes || 'Standard kitchen observation'}".

Strictly evaluate ONLY observable visual evidence. Distinguish clearly between "not observed" and "confirmed absent".
Do not pretend to replace health department official inspections or issue regulatory certificates.

Return a strictly valid JSON object matching this schema:
{
  "environmentType": "Commercial Kitchen | Food Prep Counter | Cookline | Storage Area | Dining / Serving Bar | Other",
  "overallHygieneRating": "Good | Satisfactory | Needs Attention | Significant Risk Observed",
  "riskSeverity": "Low | Moderate | High",
  "summary": "Concise 2-sentence summary of observable visual standards",
  "categories": [
    {
      "name": "Surface Cleanliness & Sanitation",
      "status": "Observed Clean | Minor Soil/Debris | Excessive Clutter/Dirt | Not Visible",
      "details": "Details of prep tables, cutting boards, and cooking surfaces"
    },
    {
      "name": "Cross-Contamination Safeguards",
      "status": "Proper Separation Visible | Potential Cross-Contact Risk | Not Observed",
      "details": "Observations regarding raw meats, produce proximity, or color-coded tools"
    },
    {
      "name": "Food Storage & Covering",
      "status": "Properly Covered/Stored | Open & Exposed | Not Visible",
      "details": "Observations on whether ingredients are shielded from ambient airborne contaminants"
    },
    {
      "name": "Personal Hygiene & Protective Equipment",
      "status": "Gloves/Hairnets Observed | Bare Hand Contact Observed | Mixed Practice | Not Observed in Frames",
      "details": "Apparent use of gloves, aprons, hair restraints by staff if visible"
    },
    {
      "name": "Waste Management & Clutter",
      "status": "Clear & Contained | Overflowing / Near Prep Areas | Not Visible",
      "details": "Visible trash cans, lids, grease traps, or floor clutter"
    }
  ],
  "positivePractices": ["Observed sanitary practice 1", "Observed sanitary practice 2"],
  "areasForImprovement": ["Recommended action 1", "Recommended action 2"],
  "limitationsAndDisclaimer": "This evaluation is based solely on limited visual evidence visible in the footage. It cannot detect bacterial colonies, chemical residues, internal food temperatures, or unobserved periods. It does not replace statutory health department inspections."
}`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Hygiene analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to inspect kitchen hygiene visual evidence.',
    });
  }
});

// 4. Smart Cooking & Recipe Generation
app.post('/api/recipe-generation', async (req, res) => {
  try {
    const {
      ingredients,
      cuisine,
      dietary,
      cookingTime,
      skillLevel,
      servings,
      pantryStaplesAllowed = true,
    } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one ingredient.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const prompt = `You are a culinary master and smart kitchen assistant.
Generate 2 distinct, creative, and delicious recipes based on these user constraints:
- Available Ingredients: ${ingredients.join(', ')}
- Preferred Cuisine: ${cuisine || 'Any/Versatile'}
- Dietary Restrictions: ${(dietary && dietary.length) ? dietary.join(', ') : 'None'}
- Max Cooking Time: ${cookingTime || '30-45 minutes'}
- Skill Level: ${skillLevel || 'Intermediate'}
- Number of Servings: ${servings || 2}
- Common Pantry Staples (salt, pepper, oil, water, basic spices) assumed: ${pantryStaplesAllowed ? 'Yes' : 'Minimal'}

Return a strictly valid JSON object with this schema:
{
  "recipes": [
    {
      "id": "unique-slug-or-id",
      "title": "Creative Recipe Name",
      "description": "Appealing description of flavors and texture",
      "cuisine": "Cuisine category",
      "prepTimeMinutes": 15,
      "cookTimeMinutes": 25,
      "totalTimeMinutes": 40,
      "skillLevel": "Easy | Intermediate | Advanced",
      "servings": ${servings || 2},
      "ingredients": [
        { "item": "Ingredient name", "amount": "Exact quantity", "isPantryStaple": false, "notes": "diced, minced, or room temp" }
      ],
      "instructions": [
        { "stepNumber": 1, "instruction": "Step instruction with temperature and sensory cues", "tip": "Optional chef tip for this step" }
      ],
      "nutritionalEstimatePerServing": {
        "calories": 420,
        "protein": "26g",
        "carbohydrates": "38g",
        "fat": "18g",
        "fiber": "6g"
      },
      "substitutions": [
        { "original": "Ingredient", "substitute": "Alternative options" }
      ],
      "foodSafetyTips": [
        "Internal cook temp requirement (e.g., poultry 165°F / 74°C) or safe cross-contamination handling"
      ],
      "chefTips": "Secrets for maximum flavor development"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{"recipes":[]}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Recipe generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate recipes.',
    });
  }
});

// 4b. Recipe Follow-up & Serving adjustment
app.post('/api/recipe-followup', async (req, res) => {
  try {
    const { recipe, query, newServings, detailLevel } = req.body;
    if (!recipe) {
      return res.status(400).json({ error: 'Recipe context is required.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const prompt = `You are a culinary instructor.
The user is cooking this recipe: "${recipe.title}".
Original Servings: ${recipe.servings}.
Ingredients: ${JSON.stringify(recipe.ingredients)}.
Instructions: ${JSON.stringify(recipe.instructions)}.

User Request: "${query}".
Requested New Servings (if any): ${newServings || 'No change'}.
Instruction detail preference: "${detailLevel || 'standard'}".

Return a strictly valid JSON object:
{
  "answer": "Direct, encouraging, and precise culinary response to the user's question or modification",
  "adjustedIngredients": [
    { "item": "Ingredient name", "amount": "Recalculated amount if requested, else original" }
  ],
  "clarifiedSteps": [
    "Simpler or expanded breakdown of steps if requested"
  ],
  "practicalTip": "Helpful immediate tip for home cooking"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Recipe follow-up error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process recipe question.',
    });
  }
});

// 5. Personalized Nutrition Planner
app.post('/api/nutrition-planning', async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const prompt = `You are a certified nutrition scientist and registered dietitian AI.
Create a personalized 1-day meal plan based on scientific energy balance calculations.

User Profile:
- Age: ${age || 30}
- Biological Sex/Gender: ${gender || 'Unspecified'}
- Height: ${heightCm || 175} cm
- Weight: ${weightKg || 70} kg
- Activity Level: ${activityLevel || 'Moderately active'}
- Dietary Preference: ${dietaryPreference || 'Standard balanced'}
- Known Allergies/Intolerances: ${(allergies && allergies.length) ? allergies.join(', ') : 'None'}
- Primary Goal: ${nutritionGoal || 'General balanced eating'}
- Typical Schedule: ${mealSchedule || 'Breakfast, Lunch, Dinner, 1 Snack'}
- Disliked Foods / Avoid: ${(foodsToAvoid && foodsToAvoid.length) ? foodsToAvoid.join(', ') : 'None'}

Return a strictly valid JSON object with this exact structure:
{
  "energyCalculations": {
    "estimatedBMR": 1650,
    "estimatedTDEE": 2300,
    "targetDailyCalories": 2100,
    "calorieGoalRationale": "Brief explanation of calorie target for this goal",
    "macroTargets": {
      "proteinGrams": 140,
      "proteinPercent": 27,
      "carbsGrams": 220,
      "carbsPercent": 42,
      "fatGrams": 70,
      "fatPercent": 31,
      "fiberGrams": 32
    }
  },
  "meals": [
    {
      "mealType": "Breakfast",
      "title": "Dish name",
      "description": "Appealing meal description",
      "calories": 520,
      "proteinGrams": 35,
      "carbsGrams": 55,
      "fatGrams": 18,
      "ingredients": [
        { "name": "Ingredient", "portion": "e.g., 2 large eggs", "category": "Produce | Dairy | Protein | Pantry | Bakery" }
      ],
      "prepTimeMinutes": 10,
      "quickInstructions": "Simple preparation outline"
    },
    {
      "mealType": "Lunch",
      "title": "Dish name",
      "description": "Appealing meal description",
      "calories": 650,
      "proteinGrams": 45,
      "carbsGrams": 65,
      "fatGrams": 22,
      "ingredients": [
        { "name": "Ingredient", "portion": "Portion size", "category": "Category" }
      ],
      "prepTimeMinutes": 15,
      "quickInstructions": "Simple preparation outline"
    },
    {
      "mealType": "Dinner",
      "title": "Dish name",
      "description": "Appealing meal description",
      "calories": 680,
      "proteinGrams": 48,
      "carbsGrams": 60,
      "fatGrams": 24,
      "ingredients": [
        { "name": "Ingredient", "portion": "Portion size", "category": "Category" }
      ],
      "prepTimeMinutes": 25,
      "quickInstructions": "Simple preparation outline"
    },
    {
      "mealType": "Snack",
      "title": "Snack name",
      "description": "Appealing nutrient-dense snack",
      "calories": 250,
      "proteinGrams": 12,
      "carbsGrams": 40,
      "fatGrams": 6,
      "ingredients": [
        { "name": "Ingredient", "portion": "Portion size", "category": "Category" }
      ],
      "prepTimeMinutes": 5,
      "quickInstructions": "Simple preparation outline"
    }
  ],
  "consolidatedGroceryList": [
    {
      "category": "Produce",
      "items": ["Spinach (1 bag)", "Bananas (3)", "Cherry tomatoes (1 cup)"]
    },
    {
      "category": "Proteins",
      "items": ["Chicken breast (300g)", "Greek yogurt (1 tub)"]
    },
    {
      "category": "Grains & Pantry",
      "items": ["Rolled oats (1 cup)", "Brown rice (1 cup)", "Olive oil"]
    }
  ],
  "hydrationGoalLiters": 2.8,
  "dietitianGuidance": "Important lifestyle and meal timing advice",
  "medicalDisclaimer": "Nutritional calculations are estimates for informational guidance. Food Verse AI does not prescribe medical nutrition therapy. Consult a physician or registered dietitian for specialized dietary treatments."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Nutrition planning error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate personalized nutrition plan.',
    });
  }
});

// 6. Conversational AI Chat Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, image } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required.' });
    }
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment secrets.',
      });
    }

    const systemInstruction = `You are Food Verse AI Assistant — an intelligent, empathetic, science-grounded culinary and nutrition conversationalist.
Capabilities:
- Provide culinary recipes, techniques, and flavor pairings.
- Discuss food storage, visible freshness cues, and safe handling.
- Offer educational macronutrient & meal planning concepts.
- Explain kitchen hygiene visual standards.

Rules:
1. Always state clearly that visual evaluations and calorie numbers are informative estimates, not medical or lab guarantees.
2. If foods show severe mold or bad odors are reported, advise discarding safely.
3. Keep tone sophisticated, warm, clear, and helpful. Format responses with clean headings, bullets, and concise advice.`;

    const contents: any[] = [];

    // Append history
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLatest = i === messages.length - 1;

      if (isLatest && image && msg.role === 'user') {
        const parsedImg = parseDataUrl(image);
        contents.push({
          role: 'user',
          parts: [
            { inlineData: { mimeType: parsedImg.mimeType, data: parsedImg.data } },
            { text: msg.content },
          ],
        });
      } else {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am ready to help you with your food, recipes, and nutrition questions.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to chat with Food Verse AI assistant.',
    });
  }
});

// 7. Analysis History Endpoints
app.get('/api/history', (req, res) => {
  const history = readJsonFile<any[]>(HISTORY_FILE, []);
  res.json(history);
});

app.post('/api/history', (req, res) => {
  const newRecord = {
    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    ...req.body,
  };
  const history = readJsonFile<any[]>(HISTORY_FILE, []);
  history.unshift(newRecord);
  // Keep last 100 entries
  const trimmed = history.slice(0, 100);
  writeJsonFile(HISTORY_FILE, trimmed);
  res.status(201).json(newRecord);
});

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  const history = readJsonFile<any[]>(HISTORY_FILE, []);
  const filtered = history.filter((item) => item.id !== id);
  writeJsonFile(HISTORY_FILE, filtered);
  res.json({ success: true, remaining: filtered.length });
});

app.delete('/api/history', (req, res) => {
  writeJsonFile(HISTORY_FILE, []);
  res.json({ success: true, message: 'All analysis history cleared.' });
});

// 8. Saved Recipes Endpoints
app.get('/api/recipes', (req, res) => {
  const recipes = readJsonFile<any[]>(RECIPES_FILE, []);
  res.json(recipes);
});

app.post('/api/recipes', (req, res) => {
  const recipe = req.body;
  const recipes = readJsonFile<any[]>(RECIPES_FILE, []);
  const existingIndex = recipes.findIndex((r) => r.id === recipe.id);
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.unshift(recipe);
  }
  writeJsonFile(RECIPES_FILE, recipes);
  res.status(201).json(recipe);
});

app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const recipes = readJsonFile<any[]>(RECIPES_FILE, []);
  const filtered = recipes.filter((r) => r.id !== id);
  writeJsonFile(RECIPES_FILE, filtered);
  res.json({ success: true });
});

// 9. Profile & Settings Endpoints
app.get('/api/profile', (req, res) => {
  const defaultProfile = {
    name: 'Food Enthusiast',
    email: '',
    dietaryPreference: 'Standard Balanced',
    allergies: [],
    measurementUnits: 'metric', // 'metric' | 'imperial'
    privacyConsent: true,
    theme: 'system',
    dailyCalorieTarget: 2100,
  };
  const profile = readJsonFile(PROFILE_FILE, defaultProfile);
  res.json(profile);
});

app.post('/api/profile', (req, res) => {
  const profile = req.body;
  writeJsonFile(PROFILE_FILE, profile);
  res.json({ success: true, profile });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Food Verse AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
