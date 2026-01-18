import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import { ArrowRight, LockClosed, Check } from '../components/Icons';

interface SolutionStepProps {
  onNextStep: () => void;
}

const benefits = [
  { question: "Produto do zero?", answer: "Já temos pronto e validado" },
  { question: "Precisa aparecer?", answer: "Não, use vídeos prontos" },
  { question: "Precisa investir?", answer: "Comece no orgânico (grátis)" },
  { question: "Tenho suporte?", answer: "Sim, grupo exclusivo VIP" },
];

const SolutionStep: React.FC<SolutionStepProps> = ({ onNextStep }) => {
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          A Máquina de Vendas Automática <span className="text-brand-primary">15X</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Veja como milhares de alunos estão faturando alto sem criar produtos.
        </p>
      </div>

      <VideoPlayer
        src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        onWatchCompleted={() => setVideoWatched(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
        {benefits.map((benefit, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="bg-green-500/20 p-2 rounded-full">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{benefit.question}</p>
              <p className="text-white font-bold">{benefit.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: videoWatched ? 1 : 0.5, y: 0 }}
        className="mt-10"
      >
        <Button
          onClick={onNextStep}
          disabled={!videoWatched}
          className="!px-10 !py-4 text-xl"
        >
          {videoWatched ? (
            <>
              Quero minha vaga agora
              <ArrowRight className="w-6 h-6 ml-2" />
            </>
          ) : (
            <>
              <LockClosed className="w-6 h-6 mr-2" />
              Termine de assistir para liberar
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SolutionStep;