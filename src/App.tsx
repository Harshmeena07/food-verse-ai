/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, HistoryItem } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatAssistant } from './components/ChatAssistant';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FoodRecognitionPage } from './pages/FoodRecognitionPage';
import { FreshnessPage } from './pages/FreshnessPage';
import { HygienePage } from './pages/HygienePage';
import { CookingPage } from './pages/CookingPage';
import { NutritionPage } from './pages/NutritionPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

import { MessageSquare, Sparkles } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    // Check server health and API key status on mount
    api.checkHealth()
      .then((res) => {
        setHasApiKey(res.hasApiKey);
      })
      .catch(() => {
        setHasApiKey(false);
      });
  }, []);

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setCurrentPage('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 selection:bg-[#65A30D]/20 selection:text-[#0E3B2E]">
      {/* Persistent Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenChat={() => setChatOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenChat={() => setChatOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenChat={() => setChatOpen(true)}
            onViewHistoryItem={handleViewHistoryItem}
          />
        )}

        {currentPage === 'recognition' && (
          <FoodRecognitionPage />
        )}

        {currentPage === 'freshness' && (
          <FreshnessPage />
        )}

        {currentPage === 'hygiene' && (
          <HygienePage />
        )}

        {currentPage === 'cooking' && (
          <CookingPage />
        )}

        {currentPage === 'nutrition' && (
          <NutritionPage />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            onNavigate={handleNavigate}
            selectedItemModal={selectedHistoryItem}
            onClearSelectedItemModal={() => setSelectedHistoryItem(null)}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating AI Assistant Chat Drawer */}
      <ChatAssistant
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Floating Chat Trigger Button (when chat is closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          title="Open AI Culinary Assistant"
          className="fixed bottom-6 right-6 z-40 bg-[#0E3B2E] hover:bg-[#14532D] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#0E3B2E]/20"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#65A30D] ring-2 ring-[#0E3B2E]"></span>
          </div>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-semibold pr-1">
            Ask AI Assistant
          </span>
        </button>
      )}
    </div>
  );
}
