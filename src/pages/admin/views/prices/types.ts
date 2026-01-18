
import React from 'react';

export interface PlanConfig {
    price: number;
    credits: number;
    activeFeatures: string[];
}

export interface PlansState {
    basic: PlanConfig;
    pro: PlanConfig;
    elite: PlanConfig;
}

export interface Coupon {
    id: string;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    product: string;
    uses: number;
    limit: number | null;
    expiration: string;
    status: 'active' | 'expired' | 'scheduled';
}

export interface SystemTool {
    id: string;
    label: string;
    costUSD: number; // Agora o custo base é em Dólar
}

export interface SystemModule {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    tools: SystemTool[];
}
