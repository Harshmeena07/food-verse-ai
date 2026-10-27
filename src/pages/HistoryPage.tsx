import React, { useState, useEffect } from 'react';
import { HistoryItem, PageView } from '../types';
import { api } from '../services/api';
import {
  Clock,
  Search,
  Filter,
  Trash2,
  Camera,
  Sparkles,
  ShieldCheck,
  ChefHat,
  Apple,
  ExternalLink,
  Download,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';

interface HistoryPageProps {
  onNavigate: (page: PageView) => void;
  selectedItemModal?: HistoryItem | null;
  onClearSelectedItemModal?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigate,
  selectedItemModal,
  onClearSelectedItemModal,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailItem, setActiveDetailItem] = useState<HistoryItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (selectedItemModal) {
      setActiveDetailItem(selectedItemModal);
    }
  }, [selectedItemModal]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (activeDetailItem?.id === id) {
        setActiveDetailItem(null);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllHistory();
      setHistory([]);
      setActiveDetailItem(null);
      setConfirmClearAll(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodverse-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSeedSample = async () => {
    const demoItems: HistoryItem[] = [
      {
        id: 'rec_demo_1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        toolType: 'recognition',
        title: 'Grilled Salmon Power Bowl',
        summary: 'Wild salmon fillet over quinoa, roasted asparagus & edamame. ~480 kcal, 34g protein.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        details: {
          foodName: 'Grilled Salmon Power Bowl',
          cuisine: 'Mediterranean',
          estimatedPortion: '~380g standard bowl',
          portionConfidence: 'High',
          estimatedCalories: { min: 450, max: 520, unit: 'kcal' },
          macronutrients: { proteinGrams: '34g', carbsGrams: '42g', fatGrams: '18g', fiberGrams: '7g' },
          preparationMethod: 'Pan-seared / grilled',
          dietaryObservations: ['Pescatarian', 'High-Protein', 'Gluten-Free ingredients'],
          confidenceNotes: 'Portions estimated visually from bowl dimensions.',
        },
      },
      {
        id: 'rec_demo_2',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        toolType: 'freshness',
        title: 'Strawberries Freshness Inspection',
        summary: 'Grade: Peak Quality (88/100) · Firm surface, bright calyx, eat within 2-3 days.',
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
        details: {
          itemDetected: 'Fresh Strawberries',
          category: 'Fruits',
          apparentFreshnessGrade: 'Peak Quality',
          freshnessScore: 88,
          recommendedAction: 'Eat within 2-3 days',
          storageOptimizationTips: ['Keep refrigerated in ventilated produce container', 'Wash only immediately prior to consumption'],
          safetyDisclaimer: 'Visual review cannot confirm absence of microbial bacteria.',
        },
      },
      {
        id: 'rec_demo_3',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        toolType: 'hygiene',
        title: 'Prep Counter Station Review',
        summary: 'Overall: Satisfactory (Risk: Low) · Stainless tables wiped down, ingredients covered.',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
        details: {
          environmentType: 'Commercial Prep Kitchen',
          overallHygieneRating: 'Satisfactory',
          riskSeverity: 'Low',
          summary: 'Stainless steel preparation surfaces appear orderly with ingredient bins properly covered.',
          limitationsAndDisclaimer: 'Review based on visual frame samples; not a regulatory inspection.',
        },
      },
    ];

    for (const item of demoItems) {
      await api.saveHistory(item);
    }
    loadHistory();
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'recognition':
        return <Camera className="w-4 h-4 text-[#0E3B2E]" />;
      case 'freshness':
        return <Sparkles className="w-4 h-4 text-[#65A30D]" />;
      case 'hygiene':
        return <ShieldCheck className="w-4 h-4 text-amber-700" />;
      case 'cooking':
        return <ChefHat className="w-4 h-4 text-emerald-800" />;
      case 'nutrition':
        return <Apple className="w-4 h-4 text-lime-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-500" />;
    }
  };

  const filters = [
    { id: 'all', label: 'All Logs' },
    { id: 'recognition', label: 'Recognition' },
    { id: 'freshness', label: 'Freshness' },
    { id: 'hygiene', label: 'Hygiene' },
    { id: 'cooking', label: 'Cooking' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  const filteredHistory = history.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.toolType === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            <span>Audit & Activity Trail</span>
            <span aria-hidden="true">·</span>
            <span>Local Session Persistence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
            Analysis History & Logs
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Review past meal scans, freshness evaluations, kitchen hygiene reports, and recipes.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export history records as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => setConfirmClearAll(true)}
                className="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#0E3B2E] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title or summary..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
          />
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Clear All History Records?
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              This action will permanently delete all logged scans, freshness reports, and meal plans from your session storage. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-xs text-stone-500">
          Loading history records...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-base text-stone-800">
            No Records Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || activeFilter !== 'all'
              ? 'No history matches your search or category filter. Try clearing the filter.'
              : 'You have not performed any AI food scans yet. Start scanning meals or test with realistic demo records.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('recognition')}
              className="px-4 py-2 bg-[#0E3B2E] text-white text-xs font-semibold rounded-xl hover:bg-[#14532D] cursor-pointer"
            >
              Analyze New Food
            </button>
            {history.length === 0 && (
              <button
                onClick={handleSeedSample}
                className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-200 cursor-pointer"
              >
                Load Sample Records
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveDetailItem(item)}
              className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 hover:border-stone-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    {getToolIcon(item.toolType)}
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#65A30D] uppercase tracking-wider">
                      {item.toolType}
                    </span>
                    <span className="text-stone-300 text-xs">·</span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 truncate group-hover:text-[#0E3B2E] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-1 leading-normal max-w-xl">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-xs font-semibold text-[#0E3B2E] group-hover:underline hidden sm:inline">
                  View Full Report
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(item.id);
                  }}
                  title="Delete record"
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Individual Item Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Delete Analysis Record?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove this record from your history?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Drawer / Modal */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-[#65A30D] uppercase tracking-wider block">
                  {activeDetailItem.toolType} Report Details
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-0.5">
                  {activeDetailItem.title}
                </h2>
                <span className="text-[11px] text-stone-400">
                  Logged on {new Date(activeDetailItem.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveDetailItem(null);
                  if (onClearSelectedItemModal) onClearSelectedItemModal();
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeDetailItem.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-stone-200 max-h-64">
                <img
                  src={activeDetailItem.imageUrl}
                  alt={activeDetailItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 leading-relaxed">
              <span className="font-semibold text-stone-900 block mb-1">Executive Summary:</span>
              <p>{activeDetailItem.summary}</p>
            </div>

            {/* Formatted JSON payload view */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Full Structured AI Inference:
              </span>
              <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                {JSON.stringify(activeDetailItem.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                onClick={() => handleDeleteItem(activeDetailItem.id)}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this record</span>
              </button>
              <button
                onClick={() => {
                  setActiveDetailItem(null);
                  if (onClearSelectedItemModal) onClearSelectedItemModal();
                }}
                className="px-5 py-2.5 bg-[#0E3B2E] text-white text-xs font-semibold rounded-xl hover:bg-[#14532D] cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
