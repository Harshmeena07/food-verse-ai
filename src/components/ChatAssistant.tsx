import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import {
  X,
  Send,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Minimize2,
  Maximize2,
  ChefHat,
  ShieldCheck,
  Apple,
  RefreshCw,
} from 'lucide-react';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'model',
    content:
      'Hello! I am your Food Verse AI culinary & nutrition companion. Ask me anything about recipe adaptations, ingredient storage, food safety cues, or dietary planning. You can also upload a food image for questions!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTIONS = [
  'What can I cook with potatoes, tomatoes, and garlic?',
  'How should I properly store fresh berries & leafy greens?',
  'Suggest a vegetarian 30g high-protein dinner.',
  'What are key signs of freezer burn vs spoilage?',
  'Explain common kitchen cross-contamination risks.',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('fv_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fv_chat_history', JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && !attachedImage) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text || 'Please review this attached image.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: attachedImage || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    const curImage = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      // Map to Gemini roles
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chat({
        messages: apiMessages,
        image: curImage || undefined,
      });

      const modelMessage: ChatMessage = {
        id: 'mod_' + Date.now(),
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        content:
          err.message ||
          'I apologize, but I encountered an error connecting to the AI model. Please verify your GEMINI_API_KEY.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('fv_chat_history');
    } catch {}
  };

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 bg-white border border-stone-200 shadow-2xl transition-all duration-200 flex flex-col ${
        isExpanded
          ? 'w-full md:w-[680px] h-full md:h-[85vh] md:rounded-t-2xl'
          : 'w-full sm:w-[420px] h-[580px] sm:rounded-t-2xl sm:mr-4'
      }`}
    >
      {/* Header */}
      <div className="bg-[#0E3B2E] text-white px-4 py-3 sm:rounded-t-2xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#65A30D]/20 text-[#65A30D] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
              <span>Food Verse Assistant</span>
            </h3>
            <p className="text-[10px] text-stone-300">Culinary reasoning & nutritional guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-stone-300">
          <button
            onClick={handleClear}
            title="Reset conversation"
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="hidden sm:block p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close Assistant"
            className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggestion Quick Chips */}
      <div className="px-3 py-2 bg-stone-50 border-b border-stone-200 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(item)}
            className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-700 rounded-md border border-stone-200 transition-colors shrink-0"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                  isUser
                    ? 'bg-[#0E3B2E] text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                }`}
              >
                {msg.image && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-w-[200px]">
                    <img
                      src={msg.image}
                      alt="User upload preview"
                      className="w-full h-auto object-cover max-h-36"
                    />
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
              <span className="text-[10px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs py-2 px-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0E3B2E]" />
            <span>Thinking with Gemini...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached Image preview before send */}
      {attachedImage && (
        <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={attachedImage}
              alt="Attached preview"
              className="w-10 h-10 object-cover rounded-md border border-stone-300"
            />
            <span className="text-xs text-stone-600 font-medium">Image attached</span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-stone-400 hover:text-stone-600 text-xs p-1"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-stone-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach a food image"
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about recipes, ingredients, safety..."
            disabled={loading}
            className="flex-1 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E] focus:bg-white"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !attachedImage)}
            className="p-2 bg-[#0E3B2E] text-white rounded-lg hover:bg-[#14532D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-stone-400 text-center mt-2">
          AI generated suggestions. Check freshness and allergies independently.
        </p>
      </div>
    </div>
  );
};
