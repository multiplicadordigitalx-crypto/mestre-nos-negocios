import { useState, useEffect } from 'react';
import { StudentMemoryService } from '../services/StudentMemoryService';
import { LessonSegment } from '../types/MentorshipLogic';
import toast from 'react-hot-toast';

export const useLessonFlow = (studentId: string | undefined, lessonId: string, currentTime: number, onPauseRequest: () => void) => {
    const [segments, setSegments] = useState<LessonSegment[]>([]);
    const [currentSegment, setCurrentSegment] = useState<LessonSegment | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    // Load Segments
    useEffect(() => {
        const load = async () => {
            const segs = await StudentMemoryService.getLessonSegments(lessonId);
            setSegments(segs);
        };
        load();
    }, [lessonId]);

    // Check Logic on Time Update
    useEffect(() => {
        if (!studentId || segments.length === 0) return;

        // Find which segment we are in or approaching
        // We look for a segment that starts "soon" or one we are currently inside of
        const activeSegment = segments.find(s => currentTime >= s.startTime && currentTime < s.endTime);

        if (activeSegment) {
            setCurrentSegment(activeSegment);
            // In a real app, we check if this specific segment is unlocked in the user's profile
            // For this mock, we use the isLocked property of the segment definition itself + local logic

            // Logic: If current time is nearing the END of the segment (e.g. within 2 seconds) 
            // AND it's locked, we force a pause and trigger the "Gate".
            if (activeSegment.isLocked && currentTime >= (activeSegment.endTime - 2)) {
                if (!isLocked) {
                    setIsLocked(true);
                    onPauseRequest();
                    toast('⏸️ Pausa para Reflexão: Responda ao Quiz!', { icon: '🔐' });
                }
            }
        }
    }, [currentTime, segments, studentId]);

    const unlockCurrentSegment = async () => {
        if (studentId && currentSegment) {
            await StudentMemoryService.unlockSegment(studentId, currentSegment.id);
            setIsLocked(false);
            // Update local state to reflect unlocking
            setSegments(prev => prev.map(s => s.id === currentSegment.id ? { ...s, isLocked: false } : s));
            toast.success('Módulo Liberado! Continuando...', { icon: '🔓' });
        }
    };

    return {
        segments,
        currentSegment,
        isLocked,
        unlockCurrentSegment
    };
};
