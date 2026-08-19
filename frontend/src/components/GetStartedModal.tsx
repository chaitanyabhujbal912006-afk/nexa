import React, { useState } from 'react';
import { X, ArrowRight, Check, Lock } from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login' | 'demo';
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([
    'Google Workspace',
    'Microsoft 365',
    'Confluence',
  ]);

  if (!isOpen) return null;

  const connectors = [
    'Google Workspace',
    'Microsoft 365',
    'Slack & Teams',
    'Confluence',
    'Notion',
    'PostgreSQL / Snowflake',
  ];

  const toggleConnector = (name: string) => {
    if (selectedConnectors.includes(name)) {
      setSelectedConnectors(selectedConnectors.filter((c) => c !== name));
    } else {
      setSelectedConnectors([...selectedConnectors, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#262626] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#737373] hover:text-white p-2 border border-transparent hover:border-[#333] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-[#737373] font-medium font-sans mb-3">
              Access Protocol MMXXIV
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-white mb-2">
              {initialMode === 'login' ? 'Authenticate Session' : 'Request Sandbox Access'}
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] font-light leading-relaxed mb-8">
              Connect enterprise silos with isolated VPC boundaries and continuous temporal contradiction resolution.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] text-[#737373] font-sans mb-2">
                  Enterprise Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-[#121212] border border-[#262626] px-4 py-3.5 text-sm text-[#E5E5E5] focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {initialMode !== 'login' && (
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] text-[#737373] font-sans mb-3">
                    Ingress Data Connectors
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {connectors.map((c) => {
                      const isSelected = selectedConnectors.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleConnector(c)}
                          className={`text-xs px-3.5 py-2.5 border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white font-medium'
                              : 'bg-[#121212] border-[#262626] text-[#737373] hover:text-white hover:border-[#404040]'
                          }`}
                        >
                          <span className="truncate text-[11px]">{c}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="bg-white text-black border border-white hover:bg-[#E5E5E5] w-full py-4 text-[10px] uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{initialMode === 'login' ? 'Authorize via SSO' : 'Initialize Dedicated Cluster'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#525252] font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#737373]" /> Zero Data Retention
              </span>
              <span>SOC2 Type II</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="w-12 h-12 border border-white bg-white text-black flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif text-white">Cluster Initialized</h3>
            <p className="text-xs text-[#737373] font-light max-w-sm mx-auto leading-relaxed">
              Cryptographic keys and VPC endpoint credentials have been dispatched to <strong className="text-white font-normal">{email}</strong>.
            </p>
            <button
              onClick={onClose}
              className="border border-[#404040] bg-transparent text-[#D4D4D4] hover:bg-white hover:text-black hover:border-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer mt-4"
            >
              Enter Sandbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
