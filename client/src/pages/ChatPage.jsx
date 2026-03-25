import React, { useState, useRef, useEffect } from 'react';
import { submitEstimation } from '../utils/api';
import './ChatPage.css';

const QUICK_QUESTIONS = [
  'What is the best rice variety for Tamil Nadu?',
  'When should I transplant Kharif rice?',
  'How do I improve my NDVI score?',
  'Which government schemes am I eligible for?',
  'What fertilizer dose for IR64 variety?',
  'How to manage brown planthopper?',
];

const BOT_KNOWLEDGE = {
  keywords: {
    variety: {
      patterns: ['variety', 'which rice', 'best rice', 'recommend variety'],
      response: `🌾 **Best Rice Varieties by Region:**\n\n• **Tamil Nadu**: Samba Mahsuri, ADT 43, IR64 for irrigated areas\n• **Punjab/Haryana**: Pusa Basmati 1121, HKR-47\n• **West Bengal**: Swarna Sub-1, MTU-7029\n• **Andhra/Telangana**: BPT-5204 (Sona Masuri), NLR-34449\n• **Bihar/UP**: Rajendra Mahsuri, Swarna\n\n💡 Tip: Choose varieties registered for your district at your state agriculture department for maximum subsidy eligibility.`
    },
    fertilizer: {
      patterns: ['fertilizer', 'npk', 'urea', 'nitrogen', 'dap', 'nutrient'],
      response: `🧪 **Standard Fertilizer Recommendation for Rice:**\n\n**High-Yield Irrigated (e.g. IR64):**\n• Basal: DAP 50 kg/ha + MOP 30 kg/ha\n• Tillering (21 DAT): Urea 55 kg/ha\n• Panicle Initiation (45 DAT): Urea 55 kg/ha\n\n**Total NPK:** 120:60:40 kg/ha\n\n⚠️ Always do soil testing first. Over-application of N increases lodging risk and cost.\n\n📞 Contact KVK: 1800-180-1551 for district-specific recommendations.`
    },
    pest: {
      patterns: ['pest', 'insect', 'disease', 'blast', 'borer', 'planthopper', 'bph'],
      response: `🐛 **Common Rice Pests & Management:**\n\n**Brown Planthopper (BPH):**\n• Spray Buprofezin 25 SC @ 1.5 ml/L\n• Drain field for 5–7 days\n• Avoid excess N fertilization\n\n**Stem Borer:**\n• Apply Chlorpyrifos 2.5% G @ 25 kg/ha\n• Install pheromone traps (5/ha)\n\n**Blast Disease:**\n• Spray Tricyclazole 75 WP @ 0.6 g/L\n• Use resistant varieties (Swarna Sub-1)\n• Avoid excess N\n\n💡 IPM approach always preferred over chemical control.`
    },
    transplant: {
      patterns: ['transplant', 'planting', 'seedling', 'nursery', 'sow'],
      response: `🌱 **Transplanting Guide:**\n\n**Kharif Season:**\n• Nursery sowing: 1st–3rd week of June\n• Transplanting: 1st–2nd week of July (21-day seedlings)\n• Spacing: 20×15 cm for high-yielding varieties\n\n**Rabi Season:**\n• Nursery: November\n• Transplanting: December (25-day seedlings)\n• Spacing: 20×20 cm\n\n**Key Tips:**\n• Use 2–3 seedlings per hill\n• Transplant at 2–3 cm depth\n• Maintain 2–5 cm water after transplanting\n\n📅 Check our Crop Calendar page for detailed month-wise schedule!`
    },
    scheme: {
      patterns: ['scheme', 'subsidy', 'pm-kisan', 'pmfby', 'insurance', 'benefit', 'government'],
      response: `🏛️ **Key Government Schemes for Rice Farmers:**\n\n**PM-KISAN:**\n• ₹6,000/year in 3 installments\n• All land-holding farmer families\n• Register at pmkisan.gov.in\n\n**PMFBY (Crop Insurance):**\n• Premium: Only 2% for Kharif, 1.5% for Rabi\n• Covers: Pest, disease, natural calamity\n• Apply through CSC or bank\n\n**Kisan Credit Card:**\n• Credit up to ₹3 lakh at 4% interest\n• Apply at any cooperative/commercial bank\n\n**NFSM-Rice:**\n• Free certified seeds, equipment subsidy\n• Training programmes\n\n💡 Check the Schemes page for full eligibility details!`
    },
    ndvi: {
      patterns: ['ndvi', 'canopy', 'vegetation index', 'crop health'],
      response: `📡 **Understanding NDVI for Rice:**\n\n**NDVI Scale:**\n• 0.2–0.4: Poor/Sparse canopy — check for nutrient deficiency or pest damage\n• 0.4–0.6: Moderate — apply foliar micronutrients\n• 0.6–0.8: Good — maintain current practices\n• 0.8–0.95: Excellent — optimal crop growth\n\n**How to improve NDVI:**\n1. Apply recommended N fertilizer in split doses\n2. Control weeds (they reduce crop NDVI)\n3. Manage water properly\n4. Treat pest and disease early\n\n🛰️ Free NDVI data available on: Bhuvan ISRO portal, Sentinel-2 (ESA), or through your local ATMA/KVK.`
    },
    water: {
      patterns: ['water', 'irrigation', 'awd', 'drought', 'flood', 'drainage'],
      response: `💧 **Water Management in Rice:**\n\n**Alternate Wetting & Drying (AWD):**\n• Saves 30% water with same or better yield\n• Install PVC pipe (30 cm) as water gauge\n• Re-irrigate when water falls 15 cm below surface\n• NOT recommended during flowering\n\n**Critical Water Periods:**\n• Transplanting: 2–5 cm standing water\n• Tillering: Allow soil to crack slightly (AWD)\n• Flowering: Maintain 2–3 cm water (critical!)\n• Grain filling: AWD or shallow water\n• 2 weeks before harvest: Drain completely\n\n💡 AWD can reduce methane emissions and qualify for carbon credits!`
    },
    yield: {
      patterns: ['yield', 'production', 'improve yield', 'increase yield'],
      response: `📈 **How to Increase Rice Yield:**\n\n**Top 5 Yield-Boosting Practices:**\n1. **Right variety**: Use certified seeds of high-yielding varieties\n2. **Optimal planting**: Correct spacing + age of seedlings\n3. **Balanced NPK**: Do soil test, apply recommended doses\n4. **Timely pest control**: Prevent 10–30% yield losses\n5. **Water management**: AWD saves water + can boost yield\n\n**Advanced techniques:**\n• System of Rice Intensification (SRI): 20–50% yield gain reported\n• Direct seeded rice (DSR): Saves labour + water\n• Precision agriculture: Use our Estimator tool!\n\n⚡ Run the AI Estimator on our homepage to get your personalized yield prediction!`
    }
  },
  default: `🤔 I don't have a specific answer for that query. Here are some helpful resources:\n\n• **Kisan Call Center**: 1800-180-1551 (Toll Free, 6 AM–10 PM)\n• **ICAR Website**: icar.org.in\n• **eNAM Portal**: enam.gov.in\n• **PM-KISAN**: pmkisan.gov.in\n\nYou can also try asking about: varieties, fertilizers, pests, irrigation, government schemes, or NDVI.`
};

