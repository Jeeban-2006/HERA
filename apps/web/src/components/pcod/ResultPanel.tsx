'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
} from 'recharts';
import {
  Salad, Dumbbell, Moon, Pill, Heart,
  Sparkles, FlaskConical, Send, X, Bot, User, HelpCircle, Loader2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GlowButton } from '@/components/ui/GlowButton';
import type { PCODAnalysisResult, Priority } from '@/types/pcod.types';

const ICON_MAP: Record<string, React.ElementType> = {
  Salad, Dumbbell, Moon, Pill, Heart, Sparkles,
};

const priorityColors: Record<Priority, string> = {
  high: 'text-bio-coral bg-bio-coral/10 border-bio-coral/30',
  medium: 'text-bio-gold bg-bio-gold/10 border-bio-gold/30',
  low: 'text-bio-teal bg-bio-teal/10 border-bio-teal/30',
};

function formatMessageContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    if (!line.trim()) return <div key={index} className="h-2" />;

    // Detect list items
    const isNumberedList = /^\d+\.\s+/.test(line);
    const isBulletList = /^[-*]\s+/.test(line);

    let cleanedText = line;
    let prefix = null;

    if (isNumberedList) {
      const match = line.match(/^(\d+\.)\s+/);
      if (match) {
        prefix = match[1];
        cleanedText = line.replace(/^\d+\.\s+/, '');
      }
    } else if (isBulletList) {
      prefix = "•";
      cleanedText = line.replace(/^[-*]\s+/, '');
    }

    // Process bold text
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(cleanedText)) !== null) {
      parts.push(cleanedText.substring(lastIndex, match.index));
      parts.push(
        <strong key={match.index} className="text-bio-teal font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    parts.push(cleanedText.substring(lastIndex));

    if (prefix) {
      return (
        <div key={index} className="pl-4 py-0.5 flex items-start gap-2">
          <span className="text-bio-teal font-mono shrink-0">{prefix}</span>
          <span className="flex-1 text-text-primary">{parts}</span>
        </div>
      );
    }

    return (
      <p key={index} className="mb-2 last:mb-0 leading-relaxed text-text-primary">
        {parts}
      </p>
    );
  });
}

