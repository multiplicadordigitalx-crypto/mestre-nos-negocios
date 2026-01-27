
import { useState, useEffect } from 'react';
import { courseService, productService } from '../services/courseService';
import { schoolService } from '../services/schoolService';
import { useAuth } from './useAuth';
import { AppProduct, Course } from '../types/Course';
import { SchoolConfig } from '../types/School';
import toast from 'react-hot-toast';

// --- HOOK: Managing Schools (Producer Side) ---
export const useSchoolManagement = () => {
    const { user } = useAuth();
    const [school, setSchool] = useState<SchoolConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const load = async () => {
            try {
                const data = await schoolService.getSchoolByOwner(user.uid);
                setSchool(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const saveSettings = async (settings: Partial<SchoolConfig>) => {
        if (!user?.uid) return;
        await schoolService.createOrUpdateSchool({ ...settings, ownerId: user.uid });
        // Reload
        const data = await schoolService.getSchoolByOwner(user.uid);
        setSchool(data);
        toast.success("Escola atualizada!");
    };

    return { school, loading, saveSettings };
};

// --- HOOK: Managing Products (Producer Side) ---
export const useProducerProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        if (!user?.uid) return;
        try {
            setLoading(true);
            const data = await productService.listProducts(user.uid);
            setProducts(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [user]);

    return { products, loading, refresh };
};

// --- HOOK: Course Player (Student Side) ---
export const useCoursePlayer = (courseId: string) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;
        const load = async () => {
            try {
                setLoading(true);
                const { course: c, modules: m } = await courseService.getCourseStructure(courseId);
                setCourse(c);
                setModules(m);
            } catch (error) {
                toast.error("Erro ao carregar curso");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    return { course, modules, loading };
};
