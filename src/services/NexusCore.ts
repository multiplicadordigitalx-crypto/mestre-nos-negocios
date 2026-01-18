
import {
    NexusTask, StrategyInsight, SystemStatus, TaskPriority, TaskType,
    WinningProduct,
    CreditSystemConfig,
    OperationsMetric,
    EscalationTicket,
    ToolCost,
    WhatsAppInstance
} from '../types/legacy';
import { getSystemStatus, updateSystemStatus, getAppProducts, saveJSON, consumeCredits, getToolCosts } from './mockFirebase';

// ... (Rest of imports is implicitly kept if I target correctly, but replace_file_content replaces blocks.
// I will just replace executeTask and add imports separately or use multi_replace if imports are far.)
// Wait, imports are at line 3.
// I'll do two edits or one big edit if possible?
// I'll do two edits using `multi_replace` is cleaner, 
// OR simpler `replace_file_content` for imports then `replace` for method.
// I'll do imports first.

import { logger } from './monitoring';

// Mock de Banco de Conhecimento (Em produção seria um Vector Database)
const STRATEGY_MEMORY: Record<string, StrategyInsight> = {
    'Emagrecimento': {
        niche: 'Emagrecimento',
        successfulTactics: ['Vídeo VSL curto (3 min)', 'Headline com promessa temporal', 'Prova social antes do preço'],
        failedTactics: ['Texto longo sem vídeo', 'Checkout com muitos campos'],
        avgConversionRate: 4.2,
        recommendedChannels: ['Instagram', 'YouTube Shorts']
    },
    'Finanças': {
        niche: 'Finanças',
        successfulTactics: ['Webinar ao vivo', 'Planilha gratuita como isca', 'Depoimentos de ganhos'],
        failedTactics: ['Promessa de dinheiro fácil sem método', 'Anúncio muito agressivo (Bloqueio)'],
        avgConversionRate: 3.5,
        recommendedChannels: ['YouTube', 'Google Search']
    }
};

// Mock Instances Data (Should be in DB)
const MOCK_INSTANCES: WhatsAppInstance[] = [
    { id: 'inst-sales-01', name: 'Vendas Principal', role: 'sales', status: 'connected', ownerId: 'platform', isBackup: false, phoneNumber: '5511999990001', healthScore: 98, activeChats: 145, capabilities: ['sales'] },
    { id: 'inst-sales-bkp', name: 'Vendas Backup', role: 'backup', status: 'connected', ownerId: 'platform', isBackup: true, backupForId: 'inst-sales-01', phoneNumber: '5511999990002', healthScore: 100, activeChats: 0, capabilities: ['sales'] },
    { id: 'inst-notify-01', name: 'Notificações', role: 'notifications', status: 'connected', ownerId: 'platform', isBackup: false, phoneNumber: '5511999990003', healthScore: 100, activeChats: 5, capabilities: ['notifications'] }
];

class NexusCoreService {
    private queue: NexusTask[] = [];
    private isProcessing = false;
    private systemHealth: number = 100; // 0-100
    private apiErrorCount: number = 0;
    private CIRCUIT_BREAKER_THRESHOLD = 5; // Erros consecutivos para ativar proteção
    private PROCESSING_INTERVAL = 2000; // ms

    constructor() {
        this.init();
    }

    private async init() {
        console.log("🚀 [Nexus Core] Inicializando Cérebro Central...");
        const status = await getSystemStatus();
        this.systemHealth = status.activeNodes > 0 ? 100 : 0;
        this.startProcessingLoop();
        this.startHealthMonitor();
    }

    // --- GESTÃO DE FILA INTELIGENTE ---

