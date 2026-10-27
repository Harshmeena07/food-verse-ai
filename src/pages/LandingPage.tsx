import React from 'react';
import { PageView } from '../types';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  ChefHat,
  Apple,
  ArrowRight,
  CheckCircle2,
  Eye,
  Cpu,
  Layers,
  Activity,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: PageView) => void;
  onOpenChat: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenChat }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0E3B2E] tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#65A30D] animate-pulse"></span>
                <span>Multimodal Culinary & Nutritional Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#0E3B2E] tracking-tight leading-[1.12]">
                Your Food. <br />
                Your Health. <br />
                <span className="text-[#65A30D]">Your Intelligence.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                Discover smarter ways to understand food, assess visible freshness indicators,
                explore culinary possibilities, monitor prep environments, and personalize your
                nutrition with multimodal AI.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 bg-[#0E3B2E] text-white font-semibold text-sm rounded-xl hover:bg-[#14532D] shadow-md transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Explore AI Tools</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 bg-white border border-stone-300 text-stone-800 font-semibold text-sm rounded-xl hover:bg-stone-50 shadow-xs transition-all cursor-pointer"
                >
                  Open Dashboard
                </button>

                <button
                  onClick={onOpenChat}
                  className="px-4 py-3.5 text-stone-600 hover:text-[#0E3B2E] font-medium text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ask Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trust Indicators without fake badges */}
              <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                  <span>Image & video frame analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                  <span>Ground truth food safety disclaimers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                  <span>Personalized macronutrient guidance</span>
                </div>
              </div>
            </div>

            {/* Right Food Tech Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80"
                    alt="Multimodal Food Analysis Preview"
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-medium text-stone-700">Multimodal Vision Inference</span>
                      <span>Latency ~1.1s</span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                      Wild Salmon & Roasted Greens Power Bowl
                    </h3>

                    {/* Breakdown bars */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
                      <div className="p-2 rounded-lg bg-stone-50">
                        <span className="block text-[11px] text-stone-500 font-medium">Calories</span>
                        <span className="font-semibold text-stone-800 text-sm">~480 kcal</span>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50">
                        <span className="block text-[11px] text-stone-500 font-medium">Protein</span>
                        <span className="font-semibold text-[#0E3B2E] text-sm">34g</span>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50">
                        <span className="block text-[11px] text-stone-500 font-medium">Freshness</span>
                        <span className="font-semibold text-[#65A30D] text-sm">Peak Quality</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating secondary badge */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-stone-900 text-white p-3.5 rounded-xl shadow-lg border border-stone-800 max-w-xs hidden sm:block">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#65A30D]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Observable Evidence Standard</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 leading-normal">
                    Visual estimates with explicit uncertainty notes. No hidden guesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal AI Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100/70 border border-stone-200/80 rounded-2xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-xs font-bold text-[#0E3B2E] uppercase tracking-wider mb-2">
              The Multimodal AI Shift
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
              Why vision, spatial reasoning, and culinary knowledge belong together
            </h3>
            <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
              Traditional calorie trackers demand tedious manual logging of every gram. Food Verse AI
              merges computer vision with Gemini reasoning to examine photos and video frames,
              inferring preparation methods, visible freshness states, potential allergens, and
              kitchen handling practices with balanced transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-stone-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-[#0E3B2E] flex items-center justify-center mb-3 shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Visual Pattern Analysis</h4>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Evaluates surface texture, oxidation, wilting, plating, and cross-contamination indicators directly from visual inputs.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-[#0E3B2E] flex items-center justify-center mb-3 shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Multimodal Large Language Models</h4>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Grounded in culinary food science, recipes are generated dynamically based on available pantry ingredients and custom skill levels.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-[#0E3B2E] flex items-center justify-center mb-3 shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Energy Balance & Nutrition</h4>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Generates customized daily meal plans with consolidated grocery lists, respecting dietary restrictions and health preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-[#65A30D] uppercase tracking-wider mb-2">
            Core Capabilities
          </h2>
          <h3 className="text-3xl font-serif font-bold text-stone-900">
            Engineered for culinary and nutritional clarity
          </h3>
          <p className="text-sm text-stone-600 mt-2">
            Five purpose-built tools designed to evaluate, guide, and optimize your food experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Food Recognition */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0E3B2E]/10 text-[#0E3B2E] flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">AI Food Recognition</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Snap or upload any meal. The vision AI identifies individual ingredients, likely cooking
                methods, estimated calorie ranges, and macronutrient breakdowns with transparent confidence notes.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-100">
              <button
                onClick={() => onNavigate('recognition')}
                className="text-xs font-semibold text-[#0E3B2E] hover:text-[#14532D] flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Launch Food Recognition</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Freshness Insights */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#65A30D]/10 text-[#65A30D] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">Freshness Insights</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Assess visible discoloration, wilting, bruising, or mold-like appearance. Receive
                cautious shelf-life recommendations, storage techniques, and sensory smell/touch checklists.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-100">
              <button
                onClick={() => onNavigate('freshness')}
                className="text-xs font-semibold text-[#0E3B2E] hover:text-[#14532D] flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Check Produce Freshness</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Restaurant Hygiene Monitor */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">Hygiene Monitor</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Examine prep spaces, food trucks, and kitchens from images or extracted video frames.
                Highlights observable surface hygiene, food covering, glove use, and cross-contamination risks.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-100">
              <button
                onClick={() => onNavigate('hygiene')}
                className="text-xs font-semibold text-[#0E3B2E] hover:text-[#14532D] flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Analyze Prep Hygiene</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Smart Cooking Assistant */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center mb-4">
                <ChefHat className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">Smart Cooking Assistant</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Turn whatever ingredients you have in the fridge into complete recipes. Customize
                servings, adjust cooking instructions, explore smart substitutions, and chat with the AI chef.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-100">
              <button
                onClick={() => onNavigate('cooking')}
                className="text-xs font-semibold text-[#0E3B2E] hover:text-[#14532D] flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Create Recipes from Ingredients</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 5: Personalized Nutrition Planner */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-colors md:col-span-2 lg:col-span-1">
            <div>
              <div className="w-12 h-12 rounded-xl bg-lime-500/10 text-[#65A30D] flex items-center justify-center mb-4">
                <Apple className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">Personalized Nutrition</h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Calculate scientific BMR and TDEE based on your stats. Receive tailor-made 1-day meal plans
                (Breakfast, Lunch, Dinner, Snack) with consolidated categorized shopping grocery lists.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-100">
              <button
                onClick={() => onNavigate('nutrition')}
                className="text-xs font-semibold text-[#0E3B2E] hover:text-[#14532D] flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Generate Nutrition Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive Chat Prompt Card */}
          <div className="bg-[#0E3B2E] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 text-[#65A30D] flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-white">Interactive Culinary Chat</h4>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Have a specific question about temperature safety, sourdough starter, or wine pairing?
                Our multimodal chat assistant is ready at any time.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-white/10">
              <button
                onClick={onOpenChat}
                className="text-xs font-semibold text-[#65A30D] hover:text-white flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Open AI Chat Drawer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-stone-200 rounded-3xl bg-white p-8 sm:p-14">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-[#0E3B2E] uppercase tracking-wider mb-2">
              Step-by-Step Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              How Food Verse AI works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="text-3xl font-serif font-bold text-[#0E3B2E]">01.</div>
              <h4 className="text-base font-semibold text-stone-900">Provide Input</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Upload a photo, drag-and-drop a kitchen video clip, or enter your available ingredients and dietary preferences into our responsive forms.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="text-3xl font-serif font-bold text-[#0E3B2E]">02.</div>
              <h4 className="text-base font-semibold text-stone-900">Multimodal Processing</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Gemini processes the visual attributes, cross-referencing culinary techniques, visible freshness markers, and nutritional science principles on our secure server.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="text-3xl font-serif font-bold text-[#0E3B2E]">03.</div>
              <h4 className="text-base font-semibold text-stone-900">Actionable Review</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Inspect structured breakdowns with explicit confidence notes, safety disclaimers, adjust recipe servings, and save your results to local history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Disclaimer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Responsible AI Transparency & Food Safety
            </h4>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Visual analysis cannot detect odorless toxins, microbiological contaminants (such as Salmonella or E. coli), or exact sodium levels.
              Portion and calorie calculations are informative estimates. For medical dietetics or health certifications, always consult accredited health professionals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
