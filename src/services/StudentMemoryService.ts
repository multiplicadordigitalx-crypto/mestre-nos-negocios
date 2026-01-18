import { StudentProfileWithLimits, LessonSegment } from '../types/MentorshipLogic';

export interface StudentInteraction {
    id: string;
    timestamp: number;
    type: 'question' | 'quiz_answer' | 'module_completion' | 'sentiment';
    content: string;
    context: string; // e.g., "Module 1 - Class 3"
    metadata?: any;
}

export interface StudentProfile {
    studentId: string;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
    goals: string[];
    weaknesses: string[];
    strengths: string[];
    lastInteraction: number;
}

// Mock Database Adapter - In production, replace with real MongoDB/Redis calls
const StorageAdapter = {
    get: (key: string) => {
        if (typeof window === 'undefined') return null;
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    set: (key: string, value: any) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Mock Data
const MOCK_PROFILE: StudentProfileWithLimits = {
    id: 'student_123',
    name: 'Estudante Demo',
    credits: {
        dailyConsultationLimit: 20,
        dailyAudioLimit: 5 // minutes
    },
    usage: {
        date: new Date().toISOString().split('T')[0],
        consultationsUsed: 0,
        audioMinutesGenerated: 0
    },
    progress: {
        currentLessonId: 'lesson_1',
        completedSegments: []
    }
};

const MOCK_SEGMENTS: LessonSegment[] = [
    { id: 'seg_1', startTime: 0, endTime: 60, isLocked: false }, // First minute free
    { id: 'seg_2', startTime: 60, endTime: 120, isLocked: true, challenge: { id: 'q1', question: 'Qual o conceito principal abordado?', answerKey: 'foco', difficulty: 'easy' } },
    { id: 'seg_3', startTime: 120, endTime: 180, isLocked: true, challenge: { id: 'q2', question: 'Como aplicar isso no seu negócio?', answerKey: 'acao', difficulty: 'medium' } }
];

export const StudentMemoryService = {
    /**
     * Saves a new interaction to the student's history.
     */
    async saveInteraction(studentId: string, interaction: Omit<StudentInteraction, 'id' | 'timestamp'>) {
        const key = `student_memory_${studentId}`;
        const history: StudentInteraction[] = StorageAdapter.get(key) || [];

        const newInteraction: StudentInteraction = {
            ...interaction,
            id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        history.push(newInteraction);

        // Keep only last 100 interactions for local storage limits
        if (history.length > 100) {
            history.shift();
        }

        StorageAdapter.set(key, history);
        return newInteraction;
    },

    /**
     * Retrieves the entire interaction history for context.
     */
    async getHistory(studentId: string): Promise<StudentInteraction[]> {
        return StorageAdapter.get(`student_memory_${studentId}`) || [];
    },

    /**
     * Updates or creates the student's high-level profile.
     */
    async updateProfile(studentId: string, updates: Partial<StudentProfile>) {
        const key = `student_profile_${studentId}`;
        const current = StorageAdapter.get(key) || {
            studentId,
            learningStyle: 'visual',
            goals: [],
            weaknesses: [],
            strengths: [],
            lastInteraction: 0
        };

        const updated = { ...current, ...updates, lastInteraction: Date.now() };
        StorageAdapter.set(key, updated);
        return updated;
    },

    /**
     * Gets the student's profile to personalize AI responses.
     */
    async getProfile(studentId: string): Promise<StudentProfile | null> {
        return StorageAdapter.get(`student_profile_${studentId}`);
    },

    // --- NEW LOGIC METHODS ---

    async getProfileWithLimits(studentId: string): Promise<StudentProfileWithLimits> {
        const key = `student_limits_${studentId}`;
        const stored = StorageAdapter.get(key);
        return stored || MOCK_PROFILE;
    },

    async checkCanGenerateAudio(studentId: string, durationSeconds: number): Promise<boolean> {
        const profile = await this.getProfileWithLimits(studentId);
        const durationMinutes = durationSeconds / 60;
        return (profile.usage.audioMinutesGenerated + durationMinutes) <= profile.credits.dailyAudioLimit;
    },

    async incrementAudioUsage(studentId: string, durationSeconds: number) {
        const key = `student_limits_${studentId}`;
        const profile = await this.getProfileWithLimits(studentId);
        profile.usage.audioMinutesGenerated += (durationSeconds / 60);
        StorageAdapter.set(key, profile);
    },

    async getLessonSegments(lessonId: string): Promise<LessonSegment[]> {
        return MOCK_SEGMENTS;
    },

    async unlockSegment(studentId: string, segmentId: string) {
        const key = `student_limits_${studentId}`;
        const profile = await this.getProfileWithLimits(studentId);
        if (!profile.progress.completedSegments.includes(segmentId)) {
            profile.progress.completedSegments.push(segmentId);
            StorageAdapter.set(key, profile);
        }
    }
};