    /**
     * Adiciona uma tarefa à fila com prioridade inteligente.
     * Se for crítica (ex: venda), fura a fila.
     */
    public enqueueTask(type: TaskType, payload: any, priorityOverride?: TaskPriority): string {
        const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Determina prioridade baseada no tipo se não forçada
        let priority: TaskPriority = priorityOverride || 'normal';
        if (!priorityOverride) {
            if (type === 'sales_recovery' || type === 'data_sync') priority = 'critical';
            else if (type === 'campaign_gen') priority = 'high';
            else if (type === 'content_creation') priority = 'low';
        }

        const task: NexusTask = {
            id,
            type,
            priority,
            payload,
            timestamp: Date.now(),
            status: 'pending',
            retryCount: 0
        };

        this.queue.push(task);
        this.sortQueue(); // Reordena por prioridade

        logger.info(`[Nexus Core] Tarefa adicionada: ${type} (${priority})`, { queueSize: this.queue.length });
        return id;
    }

    private sortQueue() {
        const priorityOrder: Record<TaskPriority, number> = { 'critical': 0, 'high': 1, 'normal': 2, 'low': 3 };
        this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    private async startProcessingLoop() {
        setInterval(async () => {
            if (this.isProcessing || this.queue.length === 0) return;

            // Circuit Breaker: Se saúde < 50%, processa apenas Críticas
            if (this.systemHealth < 50) {
                const nextTask = this.queue[0];
                if (nextTask.priority !== 'critical') {
                    console.warn(`[Nexus Core] Sistema instável (${this.systemHealth}%). Pausando tarefas não críticas.`);
                    return;
                }
            }

            this.isProcessing = true;
            const task = this.queue.shift();

            if (task) {
                try {
                    await this.executeTask(task);
                    this.apiErrorCount = Math.max(0, this.apiErrorCount - 1); // Recupera saúde com sucesso
                } catch (error) {
                    console.error(`[Nexus Core] Falha na tarefa ${task.id}`, error);
                    this.handleTaskFailure(task);
                }
            }

            this.isProcessing = false;
        }, this.PROCESSING_INTERVAL);
    }

    private async executeTask(task: NexusTask) {
        task.status = 'processing';

        // --- BILLING LOGIC ---
        // 1. Identifica ferramenta associada à tarefa
        let toolId = 'mestre_dos_negocios'; // default fallback
        if (task.type === 'campaign_gen') toolId = 'vendas_hoje';
        else if (task.type === 'content_creation') toolId = 'copy_generator';
        else if (task.type === 'sales_recovery') toolId = 'bot_automation';
        else if (task.type === 'data_sync') toolId = 'pixel_api'; // Free usually

        // 2. Verifica Custo e Debita
        if (task.payload?.userId) {
            const tools = await getToolCosts();
            const toolConfig = tools.find(t => t.toolId === toolId);
            const cost = toolConfig?.costPerTask || 0;

            if (cost > 0) {
                logger.info(`[Nexus Billing] Tentando debitar ${cost} créditos de ${task.payload.userId} para ${task.type}`);
                const billing = await consumeCredits(task.payload.userId, toolId, cost, `Nexus Auto: ${task.type}`);

                if (!billing.success) {
                    task.status = 'failed';
                    console.error(`[Nexus Core] Fim da linha (Sem Créditos): ${billing.message}`);
                    // Se for tarefa crítica do Mestre Full, deveria emitir um evento de "Parar Mestre Full"
                    throw new Error(`BILLING_FAILED: ${billing.message}`);
                }
            }
        }
        // ---------------------

        // Simulação de execução
        await new Promise(resolve => setTimeout(resolve, 500));

        // Aqui chamaria os serviços reais (MestreIA, Firebase, etc.)
        // Em um sistema real, haveria um switch case ou Map de handlers

        task.status = 'completed';
        // Log learning event
        if (task.type === 'sales_recovery') {
            this.learnFromEvent('sales', task.payload.niche, true);
        }
    }

    private handleTaskFailure(task: NexusTask) {
        this.apiErrorCount++;
        if (this.apiErrorCount > this.CIRCUIT_BREAKER_THRESHOLD) {
            this.systemHealth = 40; // Degrada saúde
            updateSystemStatus({ apiReady: false, maintenance: false }); // Notifica sistema
        }

        if (task.retryCount < 3) {
            task.retryCount++;
            task.status = 'pending';
            // Backoff exponencial simplificado: joga pro final com delay
            setTimeout(() => this.queue.push(task), 1000 * task.retryCount);
        } else {
            task.status = 'failed';
            logger.error(`[Nexus Core] Tarefa ${task.id} falhou definitivamente.`, task);
        }
    }

    // --- APRENDIZADO CRUZADO (CROSS-PRODUCT LEARNING) ---

    /**
     * Busca a melhor estratégia baseada em experiências passadas de produtos semelhantes.
     */
    public getOptimizedStrategy(niche: string): StrategyInsight | null {
        // Normaliza nicho (busca simples)
        const key = Object.keys(STRATEGY_MEMORY).find(k => niche.toLowerCase().includes(k.toLowerCase()));

        if (key) {
            logger.info(`[Nexus Core] Insight encontrado para nicho: ${niche}`);
            return STRATEGY_MEMORY[key];
        }

        // Se não encontrar, retorna estratégia genérica de alta performance
        return {
            niche: 'Genérico',
            successfulTactics: ['Oferta Irresistível', 'Garantia de 7 dias', 'Bônus Exclusivo'],
            failedTactics: ['Preço oculto', 'Checkout complexo'],
            avgConversionRate: 1.5,
            recommendedChannels: ['Instagram', 'Facebook']
        };
    }

    /**
     * Registra um resultado (sucesso ou falha) para refinar o modelo.
     */
    public learnFromEvent(type: 'sales' | 'engagement', niche: string, success: boolean, details?: string) {
        // Em produção, isso escreveria no Vector DB ou banco relacional
        console.log(`[Nexus Learning] Registrando ${success ? 'SUCESSO' : 'FALHA'} para nicho ${niche}. Detalhes: ${details || ''}`);

        // Mock de atualização de memória em tempo de execução
        const key = Object.keys(STRATEGY_MEMORY).find(k => niche.toLowerCase().includes(k.toLowerCase()));
        if (key && details) {
            if (success) STRATEGY_MEMORY[key].successfulTactics.push(details);
            else STRATEGY_MEMORY[key].failedTactics.push(details);
        }
    }

    // --- NEXUS CONSULTANCY BILLING ---

    /**
     * Calculates the dynamic credit cost for a Nexus service.
     * Formula: Base Cost (USD) * Margin Multiplier * Exchange Rate (approx) -> Credits
     */
    public async calculateServiceCost(toolId: string): Promise<{ cost: number, breakdown: string }> {
        const tools = await getToolCosts();
        const tool = tools.find(t => t.toolId === toolId);

        if (!tool) return { cost: 0, breakdown: 'Free' };

        // Mock Logic: 1 Credit = R$ 1.00 (approx)
        // If Base Cost is $0.50 USD -> R$ 3.00 -> 3 Credits + Margin
        const usdToBrl = 6.0;
        const marginMultiplier = 2.5; // Nexus profit margin

        let finalCost = Math.ceil(tool.costPerTask * usdToBrl * marginMultiplier);

        // Minimum floor
        if (finalCost < 10) finalCost = 10;

        return {
            cost: finalCost,
            breakdown: `${finalCost} Créditos (Base Operacional + Taxa Nexus)`
        };
    }

    // --- MONITORAMENTO DE SAÚDE ---

    private startHealthMonitor() {
        setInterval(async () => {
            // Simula verificação de latência externa
            const latency = Math.random() * 200; // ms

            if (latency > 1500) this.systemHealth -= 10;
            else if (this.apiErrorCount === 0) this.systemHealth = Math.min(100, this.systemHealth + 5);

            await updateSystemStatus({
                queueCount: this.queue.length,
                healthScore: this.systemHealth,
                apiReady: this.systemHealth > 20
            });
        }, 10000);
    }




    public getStatus() {
        return {
            health: this.systemHealth,
            queueSize: this.queue.length,
            isProcessing: this.isProcessing,
            mode: this.systemHealth > 80 ? 'Turbo' : this.systemHealth > 40 ? 'Safe' : 'Critical'
        };
    }
    // --- ROTEAMENTO INTELIGENTE & FAILOVER ---

    /**
     * Finds the best instance for a specific task or context.
     * Implements auto-failover to backup if primary is down.
     */
    public getOptimalInstance(role: 'sales' | 'notifications', ownerId: string = 'platform'): WhatsAppInstance | null {
        // 1. Find Primary
        let primary = MOCK_INSTANCES.find(i => i.role === role && i.ownerId === ownerId && !i.isBackup);

        // Producers might use their own single instance for everything
        if (!primary && ownerId !== 'platform') {
            primary = MOCK_INSTANCES.find(i => i.ownerId === ownerId);
        }

        // 2. Check Health
        if (primary && (primary.status === 'connected' || primary.status === 'maintenance')) {
            if (primary.status === 'maintenance') {
                logger.warn(`[Nexus Routing] Instance ${primary.id} under maintenance. Checking backup...`);
                // Fallthrough to backup check
            } else {
                return primary;
            }
        }

        // 3. Failover to Backup (Only for Platform usually)
        if (primary) {
            const backup = MOCK_INSTANCES.find(i => i.isBackup && i.backupForId === primary!.id && i.status === 'connected');
            if (backup) {
                logger.warn(`[Nexus Routing] 🚨 FAILOVER ALERT: Switching from ${primary.id} to Backup ${backup.id}`);
                return backup;
            }
        }

        // 4. Fallback to any active instance with capability (Last Resort)
        const emergency = MOCK_INSTANCES.find(i => i.capabilities.includes(role) && i.status === 'connected');
        if (emergency) {
            logger.warn(`[Nexus Routing] ⚠️ EMERGENCY ROUTING: Using shared instance ${emergency.id}`);
            return emergency;
        }

        return null; // System Down
    }

    public reportInstanceFailure(instanceId: string) {
        const instance = MOCK_INSTANCES.find(i => i.id === instanceId);
        if (instance) {
            instance.healthScore -= 20;
            if (instance.healthScore < 40) {
                instance.status = 'maintenance'; // Trigger Failover logic on next call
                logger.error(`[Nexus Health] Instance ${instanceId} marked as UNSTABLE. Failover protocols initiated.`);

                // Alert Admin via Escalation
                // createEscalationRequest(...)
            }
        }
    }

    // --- CHECKOUT MONITORING (THE LISTENER) ---

    /**
     * Called when the bot sends a checkout link.
     * Transitions Lead to 'WAITING_CHECKOUT' state.
     */
    public async startCheckoutMonitoring(leadId: string, productId: string) {
        logger.info(`[Nexus Checkout] ⏳ START monitoring for Lead ${leadId} (Product: ${productId}). Silent Mode ON.`);

        // In production: Redis SETEX lead:checkout:timer 900 "active"
        // Mock: just log
    }

    /**
     * Webhook Handler (Mock)
     */
    public async handlePaymentWebhook(data: { phone: string, email: string, productId: string, status: string }) {
        logger.info(`[Nexus Webhook] Payments Hook Received: ${data.status} for ${data.email}`);

        // 1. Find Lead by Phone/Email (Matcher)
        // const lead = await findLeadByContact(data.phone, data.email);

        // 2. If Match Found:
        //    if (data.status === 'approved') {
        //        lead.status = 'won';
        //        logger.info(`[Nexus Checkout] 🏆 MATCH! Sale Confirmed. Stopping Recovery.`);
        //        // Trigger "Welcome" message
        //    }
    }

    /**
     * Cron Job: Check for Timeouts
     * If 15+ mins passed and no webhook -> trigger recovery.
     */
    public async runCheckoutTimeoutCheck() {
        // Find leads in 'WAITING_CHECKOUT' > 15 mins
        // Move to 'ABANDONED_CART'
        // Add to 'sales_recovery' Queue (Low Priority)
    }

}

// Exporta instância única (Singleton)
export const nexusCore = new NexusCoreService();
