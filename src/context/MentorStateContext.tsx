
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NexusToolId } from '@/services/ToolRegistry';

interface MentorMission {
    id: string;
    label: string; // "Draft Contract"
    toolId: NexusToolId;
    status: 'pending' | 'completed';
    returnTimestamp: number; // The second in the video to return to
    lessonId: string;
    context: string; // AI Context for the mission
}

interface MentorStateContextType {
    activeMission: MentorMission | null;
    startMission: (mission: MentorMission) => void;
    completeMission: () => void;
    clearMission: () => void;
    isWidgetOpen: boolean;
    toggleWidget: () => void;
}

const MentorStateContext = createContext<MentorStateContextType | undefined>(undefined);

export const MentorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeMission, setActiveMission] = useState<MentorMission | null>(null);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);

    const startMission = (mission: MentorMission) => {
        setActiveMission(mission);
        setIsWidgetOpen(true);
    };

    const completeMission = () => {
        if (activeMission) {
            setActiveMission({ ...activeMission, status: 'completed' });
        }
    };

    const clearMission = () => {
        setActiveMission(null);
        setIsWidgetOpen(false);
    };

    const toggleWidget = () => setIsWidgetOpen(prev => !prev);

    return (
        <MentorStateContext.Provider value={{
            activeMission,
            startMission,
            completeMission,
            clearMission,
            isWidgetOpen,
            toggleWidget
        }}>
            {children}
        </MentorStateContext.Provider>
    );
};

export const useMentorState = () => {
    const context = useContext(MentorStateContext);
    if (!context) {
        throw new Error('useMentorState must be used within a MentorProvider');
    }
    return context;
};
