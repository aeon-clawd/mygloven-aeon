import React, { useState, useRef, useEffect } from 'react';

interface Source {
  name: string;
  type: string;
  slug: string;
  city: string;
  image: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
}

const API_URL = 'https://mygloven-api.aeoninfinitive.com/api/chat';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Hola! Soy **my\'G**, tu nuevo ayudante de producción. Pregúntame por venues, artistas, proveedores o cualquier cosa que necesites para tu próximo evento 🎵' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.answer, 
        sources: data.sources 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Error de conexión. Inténtalo de nuevo.' 
      }]);
    }
    setLoading(false);
  };

  // Simple markdown bold
  const renderText = (text: string) => {
    return text.split('**').map((part, i) => 
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#e4665c] hover:bg-[#d86259] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Abrir chat"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{height: '520px'}}>
      {/* Header */}
      <div className="bg-[#1a1a2a] px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e4665c] rounded-full flex items-center justify-center text-white text-xs font-black">G</div>
          <div>
            <p className="text-white font-bold text-sm">my'G Assistant</p>
            <p className="text-gray-400 text-[10px]">Powered by IA</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#e4665c] text-white rounded-br-md' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
              }`}>
                {renderText(msg.text)}
              </div>
            </div>
            {/* Source cards */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 pl-1">
                {msg.sources.map((src, j) => (
                  <a key={j} href={`/${src.type === 'artist' ? 'artist' : 'venue'}/${src.slug}`}
                    className="flex-shrink-0 w-24 bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all block">
                    {src.image && <img src={src.image} alt="" className="w-full h-16 object-cover" />}
                    <div className="p-1.5">
                      <p className="text-[10px] font-bold text-[#1a1a2a] leading-tight line-clamp-2">{src.name}</p>
                      {src.city && <p className="text-[8px] text-gray-400 mt-0.5">{src.city}</p>}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Busca venues, artistas, ciudades..."
            className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#e4665c] text-[#1a1a2a] placeholder:text-gray-400"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[#e4665c] hover:bg-[#d86259] disabled:opacity-40 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
