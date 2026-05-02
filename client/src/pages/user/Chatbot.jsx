import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! I'm your ResumeAI Career Assistant. I have analyzed your profile and I'm ready to help you with resume optimization, salary negotiations, or interview prep. What's on your mind?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 1)
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await aiAPI.chatWithBot({
        message: userMessage.content,
        history: history
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data?.data?.response || response.data?.response || 'I apologize, but I couldn\'t generate a response right now. Please try again.',
        timestamp: new Date(),
        suggestions: response.data?.data?.suggestions || response.data?.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err.response?.data?.message || 'I\'m having trouble connecting to my brain right now. Please make sure the AI API keys are configured in the .env file.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const quickQuestions = [
    'How do I improve my resume?',
    'What salary should I expect?',
    'Mock interview for my role',
    'Skills I should learn next'
  ];

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ResumeAI Assistant</h1>
            <p className="text-slate-500 text-sm">Powered by Advanced Career Intelligence</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 flex flex-col h-[70vh]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  message.role === 'user' ? 'bg-slate-800 text-white' : 'bg-cyan-500 text-white'
                }`}>
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>
                
                <div className="space-y-2">
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-none'
                      : 'bg-gradient-to-br from-cyan-50 to-blue-50 text-slate-900 border border-cyan-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap text-base leading-relaxed font-medium">{message.content}</p>
                  </div>
                  <p className={`text-[10px] uppercase tracking-widest font-bold opacity-40 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {message.suggestions.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => setInput(s)}
                          className="text-xs bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full border border-cyan-100 hover:bg-cyan-100 transition-colors font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white animate-pulse">
                  AI
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">AI is thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 bg-white border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-xs bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:border-cyan-300 hover:text-cyan-600 transition-all font-medium"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career..."
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-cyan-500 hover:bg-cyan-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-cyan-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-tighter font-bold">
            ResumeAI can make mistakes. Verify important career information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