function getBotResponse(message) {
  const lower = message.toLowerCase();
  for (const [, data] of Object.entries(BOT_KNOWLEDGE.keywords)) {
    if (data.patterns.some(p => lower.includes(p))) {
      return data.response;
    }
  }
  return BOT_KNOWLEDGE.default;
}

function formatMessage(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} className="msg-heading">{line.replace(/\*\*/g, '')}</div>;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <div key={i} className={line.startsWith('•') || line.startsWith('-') ? 'msg-bullet' : 'msg-line'}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
      </div>
    );
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: `🌾 **Namaste! I'm RiceYield AI Assistant.**\n\nI can help you with:\n• Rice variety recommendations\n• Fertilizer & nutrient management\n• Pest & disease control\n• Government schemes & subsidies\n• Irrigation & water management\n• Crop calendar guidance\n\nAsk me anything about rice farming!`,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const response = getBotResponse(msg);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response, time: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
    inputRef.current?.focus();
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header card fade-up">
          <div className="chat-bot-avatar">🌾</div>
          <div>
            <h1>RiceYield AI Assistant</h1>
            <p><span className="status-dot" />Online · Powered by Agricultural Knowledge Base</p>
          </div>
        </div>

        <div className="chat-quick-qs fade-up">
          <div className="quick-label">Quick Questions:</div>
          <div className="quick-chips">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} className="quick-chip" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
        </div>

        <div className="chat-messages card fade-up">
          {messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.role}`}>
              {m.role === 'bot' && <div className="msg-avatar">🌾</div>}
              <div className="msg-bubble">
                <div className="msg-content">{formatMessage(m.text)}</div>
                <div className="msg-time">{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {m.role === 'user' && <div className="msg-avatar user-av">👤</div>}
            </div>
          ))}
          {typing && (
            <div className="chat-msg bot">
              <div className="msg-avatar">🌾</div>
              <div className="msg-bubble typing-bubble">
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area card fade-up">
          <textarea
            ref={inputRef}
            rows={1}
            className="chat-input"
            placeholder="Ask about rice farming, varieties, pests, schemes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="btn btn-primary chat-send" onClick={() => sendMessage()} disabled={!input.trim() || typing}>
            {typing ? <span className="spinner" /> : '➤'}
          </button>
        </div>

        <div className="chat-disclaimer fade-up">
          ℹ️ This AI assistant provides general agricultural guidance. For critical decisions, consult your local KVK or agricultural officer. Helpline: <strong>1800-180-1551</strong>
        </div>
      </div>
    </div>
  );
}
