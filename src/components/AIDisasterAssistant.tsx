import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, MessageSquare, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIDisasterAssistantProps {
  onAddLog: (comp: string, msg: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function AIDisasterAssistant({ onAddLog }: AIDisasterAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "assistant",
      text: "Authorized Operator, this is DisasterMind AI. I have live-synthesized GIS overlays, shelter occupancy levels, and active SOS requests. Ask me to formulate rescue plans, generate dispatch reports, or run predictive rain models.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: "Analyze flood surge for Water slum SOS-9421", label: "Flood surge plans" },
    { text: "Allocate medical team to St. Xavier", label: "Medical bottlenecks" },
    { text: "Generate SMS alert broadcast for high winds", label: "Evac dispatches" }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    setUserInput("");
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    onAddLog("AI Engine", `Analyzing operator query: "${text.substring(0, 30)}..."`, "info");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I encountered an empty brain response. Operating in standard parameters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      onAddLog("AI Engine", "Strategy optimization synthesized successfully.", "info");

    } catch (error) {
      console.warn("Express backend /api/chat not fully reachable yet. Falling back to edge predictive reasoning.", error);
      
      // Smart offline fallback responses based on topics
      setTimeout(() => {
        let reply = "I analyzed the operational metadata. The current wind shear suggests stabilizing high infrastructure. Please select the Shelters tab to coordinate emergency backup fuel for SHL-401 or allocate Medical units to Sector 4 slums.";
        
        const lowerText = text.toLowerCase();
        if (lowerText.includes("sos") || lowerText.includes("9421")) {
          reply = "**URGENT AI ACTION PLAN FOR SOS-9421:**\n\n1. **Priority Allocation**: 8 persons stranded on warehouse crates with 11% phone battery. Run-off estimates show water level at 1.4m.\n2. **Recommendation**: Deploy **NDRF Flood Response Alpha** equipped with Ondoy Inflatable Boats from North Suburbs.\n3. **Tactical Action**: Tap 'Assign Team' in the SOS tab immediately. This sends GPS coordinates straight to the coxswain's tactical receiver.";
        } else if (lowerText.includes("st. xavier") || lowerText.includes("medical")) {
          reply = "**SHELTER BOTTLE-NECK ANALYSIS (SHL-401):**\n\n* **Status**: 980 / 1200 occupied. Beds remaining: 220.\n* **Critical Shortages**: Insulin, Anti-venom.\n* **Requisition Plan**: Dispatching **Disaster Trauma Care 3** standby units carrying advanced pharmaceuticals. Suggest authorizing a water tanker replenishment of 4500L.";
        } else if (lowerText.includes("alert") || lowerText.includes("broadcast") || lowerText.includes("wind")) {
          reply = "**EMERGENCY SMS WARNING GENERATED:**\n\n*Target: Coastal Transit & Islands operators*\n*Broadcast Copy*:\n`[DISASTERMIND AI EMERGENCY WARNING] Severe cyclone winds (>140km/h) active. Clear route 10A immediately. Evacuate low-level structures and move to Transit Station 4. Emergency call line active at 108.`\n\n*Would you like to broadcast this emergency alert to all logged devices? (Dispatchable from the Alerts & Warnings view)*";
        }

        const aiMsg: ChatMessage = {
          id: `ai-fallback-${Date.now()}`,
          sender: "assistant",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        // Update to actual generated reply
        aiMsg.text = reply;
        setMessages(prev => [...prev, aiMsg]);
        onAddLog("AI Engine", "Synthesized local predictive plan (offline mode).", "warning");
      }, 950);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant-container" className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              DisasterMind AI Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="font-mono text-[10px] text-slate-500">Gemini-2.5-Predictive-Neural Active</p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-400">
          Sync Status: LIVE
        </div>
      </div>

      {/* Messages */}
      <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className="font-mono text-[9px] text-slate-500 mb-1 flex items-center gap-1">
              {msg.sender === 'assistant' ? 'AI COMMAND HUB' : 'OPERATOR'} • {msg.timestamp}
            </div>
            <div
              className={`p-3 rounded-xl border font-sans text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-100'
                  : 'bg-slate-950/40 border-slate-800 text-slate-300'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col mr-auto max-w-[85%] items-start">
            <div className="font-mono text-[9px] text-slate-500 mb-1 animate-pulse">
              AI THINKING...
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 text-slate-400 rounded-xl flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-mono text-xs">Simulating GIS data correlations...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Chat Suggestion chips */}
      <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 bg-slate-950/20 border-t border-slate-800/30">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.text)}
            disabled={isLoading}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 font-sans text-[11px] text-slate-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(userInput);
            }}
            placeholder="Ask AI command assistant (e.g. recommendation for SOS-9421)..."
            className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg text-slate-200 text-xs placeholder:text-slate-600 font-sans tracking-wide transition-all"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-3 text-slate-600 flex items-center gap-1 select-none pointer-events-none">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </div>
        </div>
        <button
          onClick={() => handleSendMessage(userInput)}
          disabled={isLoading || !userInput.trim()}
          className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-sans text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
