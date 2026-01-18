
import { useState, useEffect } from 'react';
import { PageItem, Variation, MestreFullConfig } from '../types';
import toast from 'react-hot-toast';

export const useFunnelsData = () => {
    const [activePages, setActivePages] = useState<PageItem[]>([
        { name: 'Página de Vendas Principal', url: 'oferta.mestre.com', type: 'PV', status: 'active' },
        { name: 'Captura Lead Magnet', url: 'aula.mestre.com', type: 'LP', status: 'active' },
        { name: 'Checkout Bump', url: 'pay.mestre.com/bump', type: 'CHK', status: 'testing' },
    ]);

    const [variations, setVariations] = useState<Variation[]>([
        { id: 'A', name: 'Original (Control)', status: 'active', visits: 1240, conv: '18.2%', roas: 4.2, cost: 'R$ 58,20', subdomain: 'oferta.mestre.com' },
        { id: 'B', name: 'Variação Cliffhanger', status: 'testing', visits: 420, conv: '24.5%', roas: 6.1, cost: 'R$ 42,10', subdomain: 'v1-oferta.mestre.com' },
        { id: 'C', name: 'Variação Lógica', status: 'killed', visits: 110, conv: '11.0%', roas: 1.8, cost: 'R$ 59,90', subdomain: 'v2-oferta.mestre.com' },
    ]);

    const [mestreFullConfig, setMestreFullConfig] = useState<MestreFullConfig>({
        minConversionScale: 18,
        conversionDropThreshold: 20,
        maxBudgetConcentration: 25,
        scaleRoasThreshold: 5,
        scaleConversionThreshold: 22,
        scaleNewStudentsThreshold: 35,
        wearRetentionDrop: 30,
        pauseRoasThreshold: 2.0,
        revenueNotification: 15000,
        diversificationCap: 30
    });

    const [budgetCap, setBudgetCap] = useState(60.00);

    // Função para adicionar nova página à lista e iniciar monitoramento
    const handlePageCreated = (newPage: PageItem) => {
        setActivePages(prev => [newPage, ...prev]);
        
        // Log de inteligência
        console.log(`[NEXUS] Nova página detectada para monitoramento: ${newPage.url}`);
    };

    const updateMestreFullConfig = (newConfig: MestreFullConfig) => {
        setMestreFullConfig(newConfig);
        toast.success("Parâmetros salvos! Mestre Full atualizado.");
    };

    return {
        activePages,
        variations,
        mestreFullConfig,
        budgetCap,
        setBudgetCap,
        updateMestreFullConfig,
        handlePageCreated
    };
};
