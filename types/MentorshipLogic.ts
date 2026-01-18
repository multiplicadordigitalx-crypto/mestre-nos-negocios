export interface QuizChallenge {
    id: string;
    question: string;
    answerKey: string; // In real app, this would be validated by AI, not simple string match
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface LessonSegment {
    id: string;
    startTime: number;
    endTime: number;
    isLocked: boolean;
    challenge?: QuizChallenge;
}

export interface DailyUsage {
    date: string; // YYYY-MM-DD
    consultationsUsed: number; // AI Chat interactions
    audioMinutesGenerated: number; // ElevenLabs usage
}

export interface StudentProfileWithLimits {
    id: string;
    name: string;
    credits: {
        dailyConsultationLimit: number; // e.g., 50 messages
        dailyAudioLimit: number; // e.g., 10 minutes
    };
    usage: DailyUsage;
    progress: {
        currentLessonId: string;
        completedSegments: string[]; // IDs of completed segments
    };
}
