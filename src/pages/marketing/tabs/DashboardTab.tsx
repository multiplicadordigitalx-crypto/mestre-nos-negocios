
import React from 'react';
import { NexusAutonomousSystem } from '../components/NexusAutonomousSystem';
import { EcosystemDashboard2026 } from '../components/EcosystemDashboard2026';

export const DashboardTab: React.FC = () => {
    return (
        <div>
            <NexusAutonomousSystem />
            <EcosystemDashboard2026 />
        </div>
    );
};
