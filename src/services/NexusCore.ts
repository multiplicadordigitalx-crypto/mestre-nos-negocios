
import {
    NexusTask, StrategyInsight, SystemStatus, TaskPriority, TaskType,
    WinningProduct,
    CreditSystemConfig,
    OperationsMetric,
    EscalationTicket,
    ToolCost,
    WhatsAppInstance,
    UserSubscription,
    Student
} from '../types/legacy';
import { consumeCredits, getStudents, updateStudent, getSystemStatus, updateSystemStatus, getToolCosts, saveToolCost } from './mockFirebase';
import { callMestreIA } from './mestreIaService';

// ... rest of imports ...

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

        // SPECIAL HANDLING FOR DARK POST ORCHESTRATION
        if (task.type === 'dark_post_gen') {
            await this.runDarkPostFlow(task);
            return; // Orchestration handles its own billing/completion
        }

        if (task.type === 'campaign_gen') toolId = 'vendas_hoje';
        else if (task.type === 'content_creation') toolId = 'ads_copy_gen'; // Mapped to valid tool
        else if (task.type === 'sales_recovery') toolId = 'bot_automation';
        else if (task.type === 'data_sync') toolId = 'pixel_api'; // Free usually

        // 2. Verifica Custo e Debita
        if (task.payload?.userId) {
            // --- SUBSCRIPTION CHECK FOR MONTHLY TOOLS ---
            const tools = await getToolCosts();
            const toolConfig = tools.find(t => t.toolId === toolId);
            const isMonthly = toolConfig?.billingType === 'monthly';

            if (isMonthly) {
                const access = await this.ensureSubscriptionActive(task.payload.userId, toolId);
                if (!access) {
                    task.status = 'failed';
                    throw new Error(`SUBSCRIPTION_REQUIRED: Assinatura para ${toolId} expirada ou inexistente.`);
                }
                // Se for mensal, não cobra por execução, a menos que seja "Monthly + Usage"
                // Assumindo puramente mensal por enquanto
                task.status = 'completed';
                return;
            }

            // --- EXECUTION BILLING ---
            const cost = toolConfig?.costPerTask || 0;

            if (cost > 0) {
                logger.info(`[Nexus Billing] Tentando debitar ${cost} créditos de ${task.payload.userId} para ${task.type}`);
                const billing = await consumeCredits(task.payload.userId, toolId, cost, `Nexus Auto: ${task.type}`);

                if (!billing.success) {
                    task.status = 'failed';
                    console.error(`[Nexus Core] Fim da linha (Sem Créditos): ${billing.message}`);
                    throw new Error(`BILLING_FAILED: ${billing.message}`);
                }
            }
        }

        // Simulação de execução genérica
        await new Promise(resolve => setTimeout(resolve, 500));

        // Actual execution mapping
        if (task.type === 'campaign_gen') {
            // ... (existing campaign logic if any, currently handled in component but ideally here)
        }

        task.status = 'completed';
        // Log learning event
        if (task.type === 'sales_recovery') {
            this.learnFromEvent('sales', task.payload.niche, true);
        }
    }

    /**
     * ORCHESTRATOR: Dark Post Lifecycle
     * Script ($0.02) -> Studio ($2.50) -> Distribution ($0.10)
     */
    private async runDarkPostFlow(task: NexusTask) {
        const userId = task.payload.userId;

        // 1. PRE-FLIGHT CHECK (Balance)
        // Check if user has approx ~40 credits (USD 2.62 * 6 * 2.5) basically
        // Since we debit step-by-step, we just ensure they have enough for the biggest chunk first? 
        // Or we trust the step-by-step failures provided they are atomic enough.

        logger.info(`[Nexus Orchestrator] Starting Dark Post Flow for ${userId}. Region: ${task.payload.region || 'BR-Gen'}`);

        try {
            // --- STEP 1: SCRIPT GENERATION ---
            const scriptToolId = 'ugc_viral_scripts';
            const scriptCost = await this.calculateServiceCost(scriptToolId);

            // Debit Script
            const billing1 = await consumeCredits(userId, scriptToolId, scriptCost.cost, `Nexus Dark Post: Script`);
            if (!billing1.success) throw new Error(`Sem saldo para Roteiro: ${billing1.message}`);

            // Execute Script Generation
            // const scriptRes = await callMestreIA('ugc_viral_scripts', { product: task.payload.productName, niche: task.payload.niche, ... });
            // For now mock the result based on region
            const mockScript = `[Roteiro ${task.payload.region}]: "Fala galera..."`;
            logger.info(`[Nexus Step 1] Script Generated: ${scriptCost.cost} Credits.`);


            // --- STEP 2: STUDIO RENDER (Heavy Cost) ---
            const studioToolId = 'ugc_studio_12';
            const studioCost = await this.calculateServiceCost(studioToolId);

            // Debit Studio
            const billing2 = await consumeCredits(userId, studioToolId, studioCost.cost, `Nexus Dark Post: Studio Render`);
            if (!billing2.success) throw new Error(`Sem saldo para Studio (${studioCost.cost} cr): ${billing2.message}`);

            // Execute Render (Mock time)
            await new Promise(r => setTimeout(r, 1000));
            logger.info(`[Nexus Step 2] Studio Render Complete: ${studioCost.cost} Credits.`);


            // --- STEP 3: DISTRIBUTION ---
            const distToolId = 'ugc_dist_13';
            const distCost = await this.calculateServiceCost(distToolId);

            // Debit Dist
            const billing3 = await consumeCredits(userId, distToolId, distCost.cost, `Nexus Dark Post: Distribution`);
            if (!billing3.success) throw new Error(`Sem saldo para Distribuição: ${billing3.message}`);

            // Execute Dist
            logger.info(`[Nexus Step 3] Distribution Complete: ${distCost.cost} Credits.`);

            task.status = 'completed';
            task.payload.result = { status: 'published', platform: 'Dark Post Network' };

        } catch (error: any) {
            task.status = 'failed';
            logger.error(`[Nexus Orchestrator] Flow Failed: ${error.message}`);
            // Note: In a real system we might refund partial steps or have atomic transactions.
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

    // --- SUBSCRIPTION MANAGER ---

    /**
     * Checks if a user has an active subscription for a tool.
     * Attempts renewal if expired and auto-renew is on.
     */
    public async ensureSubscriptionActive(userId: string, toolId: string): Promise<boolean> {
        const students = await getStudents();
        const user = students.find(s => s.uid === userId);

        if (!user) return false;

        const sub = user.activeSubscriptions?.find(s => s.toolId === toolId);

        if (!sub) return false; // Never subscribed

        const now = new Date();
        const expiresAt = new Date(sub.expiresAt);

        // 1. Active & Valid
        if (sub.status === 'active' && expiresAt > now) {
            return true;
        }

        // 2. Expired but Grace Period/Auto-Renew
        if (sub.status === 'active' && expiresAt <= now) {
            if (sub.autoRenew) {
                logger.info(`[Nexus Sub] Renovando assinatura ${toolId} para ${userId}...`);
                const renewed = await this.processRenewal(user, sub);
                if (renewed) return true;

                // Failed renewal
                sub.status = 'expired'; // Or grace period
                await updateStudent(user.uid, { activeSubscriptions: user.activeSubscriptions });
                return false;
            } else {
                sub.status = 'expired';
                await updateStudent(user.uid, { activeSubscriptions: user.activeSubscriptions });
                return false;
            }
        }

        return false;
    }

    /**
     * Processes the financial renewal of a subscription.
     */
    private async processRenewal(user: Student, sub: UserSubscription): Promise<boolean> {
        // Calculate Cost again (price might have changed)
        const costConfig = await this.calculateServiceCost(sub.toolId);
        const tools = await getToolCosts();
        const toolDef = tools.find(t => t.toolId === sub.toolId);

        // Use definition cost for monthly (USD -> Credits)
        // Note: calculateServiceCost includes margin.

        const billing = await consumeCredits(user.uid, sub.toolId, sub.cost, `Renovação Automática: ${sub.planName}`); // Use stored cost or current? Using stored for lock-in or update? Let's use stored for now to match UI agreement

        if (billing.success) {
            // Extend for 30 days
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 30);

            sub.expiresAt = newExpiry.toISOString();
            sub.lastPaymentDate = new Date().toISOString();
            sub.status = 'active';

            await updateStudent(user.uid, { activeSubscriptions: user.activeSubscriptions });
            logger.info(`[Nexus Sub] Renovação SUCESSO para ${user.uid} - ${sub.toolId}`);
            return true;
        } else {
            logger.warn(`[Nexus Sub] Renovação FALHOU para ${user.uid} - ${sub.toolId}: ${billing.message}`);
            return false;
        }
    }

    /**
     * Starts a new subscription for a user.
     */
    public async subscribe(userId: string, toolId: string): Promise<{ success: boolean; message: string }> {
        const students = await getStudents();
        const user = students.find(s => s.uid === userId);
        if (!user) return { success: false, message: 'User not found' };

        // 1. Check if already active
        const existing = user.activeSubscriptions?.find(s => s.toolId === toolId && s.status === 'active');
        if (existing) {
            // If expired, we renew. If active, we return success.
            const now = new Date();
            if (new Date(existing.expiresAt) > now) return { success: true, message: 'Already active' };
        }

        // 2. Calculate Cost
        const costConfig = await this.calculateServiceCost(toolId);

        // 3. Billing
        const billing = await consumeCredits(userId, toolId, costConfig.cost, `Nova Assinatura: ${toolId}`);
        if (!billing.success) return { success: false, message: billing.message };

        // 4. Add Subscription
        const newSub: UserSubscription = {
            id: `sub-${Date.now()}`,
            toolId,
            planName: 'Plano Mensal', // Idealmente viria do ToolConfig
            status: 'active',
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: true,
            lastPaymentDate: new Date().toISOString(),
            cost: costConfig.cost
        };

        if (!user.activeSubscriptions) user.activeSubscriptions = [];

        // Remove old if exists
        user.activeSubscriptions = user.activeSubscriptions.filter(s => s.toolId !== toolId);
        user.activeSubscriptions.push(newSub);

        await updateStudent(user.uid, { activeSubscriptions: user.activeSubscriptions });
        logger.info(`[Nexus Sub] Nova Assinatura: ${toolId} para ${user.uid}`);

        return { success: true, message: 'Assinatura ativada com sucesso!' };
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

            // Run Financial Check periodically (every 10s for simulation, usually slower)
            await this.runFinancialHealthCheck();

        }, 10000);
    }

    // --- SAÚDE FINANCEIRA (INVISIBLE HOSTING MODEL & AUTO-BALANCE) ---

    // Periodic Check inserted into Health Monitor or run explicitly
    public async runFinancialHealthCheck() {
        const tools = await getToolCosts();
        const usdToBrl = 6.0; // Em produção, viria de uma API em tempo real (ex: AwesomeAPI)
        // Para simulação, vamos assumir que o Nexus tem acesso à cotação atual.

        let adjustmentMade = false;

        for (const tool of tools) {
            // Ignorar se não tiver proteção ativada ou margem alvo definida
            if (!tool.autoAdjust || !tool.targetMargin) continue;

            // 1. Calcular Margem Atual Real
            // Preço (Créditos) * Valor do Crédito = Receita BRL
            const systemStatus = await getSystemStatus();
            const creditValue = systemStatus.creditValueBRL || 0.15; // Fallback to conservative 0.15
            const usdRate = 6.0; // Mock rate for now, or fetch if available
            const revenueBRL = tool.costPerTask * creditValue;
            const costBRL = tool.realCostEstimate * usdToBrl;

            if (revenueBRL <= 0) continue; // Evitar divisão por zero

            const currentMargin = ((revenueBRL - costBRL) / costBRL) * 100;
            const target = tool.targetMargin;
            const threshold = tool.triggerThreshold || 10; // Default 10%

            // 2. Cenário A: Queda Brusca de Margem (Dólar subiu ou Custo Provider aumentou)
            // Gatilho: Margem caiu mais de X% abaixo do alvo
            if (currentMargin < (target - threshold)) {
                logger.warn(`[Nexus Auto-Balance] 📉 Margem Crítica em ${tool.toolName}: ${currentMargin.toFixed(1)}% (Alvo: ${target}%, Gatilho: ${threshold}%)`);

                // Calcular Novo Preço para restaurar o Alvo
                // Preço = Custo * (1 + Target/100)

                const newPriceBRL = costBRL * (1 + (target / 100));
                const newCredits = Math.ceil(newPriceBRL / creditValue * 100) / 100; // Arredondar 2 casas
                const oldCredits = tool.costPerTask;

                // Aplicar Ajuste
                tool.costPerTask = newCredits;
                tool.profitMargin = target; // Reset visual margin to target (since we just fixed price)

                // Salvar Backup
                tool.lastAutoAdjustment = {
                    date: Date.now(),
                    oldPrice: oldCredits,
                    newPrice: newCredits,
                    reason: 'margin_drop'
                };

                await saveToolCost(tool);
                adjustmentMade = true;

                // Notificar Admin
                this.sendWhatsAppAlert(
                    `🚨 *Nexus Finanças: Proteção Ativada*\n` +
                    `Ferramenta: _${tool.toolName}_\n` +
                    `Motivo: Queda de Margem > ${threshold}% (${currentMargin.toFixed(1)}% -> ${target}%)\n` +
                    `Ação: Preço reajustado de ${oldCredits} para ${newCredits} créditos.\n` +
                    `_Backup salvo. Reversão disponível no painel._`
                );
            }

            // 3. Cenário B: Recuperação de Margem (Dólar caiu)
            // Gatilho: Margem subiu mais de X% acima do alvo E existe um ajuste anterior
            else if (currentMargin > (target + threshold) && tool.lastAutoAdjustment?.reason === 'margin_drop') {
                logger.info(`[Nexus Auto-Balance] 📈 Margem Excessiva em ${tool.toolName}: ${currentMargin.toFixed(1)}%. Normalizando...`);

                const newPriceBRL = costBRL * (1 + (target / 100));
                const newCredits = Math.ceil(newPriceBRL / creditValue * 100) / 100;
                const oldCredits = tool.costPerTask;

                tool.costPerTask = newCredits;
                tool.profitMargin = target;

                tool.lastAutoAdjustment = {
                    date: Date.now(),
                    oldPrice: oldCredits,
                    newPrice: newCredits,
                    reason: 'margin_recovery'
                };

                await saveToolCost(tool);
                adjustmentMade = true;

                this.sendWhatsAppAlert(
                    `✅ *Nexus Finanças: Normalização*\n` +
                    `Ferramenta: _${tool.toolName}_\n` +
                    `Motivo: Custo normalizado. Margem ajustada para evitar sobrepreço.\n` +
                    `Ação: Preço reduzido de ${oldCredits} para ${newCredits} créditos.`
                );
            }
        }

        if (adjustmentMade) {
            await updateSystemStatus({ lastSync: Date.now() }); // Force refresh hints
        }
    }

    private sendWhatsAppAlert(message: string) {
        // Enviar via Instância Oficial de Notificações
        const instance = this.getOptimalInstance('notifications');
        const sender = instance ? `${instance.name} (${instance.phoneNumber})` : 'SYSTEM_FALLBACK';

        console.log(`[WHATSAPP ALERT] From: ${sender}\nMessage:\n${message}`);
        // Em produção: whatsappService.sendMessage(adminNumber, message, instance.id);
    }

    public async monitorFinancialHealth(): Promise<{ status: 'healthy' | 'warning' | 'critical', margin: number, revenue: number, cost: number }> {
        const students = await getStudents();
        const activeStudents = students.length;

        // 1. Custo Real (Internal Costs)
        // Hosting ($1.50) + Maintenance ($0.005/day * 30 -> $0.15)
        const avgHostingCost = 1.50 + 3.50; // Traditional + AI Hosting (worst case)
        const totalInternalCost = activeStudents * avgHostingCost;

        // 2. Receita Invisível (Fundo de Reserva)
        // a) 2% do GMV (Vendas Totais na Plataforma)
        const mockTotalSalesGMV = 50000; // $50k USD/mo mocked
        const lucPayFee = mockTotalSalesGMV * 0.02;

        // b) Margem na Venda de Créditos
        // Custo Real API: $0.05 -> Venda: $0.20 (Margem $0.15)
        // Mock Créditos Vendidos: 1000 credits/student/mo
        const creditsSold = activeStudents * 50;
        const creditMargin = creditsSold * 0.15; // $0.15 profit per credit sold

        const totalInvisibleRevenue = lucPayFee + creditMargin;

        const healthRatio = totalInvisibleRevenue / totalInternalCost;

        logger.info(`[Nexus Financial] Health Check: Receita(${totalInvisibleRevenue.toFixed(2)}) vs Custo(${totalInternalCost.toFixed(2)}) - Ratio: ${healthRatio.toFixed(2)}`);

        if (healthRatio < 1.0) {
            logger.error(`[Nexus Financial] 🚨 ALERTA DE PREJUÍZO: Taxas não cobrem infraestrutura!`);
            return { status: 'critical', margin: healthRatio, revenue: totalInvisibleRevenue, cost: totalInternalCost };
        } else if (healthRatio < 1.2) {
            logger.warn(`[Nexus Financial] ⚠️ ALERTA DE MARGEM BAIXA: Recomendado aumentar taxa LucPay.`);
            return { status: 'warning', margin: healthRatio, revenue: totalInvisibleRevenue, cost: totalInternalCost };
        }

        return { status: 'healthy', margin: healthRatio, revenue: totalInvisibleRevenue, cost: totalInternalCost };
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
