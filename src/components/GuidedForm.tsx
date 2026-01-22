import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { ArrowLeft, Zap } from './Icons';
import { getToolCosts } from '../services/mockFirebase';

interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  default?: string;
  options?: string[];
}

interface GuidedFormProps {
  title: string;
  emoji: string;
  description?: string;
  videoUrl?: string; // Optional instructional video
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
  loading: boolean;
  creditCost: number;
  toolId?: string; // Optional: for dynamic cost lookup
}

const GuidedForm: React.FC<GuidedFormProps> = ({
  title,
  emoji,
  description,
  videoUrl,
  questions,
  onComplete,
  onBack,
  loading,
  creditCost,
  toolId
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dynamicCost, setDynamicCost] = useState<number>(creditCost);

  // Fetch dynamic cost from admin settings if toolId is provided
  useEffect(() => {
    const fetchCost = async () => {
      if (!toolId) return;
      try {
        const tools = await getToolCosts();
        const tool = tools.find(t => t.toolId === toolId);
        if (tool && tool.costPerTask > 0) {
          setDynamicCost(tool.costPerTask);
        }
      } catch (error) {
        console.warn('Failed to fetch dynamic cost, using default:', error);
      }
    };
    fetchCost();
  }, [toolId]);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    onComplete(answers);
  };

  const isFormValid = questions.every(q => !q.required || (answers[q.id] && answers[q.id].trim() !== ''));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-gray-900 rounded-3xl border border-gray-700 p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{emoji}</span>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{title}</h1>
          </div>
          {description && <p className="text-gray-400 mb-6">{description}</p>}

          {videoUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-gray-700 bg-black aspect-video relative group shadow-lg">
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-8">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="text-lg font-bold text-gray-200 block mb-3">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>

                {q.type === 'textarea' ? (
                  <textarea
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-y min-h-[120px]"
                    rows={4}
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                ) : q.type === 'select' ? (
                  <select
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all appearance-none cursor-pointer"
                    value={answers[q.id] || q.default || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">Selecione uma opção</option>
                    {q.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <Button
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className={`w-full !py-6 !text-xl !rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.01] transition-transform ${isFormValid ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              isLoading={loading}
            >
              {loading ? (
                'Mestre IA trabalhando...'
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Zap className="w-6 h-6" />
                  FAZER POR MIM AGORA
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuidedForm;