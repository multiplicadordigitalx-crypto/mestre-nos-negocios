import { StudentPage } from '../types';

export const COMMON_PAGES: StudentPage[] = [
    'dashboard', 'training', 'profile', 'support', 'community', 'financial', 'wallet', 'recharge'
];

// Mapping Category ID (from Course) to allowed pages
export const NICHE_TOOLS: Record<string, StudentPage[]> = {
    // Marketing & Busines
    'business': ['marketing', 'nexus_ads', 'funnels', 'integrations', 'email_marketing', 'products', 'create_course', 'producer_dashboard'],
    'marketing': ['marketing', 'nexus_ads', 'funnels', 'integrations', 'email_marketing', 'products', 'create_course', 'producer_dashboard'],

    // Health & Wellness
    'health': ['health_diary', 'diario_alimentar'],
    'wellness': ['health_diary', 'diario_alimentar'],
    'fitness': ['health_diary', 'diario_alimentar'],

    // Mentorship specific
    'mentorship': ['coach', 'mestre_ia'],

    // Law
    'law': ['jurista_ia']
};

export const getAllowedPagesForStudent = (purchasedCourses: any[]): Set<string> => {
    const allowed = new Set<string>(COMMON_PAGES);

    if (!purchasedCourses || purchasedCourses.length === 0) {
        // Fallback: If no courses, maybe show standard set or just common?
        // Let's add basic tools just in case.
        allowed.add('mestre_ia');
        allowed.add('products');
        return allowed;
    }

    purchasedCourses.forEach(course => {
        // 1. Dynamic Tool Selection (AI/Producer Defined)
        if (course.premiumTools && Array.isArray(course.premiumTools) && course.premiumTools.length > 0) {
            course.premiumTools.forEach((toolId: string) => {
                // Map tool IDs to Page IDs if necessary (e.g., 'marketing_pack' might expand to multiple)
                // For now assuming 1:1 or logic handles it. 
                // If toolId is 'marketing_pack', add all marketing pages?
                if (toolId === 'marketing_pack') {
                    NICHE_TOOLS['marketing'].forEach(p => allowed.add(p));
                } else if (toolId === 'health_pack') {
                    NICHE_TOOLS['health'].forEach(p => allowed.add(p));
                } else {
                    // Direct Page ID
                    allowed.add(toolId);
                }
            });
            // If Tools are explicitly defined, we might SKIP niche check? 
            // Or additive? User asked for content-driven. 
            // Let's make it additive for safety, or primary if present.
            return;
        }

        // 2. Fallback: Category/Niche Logic
        // Ensure we handle both object with category string or just check properties
        const category = (course.category || course.niche || 'generic').toLowerCase();
        const niche = (course.niche || '').toLowerCase();
        const title = (course.title || '').toLowerCase();

        // Helper to check keywords
        const check = (str: string) => {
            Object.keys(NICHE_TOOLS).forEach(key => {
                if (str.includes(key)) {
                    NICHE_TOOLS[key].forEach(page => allowed.add(page));
                }
            });
        };

        check(category);
        check(niche);
        check(title);
    });

    return allowed;
};
