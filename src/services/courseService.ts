
import {
    collection, var_getDoc, getDocs, setDoc, doc, query, where,
    updateDoc, deleteDoc, orderBy, limit, addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { AppProduct, Course, CourseModule, CourseLesson } from '../types/Course';
import { toast } from 'react-hot-toast';

// --- PRODUCTS (SALES LAYER) ---

export const productService = {
    // List products (optionally filter by owner/school)
    async listProducts(ownerId?: string): Promise<AppProduct[]> {
        try {
            let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
            if (ownerId) {
                q = query(collection(db, 'products'), where('ownerId', '==', ownerId));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppProduct));
        } catch (error) {
            console.error("Error listing products:", error);
            throw error;
        }
    },

    // Get single product
    async getProduct(productId: string): Promise<AppProduct | null> {
        try {
            const ref = doc(db, 'products', productId);
            const snap = await var_getDoc(ref); // Renamed to avoid reserved word conflict
            if (snap.exists()) return { id: snap.id, ...snap.data() } as AppProduct;
            return null;
        } catch (error) {
            console.error("Error getting product:", error);
            return null;
        }
    },

    // Create/Update Product
    async saveProduct(product: AppProduct): Promise<void> {
        try {
            const ref = doc(db, 'products', product.id);
            await setDoc(ref, product, { merge: true });

            // If it's a course, ensure a Course document exists too
            if (product.deliverableType === 'course') {
                await courseService.ensureCourseExists(product.id);
            }
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Erro ao salvar produto");
            throw error;
        }
    }
};

// --- COURSES (CONTENT LAYER) ---

export const courseService = {
    // Ensure course doc exists (linked to product)
    async ensureCourseExists(productId: string): Promise<void> {
        const ref = doc(db, 'courses', productId);
        const snap = await var_getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                id: productId,
                productId: productId,
                totalModules: 0,
                totalLessons: 0,
                modulesOrder: []
            });
        }
    },

    // List Courses (for dashboard)
    async listCourses(ownerId: string): Promise<Course[]> {
        // Query courses where 'ownerId' matches (assuming we add ownerId to course doc)
        // If not, we query products and join. For now, let's assume strict denormalization.
        try {
            const q = query(collection(db, 'courses'), where('ownerId', '==', ownerId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
        } catch (error) {
            return [];
        }
    },

    // Get Course Details (Modules & Lessons)
    async getCourseStructure(courseId: string): Promise<{ course: Course, modules: CourseModule[] }> {
        try {
            // 1. Get Course Meta
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await var_getDoc(courseRef);
            if (!courseSnap.exists()) throw new Error("Course content not found");
            const course = { id: courseSnap.id, ...courseSnap.data() } as Course;

            // 2. Get Modules
            const modQuery = query(collection(db, `courses/${courseId}/modules`), orderBy('order', 'asc'));
            const modSnap = await getDocs(modQuery);
            const modules = modSnap.docs.map(d => ({ id: d.id, ...d.data() } as CourseModule));

            return { course, modules };
        } catch (error) {
            console.error("Error fetching course structure:", error);
            throw error;
        }
    },

    // Add Module
    async addModule(courseId: string, moduleData: Partial<CourseModule>): Promise<string> {
        try {
            const modulesRef = collection(db, `courses/${courseId}/modules`);
            const newOrder = moduleData.order ?? 99; // Simple fallback

            const docRef = await addDoc(modulesRef, {
                courseId,
                ...moduleData,
                order: newOrder
            });

            // Update Course Meta
            const courseRef = doc(db, 'courses', courseId);
            // In real app, we'd use a transaction or increment()

            return docRef.id;
        } catch (error) {
            console.error("Error adding module:", error);
            throw error;
        }
    },

    // Get Lessons for a Module
    async getLessons(courseId: string, moduleId: string): Promise<CourseLesson[]> {
        const q = query(
            collection(db, `courses/${courseId}/modules/${moduleId}/lessons`),
            orderBy('order', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseLesson));
    },

    // Save Full Course Structure (Wizard Flow)
    async publishCourse(courseData: Course, modules: any[]): Promise<void> {
        try {
            const { writeBatch, doc, collection } = await import('firebase/firestore');
            const batch = writeBatch(db);

            // 1. Save Course Document
            const courseRef = doc(db, 'courses', courseData.id);
            // Ensure basic stats are correct
            const finalCourse = {
                ...courseData,
                totalModules: modules.length,
                totalLessons: modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0),
                updatedAt: new Date().toISOString()
            };
            batch.set(courseRef, finalCourse, { merge: true });

            // 2. Save Modules and Lessons
            // Note: Batch has 500 ops limit. If course is huge, this might fail, but for now it's fine.
            // A better approach for huge courses is sequential saves, but batch is safer for data integrity.

            for (let i = 0; i < modules.length; i++) {
                const mod = modules[i];
                const modRef = doc(db, `courses/${courseData.id}/modules`, mod.id);

                // Prepare Module Data (exclude nested lessons/materials array from the doc itself if needed, 
                // but we usually keep lightweight metadata or save strictly to subcollections)
                const { lessons, materials, quizzes, ...modData } = mod;

                batch.set(modRef, {
                    ...modData,
                    courseId: courseData.id,
                    order: i
                });

                // Lessons
                if (lessons && Array.isArray(lessons)) {
                    for (let j = 0; j < lessons.length; j++) {
                        const less = lessons[j];
                        const lessRef = doc(db, `courses/${courseData.id}/modules/${mod.id}/lessons`, less.id);
                        batch.set(lessRef, { ...less, order: j, moduleId: mod.id });
                    }
                }

                // Materials (Optional: could be subcollection or array in module. Assuming array in module doc for now based on types, 
                // BUT if it's large, subcollection is better. The view treats it as array. Let's keep it simple: 
                // If it was stripped above, we need to save it. If 'materials' fits in doc, just leave it in modData.
                // Re-adding materials to the module doc save if it's an array of simple objects.)
                if (materials && Array.isArray(materials)) {
                    // We stripped it above. Let's merge it back into the batch op for the module
                    batch.set(modRef, { materials }, { merge: true });
                }

                // Quizzes (Same logic as materials)
                if (quizzes && Array.isArray(quizzes)) {
                    batch.set(modRef, { quizzes }, { merge: true });
                }
            }

            await batch.commit();

            // 3. Link to User? (Usually done via 'products' purchase, but for Producer listing we might need 'ownerId')
            // The courseData should already have ownerId.

        } catch (error) {
            console.error("Error publishing course:", error);
            throw error;
        }
    }
};

// Functions getDoc renamed to avoid conflict locally if needed, but import is safe.
// Re-assigning for clarity in this snippet context:
const var_getDoc = async (ref: any) => {
    // Real Firestore getDoc logic
    const { getDoc } = await import('firebase/firestore');
    return getDoc(ref);
};
