import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import { ArrowRight, LockClosed } from '../components/Icons';

interface TriageStepProps {
  onNextStep: () => void;
}

const TriageStep: React.FC<TriageStepProps> = ({ onNextStep }) => {
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="w-full flex flex-col items-center text-center"
    >
      <h1 className="text-4xl md:text-6xl font-black text-white max-w-4xl leading-tight">
        Você já tentou ganhar dinheiro na internet e só <span className="text-brand-primary">tomou na cabeça?</span>
      </h1>
      <p className="text-gray-400 mt-4 mb-10 text-lg">Assista o vídeo abaixo para entender o porquê.</p>

      <VideoPlayer
        src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        onWatchCompleted={() => setVideoWatched(true)}
      />

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <Button
          onClick={onNextStep}
          disabled={!videoWatched}
          className="mt-10 !px-10 !py-4 text-xl"
        >
          {videoWatched ? (
            <>
              Quero ver a solução
              <ArrowRight className="w-6 h-6 ml-2" />
            </>
          ) : (
            <>
              <LockClosed className="w-6 h-6 mr-2" />
              Assista ao vídeo para liberar
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TriageStep;