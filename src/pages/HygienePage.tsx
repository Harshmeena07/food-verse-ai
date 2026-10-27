import React, { useState } from 'react';
import { HygieneResult } from '../types';
import { api } from '../services/api';
import { extractVideoFrames, ExtractedFrame } from '../utils/video';
import { HYGIENE_SAMPLES, SampleItem } from '../utils/samples';
import {
  ShieldCheck,
  Upload,
  Video,
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  X,
  FileVideo,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const HygienePage: React.FC = () => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [videoFrames, setVideoFrames] = useState<ExtractedFrame[]>([]);
  const [mediaName, setMediaName] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [extractingVideo, setExtractingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HygieneResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setResult(null);
    setMediaName(file.name);

    if (file.type.startsWith('video/')) {
      setMediaType('video');
      setExtractingVideo(true);
      try {
        const frames = await extractVideoFrames(file, 4);
        setVideoFrames(frames);
        setImage(frames[0]?.data || null);
      } catch (err: any) {
        setError('Failed to extract video frames. Please try another video or an image.');
      } finally {
        setExtractingVideo(false);
      }
    } else if (file.type.startsWith('image/')) {
      setMediaType('image');
      setVideoFrames([]);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please provide a valid image (PNG/JPG) or video (MP4/WebM) file.');
    }
  };

  const handleSelectSample = async (sample: SampleItem) => {
    try {
      setLoading(true);
      setError(null);
      setMediaType('image');
      setVideoFrames([]);
      setMediaName(sample.name);
      setNotes(sample.notes || '');

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
    if (!image && videoFrames.length === 0) {
      setError('Please upload an image or video to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const data = await api.analyzeHygiene({
        mediaType,
        image: image || undefined,
        frames: videoFrames.length > 0 ? videoFrames : undefined,
        notes,
      });
      setResult(data);

      // Persist to history
      await api.saveHistory({
        toolType: 'hygiene',
        title: `${data.environmentType || 'Commercial Prep Area'} Hygiene Review`,
        summary: `Rating: ${data.overallHygieneRating} (Risk: ${data.riskSeverity}) · ${data.summary}`,
        imageUrl: image?.startsWith('data:') ? image : undefined,
        details: data,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze hygiene footage.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setVideoFrames([]);
    setMediaName('');
    setResult(null);
    setError(null);
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
          <span>Commercial Kitchen Safety</span>
          <span aria-hidden="true">·</span>
          <span>Image & Video Frame Inspection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
          Restaurant & Prep Area Hygiene Monitor
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Upload images or short kitchen video clips. Gemini analyzes visible prep surface cleanliness,
          cross-contamination safeguards, protective equipment, and food covering practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Media Input */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                1. Upload Kitchen Media
              </h3>
              <span className="text-[11px] text-stone-400">Supports Video & Images</span>
            </div>

            {/* Media Preview */}
            {image ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-900">
                  <img
                    src={image}
                    alt="Kitchen space preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md truncate flex items-center justify-between">
                    <span className="truncate">{mediaName || 'Footage source'}</span>
                    {mediaType === 'video' && (
                      <span className="text-amber-400 text-[10px] uppercase font-bold shrink-0 ml-2">
                        {videoFrames.length} Frames Extracted
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Frame Thumbnails */}
                {videoFrames.length > 0 && (
                  <div>
                    <span className="text-[11px] text-stone-500 font-medium block mb-1.5">
                      Sampled Video Frame Intervals:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {videoFrames.map((frame, idx) => (
                        <div
                          key={idx}
                          onClick={() => setImage(frame.data)}
                          className={`relative rounded-lg overflow-hidden border cursor-pointer ${
                            image === frame.data
                              ? 'border-[#0E3B2E] ring-2 ring-[#0E3B2E]/20'
                              : 'border-stone-200 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={frame.data}
                            alt={`Frame ${idx + 1}`}
                            className="w-full h-14 object-cover"
                          />
                          <span className="absolute bottom-0.5 right-1 bg-black/70 text-white text-[9px] px-1 rounded">
                            {frame.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-[#0E3B2E] bg-[#0E3B2E]/5'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                }`}
              >
                <input
                  type="file"
                  id="hygiene-upload"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="hygiene-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-amber-700 flex items-center justify-center shadow-xs">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0E3B2E] hover:underline">
                      Upload Kitchen Video or Photo
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">MP4, WebM, PNG, JPG</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Video is automatically sampled into frame timestamps
                  </p>
                </label>
              </div>
            )}

            {extractingVideo && (
              <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0E3B2E]" />
                <span>Extracting representative frames across video duration...</span>
              </div>
            )}

            {/* Presets */}
            <div>
              <span className="text-[11px] font-medium text-stone-500 block mb-2">
                Or test with sample kitchen footage:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {HYGIENE_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-lg border border-stone-200/80 hover:border-stone-400 hover:bg-stone-50 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-12 h-12 rounded-md object-cover shrink-0 border border-stone-200"
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {sample.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">{sample.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Context Notes */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label htmlFor="environment-notes" className="text-xs font-medium text-stone-700 block">
                Environment Notes (Optional)
              </label>
              <input
                id="environment-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. food truck prep station, deli sandwich bar..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || extractingVideo || (!image && videoFrames.length === 0)}
              className="w-full py-3 bg-[#0E3B2E] hover:bg-[#14532D] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Observable Visual Practices...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#65A30D]" />
                  <span>Analyze Observable Hygiene</span>
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

        {/* Right Column: Hygiene Inspection Findings */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Analyzing Observable Hygiene Standards
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Checking for cross-contamination risks, prep surface sanitization, food shields, and protective equipment in visible frames...
              </p>
            </div>
          ) : result ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header */}
              <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    Visual Evidence Review
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    {result.environmentType}
                  </h2>
                </div>

                {savedSuccess && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#0E3B2E] font-medium bg-[#0E3B2E]/5 px-3 py-1.5 rounded-lg border border-[#0E3B2E]/10 self-start sm:self-auto">
                    <BookmarkCheck className="w-4 h-4 text-[#65A30D]" />
                    <span>Logged to History</span>
                  </div>
                )}
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">
                    Observable Cleanliness Standard
                  </span>
                  <span className="text-lg font-serif font-bold text-[#0E3B2E] block">
                    {result.overallHygieneRating}
                  </span>
                  <p className="text-xs text-stone-600 leading-normal max-w-md">{result.summary}</p>
                </div>

                <div
                  className={`px-3.5 py-2 rounded-xl border text-center self-start sm:self-center shrink-0 ${getSeverityBadgeColor(
                    result.riskSeverity
                  )}`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold block">
                    Risk Severity
                  </span>
                  <span className="text-base font-bold">{result.riskSeverity}</span>
                </div>
              </div>

              {/* Categorized Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Observable Inspection Categories
                  </h4>
                  <span className="text-[11px] text-stone-400">Distinguishes observed vs not visible</span>
                </div>

                <div className="space-y-2.5">
                  {result.categories?.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900">{cat.name}</span>
                        <span className="text-[11px] font-medium text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                          {cat.status}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-[11px]">{cat.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positive Practices Observed */}
              {result.positivePractices?.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 space-y-1.5">
                  <div className="font-semibold text-[#0E3B2E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#65A30D]" />
                    <span>Positive Practices Observed</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-900/90 pl-1">
                    {result.positivePractices.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Corrective Actions / Improvements */}
              {result.areasForImprovement?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 space-y-1.5">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Recommended Corrective Measures</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
                    {result.areasForImprovement.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations & Legal Disclaimer */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-stone-500" />
                  <span>Important Scope & Limitations</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {result.limitationsAndDisclaimer ||
                    'This evaluation is strictly based on visible indicators captured in the footage. It does not certify compliance with statutory food safety regulations, replace licensed health inspector visits, or measure bacterial cultures and internal cooking temperatures.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-800">
                Ready for Hygiene Video / Image Review
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Upload a video clip or photo of a food preparation workstation, cookline, or dining bar to inspect visible cleanliness practices and risk indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
