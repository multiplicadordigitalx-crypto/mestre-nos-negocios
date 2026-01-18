import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TriageStep from '../funnel/TriageStep';
import SolutionStep from '../funnel/SolutionStep';
import CheckoutStep from '../funnel/CheckoutStep';

const FunnelPage: React.FC = () => {
  const [step, setStep] = useState(1);

  const backgroundVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-secondary p-4 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="bg1"
            className="absolute inset-0 bg-grid-pattern z-0"
            variants={backgroundVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
        {step > 1 && (
          <motion.div
            key="bg2"
            className="absolute inset-0 bg-dots-pattern z-0"
            variants={backgroundVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 1 && <TriageStep key="step1" onNextStep={() => setStep(2)} />}
          {step === 2 && <SolutionStep key="step2" onNextStep={() => setStep(3)} />}
          {step === 3 && <CheckoutStep key="step3" />}
        </AnimatePresence>
      </div>
      <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(250, 204, 21, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250, 204, 21, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .bg-dots-pattern {
            background-image: radial-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 0);
            background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
};

export default FunnelPage;