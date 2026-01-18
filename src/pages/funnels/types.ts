
export interface MestreFullConfig {
    minConversionScale: number;
    conversionDropThreshold: number;
    maxBudgetConcentration: number;
    scaleRoasThreshold: number;
    scaleConversionThreshold: number;
    scaleNewStudentsThreshold: number;
    wearRetentionDrop: number;
    pauseRoasThreshold: number;
    revenueNotification: number;
    diversificationCap: number;
}

export interface Funnel {
    id: string;
    name: string;
    type: string;
    steps: string[];
    status: string;
}

export interface PageItem {
    name: string;
    url: string;
    type: string;
    status: string;
}

export interface BuyerPersona {
    id: string;
    campaignName: string;
    adAccountName: string;
    platform: 'Meta Ads' | 'Google Ads';
    demographics: string; // "Mulheres, 25-34, SP"
    topInterests: string[];
    behavior: string;
    ltv: number;
    syncStatus: 'synced' | 'pending' | 'learning';
    lastSync: string;
}

export interface Variation {
    id: string;
    name: string;
    status: string;
    visits: number;
    conv: string;
    roas: number;
    cost: string;
    subdomain: string;
}
