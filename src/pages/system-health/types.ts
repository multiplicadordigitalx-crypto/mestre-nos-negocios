
export interface HealthMetric {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    status: 'good' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'stable';
    details?: any;
}

export interface AttackEvent {
    id: number;
    lat: number;
    lng: number;
    type: 'success' | 'blocked' | 'attack';
    ip: string;
    location: string;
    timestamp: number;
}
