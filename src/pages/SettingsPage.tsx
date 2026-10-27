import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import {
  Settings,
  User,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Database,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Food Enthusiast',
    email: '',
    activityLevel: 'Moderately active',
    dietaryPreference: 'Standard Balanced',
    allergies: [],
    measurementUnits: 'metric',
    privacyConsent: true,
    dailyCalorieTarget: 2100,
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // System diagnostic state
  const [healthStatus, setHealthStatus] = useState<{ status: string; hasApiKey: boolean } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const DIETS = [
    'Standard Balanced',
    'Mediterranean Balanced',
    'Vegetarian',
    'Vegan Plant-Based',
    'Pescatarian',
    'Low-Carb / Keto Friendly',
    'High-Protein Athletic',
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, health] = await Promise.all([
          api.getProfile().catch(() => null),
          api.checkHealth().catch(() => null),
        ]);
        if (profData) setProfile(profData);
        if (health) setHealthStatus(health);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      if (!profile.name.trim()) {
        throw new Error('Name cannot be empty.');
      }
      if (profile.dailyCalorieTarget < 800 || profile.dailyCalorieTarget > 6000) {
        throw new Error('Calorie target should be between 800 and 6,000 kcal.');
      }

      await api.saveProfile(profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (val && !profile.allergies.includes(val)) {
      setProfile({ ...profile, allergies: [...profile.allergies, val] });
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (all: string) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((a) => a !== all),
    });
  };

  const handleCheckHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.checkHealth();
      setHealthStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleClearAllStorage = async () => {
    try {
      await api.clearAllHistory();
      localStorage.clear();
      setShowClearConfirm(false);
      alert('All local app data and analysis history have been reset.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
          <span>Preferences & Diagnostics</span>
          <span aria-hidden="true">·</span>
          <span>Configuration Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0E3B2E]">
          Settings & Profile Controls
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
          Customize your default dietary assumptions, units of measurement, privacy options,
          and inspect Gemini API server connectivity.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white border border-stone-200 rounded-2xl">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: User Profile & Goals */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <User className="w-5 h-5 text-[#0E3B2E]" />
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Profile Information
                </h3>
                <p className="text-xs text-stone-500">Your personal details and default calorie targets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Display Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Contact Email (Optional)</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Default Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={profile.dailyCalorieTarget}
                  onChange={(e) => setProfile({ ...profile, dailyCalorieTarget: Number(e.target.value) })}
                  min={800}
                  max={6000}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Units of Measurement</label>
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, measurementUnits: 'metric' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      profile.measurementUnits === 'metric'
                        ? 'bg-[#0E3B2E] text-white border-[#0E3B2E]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Metric (kg / cm / g)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, measurementUnits: 'imperial' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      profile.measurementUnits === 'imperial'
                        ? 'bg-[#0E3B2E] text-white border-[#0E3B2E]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Imperial (lbs / in / oz)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dietary Preferences */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Activity className="w-5 h-5 text-[#65A30D]" />
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Default Dietary Defaults & Allergies
                </h3>
                <p className="text-xs text-stone-500">Applied automatically to Smart Cooking and Nutrition plans</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Default Dietary Protocol</label>
                <select
                  value={profile.dietaryPreference}
                  onChange={(e) => setProfile({ ...profile, dietaryPreference: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                >
                  {DIETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Allergens tags */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 block">Personal Allergens / Intolerances</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="Add an allergen (e.g. peanuts, dairy, shellfish)..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.allergies.map((all) => (
                    <span
                      key={all}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-stone-100 text-stone-800 border border-stone-200"
                    >
                      <span>{all}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(all)}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Privacy & Data Storage */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Shield className="w-5 h-5 text-[#0E3B2E]" />
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Data Persistence & Privacy
                </h3>
                <p className="text-xs text-stone-500">Transparent handling of biometric and food analysis records</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.privacyConsent}
                  onChange={(e) => setProfile({ ...profile, privacyConsent: e.target.checked })}
                  className="rounded text-[#0E3B2E] focus:ring-[#0E3B2E] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-stone-900 block">
                    Enable Local Session Storage for Scans & Recipes
                  </span>
                  <span className="text-stone-500 text-[11px] block mt-0.5">
                    Your records are retained strictly within your session. Uploaded images are analyzed
                    in real-time and not used for public model training.
                  </span>
                </div>
              </label>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block text-xs">Clear All Stored App Data</span>
                  <span className="text-[11px] text-stone-500">Deletes saved recipes, profiles, and history</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold border border-red-200 cursor-pointer"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: AI Engine Diagnostics */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#0E3B2E]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    AI Engine Connectivity
                  </h3>
                  <p className="text-xs text-stone-500">Multimodal Gemini backend status</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckHealth}
                disabled={checkingHealth}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                {checkingHealth ? 'Pinging...' : 'Test Connection'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Model Runtime:</span>
                <span className="font-mono text-stone-900 font-medium">gemini-3.8-flash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Multimodal Capabilities:</span>
                <span className="font-medium text-[#0E3B2E]">Vision (Images & Video Frames), Text, JSON</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">API Key Status:</span>
                <span className={`font-semibold ${healthStatus?.hasApiKey ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {healthStatus?.hasApiKey ? '✓ Active & Attached via Secrets' : '⚠️ Missing in Environment'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button & Feedback Notifications */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preferences saved successfully!</span>
                </div>
              )}
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#0E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#14532D] shadow-xs disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Reset All Application Data?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will wipe out all saved recipes, user preferences, and analysis history from this browser. Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllStorage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
