
import { getSystemStatus } from './mockFirebase';

interface ApiRequest<T = any> {
    id: string;
    task: () => Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    timestamp: number;
}

class ApiRouter {
    private queue: ApiRequest[] = [];
    private isChecking = false;

    constructor() {
        // Inicia o observador de fila
        this.startQueueObserver();
    }

    /**
     * Executa uma chamada de API ou coloca na fila se o Admin API estiver offline
     */
    async execute<T>(taskName: string, task: () => Promise<T>): Promise<T> {
        const status = await getSystemStatus();

        if (status.apiReady) {
            console.log(`[API Router] Executando tarefa imediata: ${taskName}`);
            return await task();
        }

        console.log(`[API Router] API Real offline. Colocando tarefa em espera: ${taskName}`);
        
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                id: `${taskName}-${Date.now()}`,
                task,
                resolve,
                reject,
                timestamp: Date.now()
            });
        });
    }

    private async startQueueObserver() {
        if (this.isChecking) return;
        this.isChecking = true;

        setInterval(async () => {
            if (this.queue.length === 0) return;

            const status = await getSystemStatus();
            if (status.apiReady) {
                console.log(`[API Router] Conexão com Admin API restabelecida. Processando ${this.queue.length} tarefas...`);
                
                const tasksToProcess = [...this.queue];
                this.queue = [];

                for (const req of tasksToProcess) {
                    try {
                        const result = await req.task();
                        req.resolve(result);
                    } catch (error) {
                        req.reject(error);
                    }
                }
            }
        }, 3000); // Verifica a cada 3 segundos
    }

    getQueueCount() {
        return this.queue.length;
    }
}

export const apiRouter = new ApiRouter();
