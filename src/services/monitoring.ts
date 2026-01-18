
// Centralização de monitoramento e logs para produção
class MonitoringService {
    error(message: string, error?: any) {
        console.group(`🚨 [NEXUS ERROR] ${message}`);
        if (error) console.error(error);
        console.groupEnd();
    }

    warn(message: string, context?: any) {
        console.warn(`⚠️ [NEXUS WARN] ${message}`, context || '');
    }

    info(message: string, context?: any) {
        console.log(`ℹ️ [NEXUS INFO] ${message}`, context || '');
    }

    // Futura integração com Sentry/Firebase
    trackEvent(name: string, params?: any) {
        console.log(`📊 [EVENT]: ${name}`, params);
    }
}

export const logger = new MonitoringService();
