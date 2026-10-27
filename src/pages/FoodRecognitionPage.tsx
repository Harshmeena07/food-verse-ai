import React, { useState } from 'react';
import { FoodRecognitionResult } from '../types';
import { api } from '../services/api';
import { FOOD_RECOGNITION_SAMPLES, SampleItem } from '../utils/samples';
import {
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
  BookmarkCheck,
  Scale,
  Flame,
  Info,
} from 'lucide-react';

interface FoodRecognitionPageProps {
  onSaveToHistory?: (record: any) => void;
}

export const FoodRecognitionPage: React.FC<FoodRecognitionPageProps> = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodRecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please provide a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setError(null);
    setResult(null);
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: SampleItem) => {
    try {
      setLoading(true);
      setError(null);
      setImageName(sample.name);
      setNotes(sample.notes || '');

      // Fetch sample image and convert to data URL so the model receives real bytes
      const resp = await fetch(sample.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      // Fallback
      setImage(sample.url);
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please select or upload an image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const data = await api.recognizeFood(image, notes);
      setResult(data);

      // Automatically persist to analysis history
      await api.saveHistory({
        toolType: 'recognition',
        title: data.foodName || 'Food Recognition Scan',
        summary: `${data.estimatedPortion || 'Portion estimated'} · ~${data.estimatedCalories?.min || 350}-${data.estimatedCalories?.max || 500} kcal · ${data.macronutrients?.proteinGrams || 'Protein'}`,
        imageUrl: image.startsWith('data:') ? image : undefined,
        details: data,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete food recognition analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImageName('');
    setResult(null);
    setError(null);
    setSavedSuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#65A30D] uppercase tracking-wider mb-1">
          <span>Multimodal Vision</span>
          <span aria-hidden="true">·</span>
          <span>Portions & Macronutrients</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
          AI Food Recognition & Nutritional Reasoning
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Upload any meal photo. Gemini identifies dishes, decomposes visible ingredients,
          and estimates macronutrient ranges with transparent confidence bounds.
        </p>
      </div>

      {/* Main Grid: Upload & Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Selector & Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Area */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Provide Food Image
            </h3>

            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 group bg-stone-900">
                <img
                  src={image}
                  alt="Selected food"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleClearImage}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md truncate">
                  {imageName || 'Selected photo'}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-[#0E3B2E] bg-[#0E3B2E]/5'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                }`}
              >
                <input
                  type="file"
                  id="food-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="food-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-5 h-5 text-[#0E3B2E]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0E3B2E] hover:underline">
                      Click to upload
                    </span>{' '}
                    <span className="text-xs text-stone-500">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-stone-400">PNG, JPG, or WebP up to 15MB</p>
                </label>
              </div>
            )}

            {/* Instant Sample Presets */}
            <div>
              <span className="text-[11px] font-medium text-stone-500 block mb-2">
                Or test with a sample dish:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {FOOD_RECOGNITION_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-lg border border-stone-200/80 hover:border-stone-400 hover:bg-stone-50 transition-colors text-left flex items-center gap-2 cursor-pointer"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-10 h-10 rounded-md object-cover shrink-0 border border-stone-200"
                    />
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-semibold text-stone-900 truncate">
                        {sample.name}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">Preset sample</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Context Notes */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label htmlFor="notes" className="text-xs font-medium text-stone-700 block">
                Additional Preparation Details (Optional)
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., olive oil dressing, dining at restaurant..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E] focus:bg-white"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !image}
              className="w-full py-3 bg-[#0E3B2E] hover:bg-[#14532D] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Image with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Analyze Food</span>
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

        {/* Right Column: Results Display */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0E3B2E]/10 text-[#0E3B2E] flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Processing Visual Evidence
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Extracting visual ingredients, plating density, estimated calories, and preparation methods...
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header Title & Cuisine */}
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                    {result.cuisine || 'Cuisine Inferred'}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    {result.foodName}
                  </h2>
                </div>

                {savedSuccess && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#0E3B2E] font-medium bg-[#0E3B2E]/5 px-3 py-1.5 rounded-lg border border-[#0E3B2E]/10 self-start sm:self-auto">
                    <BookmarkCheck className="w-4 h-4 text-[#65A30D]" />
                    <span>Saved to History</span>
                  </div>
                )}
              </div>

              {/* Portion & Calorie Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">
                    Estimated Portion
                  </span>
                  <span className="text-sm font-semibold text-stone-900 mt-1 block">
                    {result.estimatedPortion || 'Standard plate'}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    Confidence: {result.portionConfidence || 'Medium'}
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">
                    Estimated Calories
                  </span>
                  <span className="text-sm font-semibold text-[#0E3B2E] mt-1 block">
                    ~{result.estimatedCalories?.min}-{result.estimatedCalories?.max} {result.estimatedCalories?.unit || 'kcal'}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Approximate range</span>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">
                    Preparation
                  </span>
                  <span className="text-sm font-semibold text-stone-900 mt-1 block truncate">
                    {result.preparationMethod || 'Standard'}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Visual inference</span>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 block font-medium">
                    Dietary Focus
                  </span>
                  <span className="text-sm font-semibold text-[#65A30D] mt-1 block truncate">
                    {result.dietaryObservations?.[0] || 'Balanced'}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Observed</span>
                </div>
              </div>

              {/* Estimated Macronutrients breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Macronutrient Estimates
                  </h4>
                  <span className="text-[11px] text-stone-400">Subject to cooking oil variance</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[11px] text-stone-500">Protein</span>
                    <span className="text-base font-serif font-bold text-[#0E3B2E] block">
                      {result.macronutrients?.proteinGrams || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[11px] text-stone-500">Carbohydrates</span>
                    <span className="text-base font-serif font-bold text-[#65A30D] block">
                      {result.macronutrients?.carbsGrams || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[11px] text-stone-500">Healthy Fats</span>
                    <span className="text-base font-serif font-bold text-amber-600 block">
                      {result.macronutrients?.fatGrams || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[11px] text-stone-500">Dietary Fiber</span>
                    <span className="text-base font-serif font-bold text-stone-700 block">
                      {result.macronutrients?.fiberGrams || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Identified Ingredients */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Identified Food Items & Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.identifiedItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between"
                    >
                      <span className="font-medium text-stone-800">{item.name}</span>
                      <span className="text-stone-400 text-[11px]">
                        {item.category} · Visibility: {item.visibility}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergen & Dietary Notes */}
              {(result.potentialAllergens?.length || result.dietaryObservations?.length) && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <Info className="w-4 h-4 text-stone-500" />
                    <span>Dietary & Allergen Observations</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-600">
                    {result.potentialAllergens?.length ? (
                      <div>
                        <strong className="text-stone-800">Potential Allergens:</strong>{' '}
                        {result.potentialAllergens.join(', ')}
                      </div>
                    ) : null}
                    {result.dietaryObservations?.length ? (
                      <div>
                        <strong className="text-stone-800">Dietary Indicators:</strong>{' '}
                        {result.dietaryObservations.join(', ')}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Chef / Culinary Insight */}
              {result.culinaryInsight && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-[#0E3B2E]">
                    <Sparkles className="w-4 h-4 text-[#65A30D]" />
                    <span>Chef Culinary Insight</span>
                  </div>
                  <p className="leading-relaxed">{result.culinaryInsight}</p>
                </div>
              )}

              {/* Ground-truth Confidence & Uncertainty Disclaimer */}
              <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-stone-500" />
                  <span>Visual Analysis Transparency & Limitations</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {result.confidenceNotes ||
                    'Visual analysis cannot determine exact ingredient quantities, unseen cooking oils, sodium, or hidden allergens with certainty. Portions and calories are informed estimates.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center mx-auto shadow-xs">
                <Camera className="w-6 h-6 text-[#0E3B2E]" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-800">
                Ready for Food Analysis
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Upload a photo or click any sample preset on the left to see Gemini vision decompose your dish into ingredients, calories, and macros.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
