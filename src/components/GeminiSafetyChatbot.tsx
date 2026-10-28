import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Compass, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  PhoneCall, 
  MapPin, 
  Loader2, 
  CloudRain,
  ExternalLink
} from 'lucide-react';
import { LocationPoint } from '../types/saferoute';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: any[];
  };
}

interface GeminiSafetyChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: LocationPoint | null;
  destinationLocation: LocationPoint | null;
  activeHazardsCount: number;
  cityName: string;
}

export const GeminiSafetyChatbot: React.FC<GeminiSafetyChatbotProps> = ({
  isOpen,
  onClose,
  userLocation,
  destinationLocation,
  activeHazardsCount,
  cityName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Namaste! I am your SafeRoute AI Copilot powered by Gemini 3.8 Flash. I provide real-time grounded safety advice, street illumination checks, waterlogging alerts, and safe transit routes across ${cityName || 'India'}. How can I assist your journey?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-usr`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          userLocation: userLocation ? {
            lat: userLocation.coordinates[0],
            lng: userLocation.coordinates[1],
            city: cityName,
          } : undefined,
          groundingMode,
          activeHazardsCount,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.fallback) {
        throw new Error(data.error || 'Failed to communicate with Gemini Safety Copilot');
      }

      const botReply: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: 'assistant',
        content: data.reply || data.fallback || 'Stay cautious on your route. Stick to well-lit main corridors.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `⚠️ Safety Notice: Unable to reach AI live service. If you feel unsafe or observe unlit alleys or severe waterlogging, immediately dial emergency 112 or head to the nearest lit metro station or police outpost.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    `Is my route from ${userLocation?.name?.slice(0, 15) || 'current location'} safe right now?`,
    'Check local weather alerts, rain & waterlogging',
    'Where is the closest 24/7 Police Beat or Safe Haven?',
    'What are the emergency contact guidelines in India?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col font-sans transition-all">
      {/* Header */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-white tracking-wide">SafeRoute Copilot</h2>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Live Civic & Transit AI Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close copilot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grounding Mode Selector */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">Grounding Tool:</span>
        <div className="flex gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setGroundingMode('search')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              groundingMode === 'search'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3 h-3" />
            Google Search
          </button>
          <button
            onClick={() => setGroundingMode('maps')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              groundingMode === 'maps'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3 h-3" />
            Google Maps
          </button>
        </div>
      </div>

      {/* Quick Helplines Banner */}
      <div className="px-3 py-1.5 bg-red-950/30 border-b border-red-900/30 flex items-center justify-between text-[11px]">
        <span className="text-red-300 flex items-center gap-1 font-medium">
          <ShieldAlert className="w-3 h-3 text-red-400" />
          Emergency Speed Dials:
        </span>
        <div className="flex gap-2">
          <a
            href="tel:112"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-900/40 text-red-200 hover:bg-red-800/60 font-mono text-[10px]"
          >
            <PhoneCall className="w-2.5 h-2.5" /> 112 (SOS)
          </a>
          <a
            href="tel:1091"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-200 hover:bg-purple-800/60 font-mono text-[10px]"
          >
            1091 (Women)
          </a>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-xs shadow-md'
                  : 'bg-slate-800/95 text-slate-100 rounded-tl-xs border border-slate-700/60 shadow-md'
              }`}
            >
              {/* Message text with basic markdown/bullet formatting */}
              <div className="whitespace-pre-wrap space-y-1">
                {m.content.split('\n').map((line, idx) => {
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <div key={idx} className="flex gap-1.5 pl-1 text-slate-200">
                        <span className="text-cyan-400">•</span>
                        <span>{line.replace(/^[-*]\s+/, '')}</span>
                      </div>
                    );
                  }
                  if (line.startsWith('### ') || line.startsWith('## ')) {
                    return (
                      <div key={idx} className="font-semibold text-cyan-300 pt-1">
                        {line.replace(/^#{2,3}\s+/, '')}
                      </div>
                    );
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {/* Grounding sources pill */}
              {m.groundingMetadata?.webSearchQueries && m.groundingMetadata.webSearchQueries.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 text-cyan-400 font-medium mb-1">
                    <Search className="w-2.5 h-2.5" /> Grounded Search Queries:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.groundingMetadata.webSearchQueries.map((q: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-2xl rounded-tl-xs border border-slate-700/40 w-fit text-slate-300 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Consulting Gemini 3.8 Flash & Grounded Feeds...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/60">
        <div className="text-[10px] text-slate-400 mb-1.5 font-medium flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Suggested Safety Queries:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about route safety in ${cityName || 'India'}...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-all shadow-md flex items-center justify-center"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
