import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { StudentPage } from '../types';
import DailyCheckinModal from '../components/DailyCheckinModal';
import LevelDetailModal from '../components/LevelDetailModal';
import { Student } from '../types';
import { submitDailyProductStats } from '../services/mockFirebase';
import CampaignBanner from '../components/CampaignBanner';

// Import New Components
import { DashboardHeader } from './dashboard/components/DashboardHeader';
import { RenewalBanner } from './dashboard/components/RenewalBanner';
import { LaunchpadGrid } from './dashboard/components/LaunchpadGrid';
import { ActiveProductsList } from './dashboard/components/ActiveProductsList';

interface DashboardPageProps {
  navigateTo: (page: StudentPage) => void;
  onOpenRenewal: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ navigateTo, onOpenRenewal }) => {
  const { user } = useAuth();
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  const student = user as Student;

  const handleDailySubmit = async (count: number, product: string) => {
      if (!user) return;
      await submitDailyProductStats(user.uid, product, count);
      toast.success("Produção registrada com sucesso!");
  };

  const { daysRemaining, isRenewPeriod } = useMemo(() => {
      if (!user?.purchaseDate) return { daysRemaining: 365, isRenewPeriod: false };
      
      const purchaseDate = new Date(user.purchaseDate);
      const now = new Date();
      const diffTime = now.getTime() - purchaseDate.getTime();
      const daysSincePurchase = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const validityDays = 365;
      const remaining = validityDays - daysSincePurchase;
      
      return {
          daysRemaining: remaining,
          isRenewPeriod: remaining <= 30
      };
  }, [user]);

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-100px)]">
        <DashboardHeader 
            user={student} 
            navigateTo={navigateTo} 
            onCheckIn={() => setIsCheckinOpen(true)}
            onOpenLevel={() => setIsLevelModalOpen(true)}
        />

        {user && <CampaignBanner user={user} />}

        {isRenewPeriod && (
            <RenewalBanner daysRemaining={daysRemaining} onOpenRenewal={onOpenRenewal} />
        )}

        <LaunchpadGrid 
            user={student}
            navigateTo={navigateTo}
            onCheckIn={() => setIsCheckinOpen(true)}
            onOpenLevel={() => setIsLevelModalOpen(true)}
        />

        <ActiveProductsList student={student} navigateTo={navigateTo} />

        <DailyCheckinModal 
            isOpen={isCheckinOpen} 
            onClose={() => setIsCheckinOpen(false)} 
            onSubmit={handleDailySubmit} 
        />
        
        {student && (
            <LevelDetailModal 
                isOpen={isLevelModalOpen}
                onClose={() => setIsLevelModalOpen(false)}
                student={student}
                onRegisterClick={() => {
                    setIsLevelModalOpen(false);
                    setIsCheckinOpen(true);
                }}
            />
        )}
    </div>
  );
};

export default DashboardPage;