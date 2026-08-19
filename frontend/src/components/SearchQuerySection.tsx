import React, { useState } from 'react';
import { Search, Mic, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SearchQuerySectionProps {
  onRunQuery: (query: string) => void;
  activeQuery: string;
}

export const SearchQuerySection: React.FC<SearchQuerySectionProps> = ({
  onRunQuery,
  activeQuery,
}) => {
  const [inputValue, setInputValue] = useState(activeQuery || '');
  const [isListening, setIsListening] = useState(false);

  const samplePrompts = [
    'What is our current refund policy?',
    'Which warranty terms apply to Enterprise clients?',
    'What is our sabbatical leave policy?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onRunQuery(inputValue.trim());
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    onRunQuery(prompt);
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      const phrase = 'What is our current enterprise refund policy?';
      let i = 0;
      setInputValue('');
      const interval = setInterval(() => {
        if (i < phrase.length) {
          setInputValue(phrase.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsListening(false);
          onRunQuery(phrase);
        }
      }, 35);
    } else {
      setIsListening(false);
    }
  };

  return (
    <section id="search-hub" className="max-w-4xl mx-auto w-full pt-4">
      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#121212] border border-[#262626] p-2 sm:p-3 flex items-center gap-3 transition-all duration-300 focus-within:border-white shadow-2xl relative"
      >
        <div className="pl-3 sm:pl-4 text-[#737373] flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          id="enterprise-query-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Query the enterprise knowledge corpus in natural language..."
          className="bg-transparent border-none text-[#E5E5E5] text-sm sm:text-base w-full focus:outline-none focus:ring-0 placeholder:text-[#525252] font-light px-2 py-1"
        />

        {inputValue && (
          <button
            type="submit"
            className="hidden sm:flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-black bg-white hover:bg-[#D4D4D4] px-4 py-2 transition-all cursor-pointer font-medium"
          >
            <span>Execute</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleMic}
          className={`p-2.5 transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isListening
              ? 'bg-white text-black animate-pulse'
              : 'border border-[#333] text-[#737373] hover:text-white hover:border-[#666]'
          }`}
          title={isListening ? 'Listening...' : 'Voice Query'}
        >
          <Mic className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested Try Prompts */}
      <div className="flex gap-2 sm:gap-3 mt-6 justify-center items-center flex-wrap">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#525252] font-medium font-sans">
          Index Prompts:
        </span>
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            className={`text-[10px] uppercase tracking-[0.15em] font-light px-4 py-1.5 transition-all duration-200 cursor-pointer ${
              inputValue === prompt || activeQuery === prompt
                ? 'text-white border border-white bg-[#171717]'
                : 'text-[#737373] border border-[#262626] bg-[#0A0A0A] hover:text-white hover:border-[#404040]'
            }`}
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
