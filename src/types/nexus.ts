
export type NicheType = 'Health' | 'Wealth' | 'Relationships' | 'Hobbies' | 'Technology';
export type ProductFormat = 'Ebook' | 'Course' | 'Mentorship' | 'Software' | 'Service';

export interface NexusProductDNA {
    productId: string;
    niche: NicheType;
    subNiche: string;
    format: ProductFormat;
    pricePoint: number;
    targetAudience: {
        ageRange: [number, number];
        gender: 'Male' | 'Female' | 'All';
        painPoints: string[];
    };
    funnelStructure: string[]; // e.g., ['VSL', 'Checkout', 'Upsell1']
    alignmentScore: number; // 0-100
}

export interface WinningProductProfile {
    id: string;
    name: string; // [NEW] Real product name
    marketplaceUrl?: string; // [NEW] Link to public page
    niche: NicheType;
    monthlyRevenue: number; // Anonymized
    conversionRate: number;
    trafficSources: string[]; // ['Facebook', 'Google']
    funnelTactics: string[]; // ['OrderBump', 'VSL Delay', 'Scarcity Timer']
    psychologicalTriggers: {
        scarcity: number; // 0-10
        urgency: number;
        socialProof: number;
        authority: number;
    };
    adSentiment: 'Fear' | 'Greed' | 'Curiosity' | 'Logic';
    secretWeapons: string[]; // Unique tactics e.g. "WhatsApp Recovery Bot"
}

export interface ComparisonMetric {
    label: string;
    userValue: number;
    winnerValue: number;
    unit: '%' | 'BRL' | 'Points';
    status: 'good' | 'warning' | 'critical';
}

export interface BlueOceanInsight {
    id: string;
    competitorWeakness: string; // "Competitors ignore support"
    opportunity: string; // "Offer 24/7 WhatsApp Support"
    potentialLift: number; // Estimated % revenue increase
}

export interface ConsultancyStage {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    costId: string; // References the tool ID in constants.tsx
    estimatedTime: string; // "2 min"
    outputs: any[]; // Reports or Artifacts generated
}

export interface NexusConsultancyState {
    productId: string;
    dna: NexusProductDNA | null;
    matchedWinnerId: string | null;
    stages: ConsultancyStage[];
    metrics: ComparisonMetric[];
    insights: BlueOceanInsight[];
    psychMap: { user: number[]; winner: number[]; labels: string[] };
}
