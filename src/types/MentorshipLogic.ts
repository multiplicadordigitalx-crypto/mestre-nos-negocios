export interface StudentProfileWithLimits {
    id: string;
    name: string;
    credits: {
        dailyConsultationLimit: number;
        dailyAudioLimit: number;
    };
    usage: {
        date: string;
        consultationsUsed: number;
        audioMinutesGenerated: number;
    };
    progress: {
        currentLessonId: string;
        completedSegments: string[];
    };
}

export interface LessonSegment {
    id: string;
    startTime: number;
    endTime: number; // in seconds
    isLocked: boolean;
    challenge?: {
        id: string;
        question: string;
        answerKey: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
}