interface ResultPanelProps {
  result: PCODAnalysisResult;
  onNewAnalysis: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ResultPanel({ result, onNewAnalysis }: ResultPanelProps) {
  const chartData = [
    { name: 'score', value: result.riskScore, fill: '#FF5F7E' },
    { name: 'bg', value: 100, fill: 'rgba(255,255,255,0.05)' },
  ];

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Initialise chat with welcoming message referencing results
  const openChat = () => {
    setIsChatOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am HERA, your AI Health assistant. I've analyzed your PCOD results indicating **${result.subtypeLabel}** with a risk score of **${result.riskScore}/100**. How can I help you interpret these findings, plan your wellness strategy, or answer questions about your lab flags? (You can ask up to 10 questions).`
        }
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || userMessageCount >= 10 || isLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setUserMessageCount(prev => prev + 1);
    
    const newUserMessage: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const systemPrompt = `You are HERA, a compassionate, medically-informed AI health assistant specialized in women's health and PCOD.
You are helping the user interpret and understand their PCOD analysis results:
- Subtype: ${result.subtypeLabel}
- Risk Score: ${result.riskScore}/100
- Confidence: ${result.confidence}%
- Key Drivers: ${result.drivers.map(d => `${d.label} (${d.value}%)`).join(', ')}
- Lab Flags: ${result.labFlags.map(f => `${f.marker}: ${f.value} (Range: ${f.range}, Status: ${f.status})`).join(', ')}
- Recommendations: ${result.recommendations.map(r => `${r.title} (${r.priority} priority): ${r.desc}`).join(', ')}

STRICT RELEVANCE RULE:
You MUST ONLY answer questions directly related to PCOD, health, biology, diet, exercise, lifestyle recommendations, lab indicators, or medical results.
If the user asks an irrelevant question (such as coding, programming, general knowledge, math, history, pop culture, or anything unrelated to health/PCOD), you MUST politely refuse to answer. Do NOT answer the irrelevant query under any circumstances.
Instead, redirect them back to their PCOD health analysis. For example: "I can only help you with questions related to your PCOD results and women's health. Let me know if you want to discuss your subtype, lab markers, or recommendations!"

Please provide warm, supportive, actionable, and medically accurate responses. Emphasize that you are an AI companion supporting their journey. Keep your responses focused, concise, and clean.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedMessages
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("Groq API error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error connecting to my AI processor. Please check your internet connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-bio-coral">{result.subtypeLabel}</h2>
          <p className="text-text-muted text-sm mt-1">AI-powered PCOD subtype analysis</p>
        </div>
        <GlowButton variant="ghost" accent="coral" size="sm" onClick={onNewAnalysis}>
          New Analysis
        </GlowButton>
      </div>

      {/* Section 1: Score + Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Score Donut */}
        <GlassCard className="p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Risk Score</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-bio-coral">{result.riskScore}</span>
              <span className="text-xs text-text-muted">/100</span>
            </div>
          </div>
          <span className="mt-3 px-3 py-1 rounded-full text-xs bg-bio-teal/10 text-bio-teal border border-bio-teal/30 font-mono">
            {result.confidence}% confidence
          </span>
        </GlassCard>

        {/* Driver Breakdown */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Driver Breakdown</h3>
          {result.drivers.map((driver, idx) => (
            <div key={driver.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-body text-text-primary">{driver.label}</span>
                <span className="font-mono font-semibold" style={{ color: driver.color }}>{driver.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: driver.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${driver.value}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Section 2: Lab Markers */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-bio-gold" /> Lab Markers
        </h3>
        <div className="divide-y divide-white/5">
          {result.labFlags.map((flag, idx) => (
            <motion.div
              key={flag.marker}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <div className="text-sm font-body text-text-primary">{flag.marker}</div>
                <div className="text-xs text-text-muted">Normal: {flag.range}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-text-primary">{flag.value}</span>
                <StatusBadge status={flag.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Section 3: Recommendations */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Personalised Recommendations
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((rec, idx) => {
            const Icon = ICON_MAP[rec.iconName] ?? Heart;
            return (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-bio-coral/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-bio-coral" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-text-primary">{rec.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border font-mono ${priorityColors[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{rec.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Talk to HERA */}
      <GlowButton variant="ghost" accent="teal" size="lg" className="w-full" onClick={openChat}>
        <Sparkles className="w-4 h-4" />
        Talk to HERA AI
      </GlowButton>

      {/* Groq Chat Modal Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl h-[600px] rounded-2xl border border-white/10 bg-surface flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bio-teal/15 border border-bio-teal/30 flex items-center justify-center text-bio-teal">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text-primary flex items-center gap-2">
                      HERA PCOD Companion
                    </h3>
                    <p className="text-xs text-text-muted">Interpreting: {result.subtypeLabel}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-text-muted">
                    {userMessageCount}/10 Questions asked
                  </span>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-text-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-bio-coral/10 text-bio-coral border border-bio-coral/20'
                        : 'bg-bio-teal/10 text-bio-teal border border-bio-teal/20'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`rounded-2xl p-4 text-sm font-body leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-bio-coral/10 text-text-primary rounded-tr-none border border-bio-coral/10'
                        : 'bg-white/5 text-text-primary rounded-tl-none border border-white/5'
                    }`}>
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-bio-teal/10 text-bio-teal border border-bio-teal/20 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white/5 text-text-muted rounded-2xl rounded-tl-none p-4 text-sm font-body flex items-center gap-2 border border-white/5">
                      <Loader2 className="w-4 h-4 animate-spin text-bio-teal" />
                      HERA is thinking...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                {userMessageCount >= 10 ? (
                  <div className="text-center py-2 text-xs text-bio-coral font-mono border border-bio-coral/20 bg-bio-coral/5 rounded-lg flex items-center justify-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Maximum of 10 messages reached for this session.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      disabled={isLoading}
                      placeholder="Ask HERA about your results, risk flags, or recommendations..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-bio-teal/50 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-4 bg-bio-teal text-void rounded-xl font-bold flex items-center justify-center hover:shadow-glow-teal transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
