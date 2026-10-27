import React, { useState } from 'react';
import { FreshnessResult } from '../types';
import { api } from '../services/api';
import { FRESHNESS_SAMPLES, SampleItem } from '../utils/samples';
import {
  Sparkles,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Layers,
  Thermometer,
  BookmarkCheck,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FreshnessPage: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [category, setCategory] = useState('Fruits');
  const [storageConditions, setStorageConditions] = useState('Refrigerated (3-5°C)');
  const [purchaseDate, setPurchaseDate] = useState('2 days ago');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreshnessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const categories = [
    'Fruits',
    'Vegetables',
    'Bakery & Grains',
    'Meat & Poultry',
    'Seafood',
    'Dairy & Cheese',
    'Cooked Leftovers',
    'Other / Packaged',
  ];

  const storageOptions = [
    'Refrigerated (3-5°C)',
    'Countertop / Room Temp (20-22°C)',
    'Cool Dry Pantry',
    'Freezer (-18°C)',
    'Airtight Container',
    'Unrefrigerated / Warm',
  ];

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please provide an image file (JPEG, PNG, WebP).');
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
      if (sample.category) setCategory(sample.category);
      if (sample.storage) setStorageConditions(sample.storage);
      if (sample.date) setPurchaseDate(sample.date);

      const resp = await fetch(sample.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setImage(sample.url);
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please select or upload a food image to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const data = await api.analyzeFreshness({
        image,
        category,
        storageConditions,
        purchaseDate,
      });
      setResult(data);

      // Persist to history
      await api.saveHistory({
        toolType: 'freshness',
        title: `${data.itemDetected || category} - Freshness Check`,
        summary: `Grade: ${data.apparentFreshnessGrade} (${data.freshnessScore}/100) · Action: ${data.recommendedAction}`,
        imageUrl: image.startsWith('data:') ? image : undefined,
        details: data,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze freshness.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImageName('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#65A30D] uppercase tracking-wider mb-1">
          <span>Multimodal Quality Assessment</span>
          <span aria-hidden="true">·</span>
          <span>Visible Freshness Indicators</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
          AI Food Freshness Insights
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Evaluate visible indicators such as oxidation, surface discoloration, wilting, and mold-like patterns.
          Receive shelf-life advice, sensory verification checklists, and food safety precautions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Image & Storage Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Food Image & Storage Conditions
            </h3>

            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 group bg-stone-900">
                <img
                  src={image}
                  alt="Food to inspect"
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
                  {imageName || 'Selected food item'}
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
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-[#0E3B2E] bg-[#0E3B2E]/5'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                }`}
              >
                <input
                  type="file"
                  id="freshness-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="freshness-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-[#65A30D] flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0E3B2E] hover:underline">
                      Click to upload
                    </span>{' '}
                    <span className="text-xs text-stone-500">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-stone-400">Photos of produce, bread, or leftovers</p>
                </label>
              </div>
            )}

            {/* Presets */}
            <div>
              <span className="text-[11px] font-medium text-stone-500 block mb-2">
                Or choose a sample item:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {FRESHNESS_SAMPLES.map((sample) => (
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
                      <div className="text-[10px] text-stone-400 truncate">{sample.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label htmlFor="food-category" className="text-xs font-medium text-stone-700 block">
                Food Category
              </label>
              <select
                id="food-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Condition */}
            <div className="space-y-1.5">
              <label htmlFor="storage-conditions" className="text-xs font-medium text-stone-700 block">
                Storage Conditions
              </label>
              <select
                id="storage-conditions"
                value={storageConditions}
                onChange={(e) => setStorageConditions(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              >
                {storageOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase or Preparation Date */}
            <div className="space-y-1.5">
              <label htmlFor="purchase-date" className="text-xs font-medium text-stone-700 block">
                Approximate Age / Purchase Date
              </label>
              <input
                id="purchase-date"
                type="text"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                placeholder="e.g. Bought yesterday, cooked 3 days ago..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !image}
              className="w-full py-3 bg-[#0E3B2E] hover:bg-[#14532D] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Visible Freshness...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#65A30D]" />
                  <span>Analyze Freshness Indicators</span>
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

        {/* Right Column: Freshness Report */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#65A30D]/10 text-[#65A30D] flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Evaluating Visual Degradation Markers
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Scanning for discoloration, surface wilting, fungal spores, enzymatic browning, and moisture shifts...
              </p>
            </div>
          ) : result ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Report Header */}
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                    {result.category} Assessment
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    {result.itemDetected}
                  </h2>
                </div>

                {savedSuccess && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#0E3B2E] font-medium bg-[#0E3B2E]/5 px-3 py-1.5 rounded-lg border border-[#0E3B2E]/10 self-start sm:self-auto">
                    <BookmarkCheck className="w-4 h-4 text-[#65A30D]" />
                    <span>Logged to History</span>
                  </div>
                )}
              </div>

              {/* Freshness Grade Banner */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">
                    Apparent Freshness Quality
                  </span>
                  <span className="text-lg font-serif font-bold text-[#0E3B2E] mt-0.5 block">
                    {result.apparentFreshnessGrade}
                  </span>
                  <span className="text-xs text-stone-600 mt-1 block">
                    Recommended Action: <strong className="text-stone-900">{result.recommendedAction}</strong>
                  </span>
                </div>

                {/* Score */}
                <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 text-center shrink-0">
                  <span className="text-[10px] uppercase text-stone-400 font-medium block">
                    Visual Score
                  </span>
                  <span className="text-2xl font-serif font-bold text-[#0E3B2E]">
                    {result.freshnessScore}
                    <span className="text-xs font-sans text-stone-400">/100</span>
                  </span>
                </div>
              </div>

              {/* Observed Visual Indicators Table */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Visible Indicator Breakdown
                </h4>
                <div className="space-y-2">
                  {result.visualIndicators?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-stone-900">{item.indicator}</span>
                        <p className="text-stone-600 text-[11px]">{item.details}</p>
                      </div>
                      <span className="text-[11px] font-medium text-stone-700 bg-white px-2.5 py-1 rounded-md border border-stone-200 self-start sm:self-center shrink-0">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observed Concerns */}
              {result.observedConcerns?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Specific Observations & Concerns</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
                    {result.observedConcerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Storage Optimization Tips */}
              {result.storageOptimizationTips?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Recommended Preservation & Storage
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.storageOptimizationTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-stone-50 border border-stone-100 text-stone-700"
                      >
                        • {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensory Verification Checklist */}
              {result.sensoryChecklist?.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <div className="font-semibold text-stone-800">
                    Human Sensory Verification Checklist (Before Consuming)
                  </div>
                  <div className="space-y-1 text-stone-600">
                    {result.sensoryChecklist.map((check, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#65A30D] shrink-0 mt-0.5" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Critical Food Safety Ground Truth Disclaimer */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-stone-500" />
                  <span>Food Safety Disclaimer</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {result.safetyDisclaimer ||
                    'Image analysis cannot detect invisible food-borne pathogens (such as Listeria, Salmonella, or bacterial enterotoxins). Never rely exclusively on an image to confirm safety. If an item smells sour, feels abnormally slimy, or shows mold, discard it immediately.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-[#65A30D] flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-800">
                No Freshness Check Running
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Upload a picture of fresh produce, pantry bread, or leftovers on the left to evaluate visible freshness markers and storage suggestions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
