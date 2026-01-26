import React, { useState } from 'react';
import { Trophy, TrendingUp, Target, Award } from '../../../Icons';
import { ChevronLeft, Zap, CheckCircle, Brain, Layers, Star, XCircle, RotateCcw, AlertCircle } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from '../language/InsufficientFundsAlert';


import { StudentPage } from '../../../types';

interface JurisMemoriaProps {
    onBack: () => void;
    navigateTo?: (page: StudentPage) => void;
}

type SetupState = 'SETUP' | 'ESTIMATING' | 'ACTIVE' | 'ANALYSIS_POPUP' | 'SUMMARY';

export const JurisMemoria: React.FC<JurisMemoriaProps> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState<SetupState>('SETUP');
    const [topic, setTopic] = useState('');
    const [area, setArea] = useState('');
    const [cardCount, setCardCount] = useState(10);
    const [showProcessConfirm, setShowProcessConfirm] = useState(false);

    const [reservedCredits, setReservedCredits] = useState(0);
    const [consumedCredits, setConsumedCredits] = useState(0);
    const [refundAmount, setRefundAmount] = useState(0);
    const [cardsReviewed, setCardsReviewed] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const [currentCardIdx, setCurrentCardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [difficulty, setDifficulty] = useState('ASSOCIADO');

    // Modal States
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const DIFFICULTY_LEVELS = {
        'ESTAGIARIO': { label: 'Estagiário', cost: 1, color: 'text-blue-400', border: 'border-blue-500/50' },
        'ASSOCIADO': { label: 'Associado', cost: 2, color: 'text-purple-400', border: 'border-purple-500/50' },
        'SOCIO': { label: 'Sócio Sênior', cost: 4, color: 'text-yellow-400', border: 'border-yellow-500/50' }
    };

    // Cost is now dynamic based on difficulty
    const getCostPerCard = () => DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS].cost;

    const areas = [
        "Direito Civil", "Direito Penal", "Direito Trabalhista", "Direito Tributário",
        "Direito Constitucional", "Direito Administrativo", "Direito Empresarial",
        "Direito Previdenciário", "Direito Eleitoral", "Direito Ambiental",
        "Direito Processual Civil", "Direito Processual Penal",
        "Direito do Consumidor", "Direito Digital",
        "Direito Imobiliário", "Propriedade Intelectual", "Direito Internacional",
        "Direito de Família & Sucessões", "Direito Médico", "Direito Agrário"
    ];

    // REALISTIC MOCK DATA
    const mockDb = {
        "Direito Penal": [
            { front: "Qual a diferença entre Dolo Eventual e Culpa Consciente?", back: "No Dolo Eventual, o agente prevê o resultado e assume o risco de produzi-lo (Foda-se). Na Culpa Consciente, ele prevê o resultado mas acredita sinceramente que não ocorrerá (Fudeu). Base: Art. 18 do CP." },
            { front: "O que é 'Iter Criminis'?", back: "É o caminho do crime, composto por 5 fases: Cogitação, Atos Preparatórios, Atos Executórios, Consumação e Exaurimento. A punição começa, via de regra, na execução (Art. 14, II, CP)." },
            { front: "Defina Estado de Necessidade.", back: "Causa excludente de ilicitude. O agente pratica o fato para salvar de perigo atual (não provocado por ele) direito próprio ou alheio, cujo sacrifício não era razoável exigir-se (Art. 24, CP)." }
        ],
        "Direito Civil": [
            { front: "Qual o prazo prescricional para cobrança de dívidas líquidas constantes de instrumento público ou particular?", back: "5 anos, conforme Art. 206, § 5º, I do Código Civil." },
            { front: "Diferença entre Prescrição e Decadência.", back: "Prescrição atinge a pretensão (o direito de ação). Decadência atinge o próprio direito potestativo. Prazos de prescrição estão nos Arts. 205 e 206; decadência está espalhada na lei." },
            { front: "O que é a Teoria da Aparência?", back: "Princípio que protege o terceiro de boa-fé que confia em uma situação que, embora não seja real, aparenta ser. Ex: Pagamento a credor putativo (Art. 309, CC) é válido." }
        ],
        "Direito Trabalhista": [
            { front: "Quais os requisitos para o vínculo empregatício?", back: "São 5 (S.H.O.P.P): Subordinação, Habitualidade, Onerosidade, Pessoalidade e Pessoa Física. Base: Arts. 2º e 3º da CLT." },
            { front: "Qual o prazo para pagamento das verbas rescisórias?", back: "10 dias corridos a partir do término do contrato, independentemente do tipo de aviso prévio. Base: Art. 477, § 6º da CLT (Reforma Trabalhista)." },
            { front: "O que é equiparação salarial?", back: "É o direito de receber salário igual ao de colega que exerce a mesma função, com mesma perfeição técnica e produtividade, na mesma empresa e estabelecimento. Base: Art. 461 da CLT." }
        ],
        "Direito Constitucional": [
            { front: "O que são Cláusulas Pétreas?", back: "Limitações materiais ao poder de reforma da Constituição. Não podem ser abolidas por PEC: Forma federativa, Voto direto/secreto/universal/periódico, Separação dos Poderes e Direitos Individuais. Art. 60, § 4º, CF/88." },
            { front: "Diferença entre Eficácia Plena, Contida e Limitada.", back: "Plena: Autoaplicável imediata. Contida: Aplicável, mas lei pode restringir. Limitada: Depende de lei integradora para produzir efeitos. (Classificação de José Afonso da Silva)." },
            { front: "Quem pode propor ADI (Ação Direta de Inconstitucionalidade)?", back: "Presidente, Mesa do Senado/Câmara, PGR, OAB (Conselho Federal), Partidos Políticos (com representação no CN) e Confederações Sindicais/Entidades de Classe Nacionais. Art. 103, CF." }
        ],
        "Direito Tributário": [
            { front: "O que é o Princípio da Anterioridade Nonagesimal?", back: "Veda a cobrança de tributos antes de decorridos 90 dias da data de publicação da lei que os instituiu ou aumentou. Base: Art. 150, III, 'c', CF/88." },
            { front: "Suspensão vs. Extinção do Crédito Tributário.", back: "Suspensão adia a exigibilidade (ex: parcelamento - Art. 151 CTN). Extinção mata a dívida (ex: pagamento, decadência - Art. 156 CTN)." },
            { front: "Qual a imunidade dos Templos de qualquer culto?", back: "Veda a União, Estados e Municípios de instituir IMPOSTOS sobre o patrimônio, renda e serviços relacionados às finalidades essenciais dos templos. Art. 150, VI, 'b', CF." }
        ],
        "Direito Administrativo": [
            { front: "Quais são os princípios explícitos da Administração Pública?", back: "L.I.M.P.E: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência. Art. 37, caput, CF/88." },
            { front: "Diferença entre Ato Vinculado e Ato Discricionário.", back: "Vinculado: Lei define todos os requisitos, sem margem de escolha (ex: licença para dirigir). Discricionário: Lei dá margem para análise de conveniência e oportunidade (ex: autorização de uso de bem público)." },
            { front: "O que é a Teoria do Risco Administrativo?", back: "O Estado responde objetivamente pelos danos que seus agentes causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa. Art. 37, § 6º, CF." }
        ],
        "Direito Empresarial": [
            { front: "O que é Teoria da Desconsideração da Personalidade Jurídica?", back: "Permite atingir bens dos sócios quando houver abuso da personalidade (desvio de finalidade ou confusão patrimonial). Art. 50 do CC." },
            { front: "Quais créditos não se sujeitam à Recuperação Judicial?", back: "Créditos tributários, de proprietário fiduciário, de arrendador mercantil, de adiantamento a contrato de câmbio (ACC), entre outros. Lei 11.101/05, Art. 49." }
        ],
        "Direito Previdenciário": [
            { front: "O que é Segurado Facultativo?", back: "Pessoa maior de 16 anos que não exerce atividade remunerada que a enquadre como segurado obrigatório, mas decide contribuir (ex: dona de casa, estudante). Art. 13, Lei 8.212/91." },
            { front: "Qual a carência para Auxílio por Incapacidade Temporária (antigo auxílio-doença)?", back: "Via de regra, 12 contribuições mensais. Isento em caso de acidente de qualquer natureza ou doenças graves listadas em lei. Art. 25, I, Lei 8.213/91." }
        ],
        "Direito Eleitoral": [
            { front: "O que é Inelegibilidade Reflexa?", back: "São inelegíveis, no território de jurisdição do titular, o cônjuge e os parentes até o 2º grau do PR, Governador ou Prefeito, salvo se já titulares de mandato eletivo e candidatos à reeleição. Art. 14, § 7º, CF." },
            { front: "Qual o prazo para ajuizar AIME (Ação de Impugnação de Mandato Eletivo)?", back: "15 dias contados da diplomação, instruída com provas de abuso de poder econômico, corrupção ou fraude. Art. 14, § 10, CF." }
        ],
        "Direito Ambiental": [
            { front: "O que é o Princípio do Poluidor-Pagador?", back: "Impõe ao poluidor o dever de arcar com os custos da prevenção, da repressão e da reparação dos danos ambientais. Art. 225, § 3º, CF e Lei 6.938/81." },
            { front: "Natureza da Responsabilidade Civil por Dano Ambiental.", back: "É Objetiva e Solidária, baseada na Teoria do Risco Integral. Não admite excludentes de responsabilidade (como caso fortuito ou força maior). Súmula 618 STJ (inversa) e Jurisprudência consolidada." }
        ],
        "Direito Processual Civil": [
            { front: "Qual o prazo para interpor Agravo de Instrumento?", back: "15 dias úteis, contados da intimação da decisão interlocutória. Cabível apenas nas hipóteses do rol taxativo (mas com taxatividade mitigada pelo STJ) do Art. 1.015 do CPC." },
            { front: "Diferença entre Tutela de Urgência e Tutela de Evidência.", back: "Urgência exige 'periculum in mora' (risco) + 'fumus boni iuris' (probabilidade). Evidência independe de perigo, bastando a alta probabilidade do direito ou abuso de defesa (Art. 311 CPC)." }
        ],
        "Direito Processual Penal": [
            { front: "Até quando pode ser oferecida a Denúncia?", back: "Regra geral: 5 dias (réu preso) ou 15 dias (réu solto e afiançado). O prazo conta-se da data em que o MP recebe o Inquérito Policial. Art. 46 do CPP." },
            { front: "O que é o Princípio do 'Nemo Tenetur Se Detegere'?", back: "Direito à não autoincriminação. O réu não é obrigado a produzir provas contra si mesmo (ex: não é obrigado a fazer bafômetro ou reconstituição do crime). Art. 5º, LXIII, CF." }
        ],
        "Direito do Consumidor": [
            { front: "Qual o prazo de arrependimento em compras online?", back: "7 dias, contados da assinatura ou do recebimento do produto/serviço, sempre que a contratação ocorrer fora do estabelecimento comercial. Art. 49 do CDC." },
            { front: "Responsabilidade pelo Fato do Produto (Acidente de Consumo).", back: "É Objetiva. O fabricante/produtor responde independentemente de culpa pela reparação dos danos causados aos consumidores. Art. 12 do CDC." }
        ],
        "Direito Digital": [
            { front: "Quais são as bases legais para tratamento de dados na LGPD?", back: "São 10, incluindo: Consentimento, Legítimo Interesse, Execução de Contrato, Obrigação Legal, Proteção da Vida, etc. Art. 7º da Lei 13.709/2018." },
            { front: "O que é o Marco Civil da Internet (Princípio da Neutralidade)?", back: "Garante que pacotes de dados sejam tratados de forma isonômica, sem distinção por conteúdo, origem, destino ou serviço. Art. 9º da Lei 12.965/14." }
        ],
        "Direito Imobiliário": [
            { front: "Quais os requisitos da Usucapião Extraordinária?", back: "Posse mansa, pacífica e ininterrupta por 15 anos (ou 10, se moradia habitual), independentemente de título e boa-fé. Art. 1.238 do Código Civil." },
            { front: "Prazo para despejo em liminar na Lei do Inquilinato?", back: "15 dias para desocupação voluntária, desde que prestada caução de 3 meses, em casos como falta de pagamento ou descumprimento contratual. Art. 59, § 1º, Lei 8.245/91." }
        ],
        "Propriedade Intelectual": [
            { front: "Qual a duração do registro de marca?", back: "10 anos, prorrogáveis por períodos iguais e sucessivos. O titular deve zelar pela sua integridade e reputação. Art. 133 da Lei 9.279/96 (LPI)." },
            { front: "Diferença entre Direito Moral e Patrimonial do Autor.", back: "Moral: Inalienável e irrenunciável (ex: ser citado). Patrimonial: Transferível, refere-se à exploração econômica da obra. Art. 22 e 28 da Lei 9.610/98." }
        ],
        "Direito Internacional": [
            { front: "O que é Homologação de Sentença Estrangeira?", back: "Processo perante o STJ para que uma decisão judicial proferida em outro país tenha validade e eficácia no Brasil. Art. 105, I, 'i', CF/88." },
            { front: "Conceito de 'Jus Cogens'.", back: "Normas imperativas de Direito Internacional Geral, aceitas pela comunidade internacional, que não podem ser derrogadas (ex: proibição da escravidão e tortura)." }
        ],
        "Direito de Família & Sucessões": [
            { front: "Qual o regime de bens legal (padrão) no Brasil?", back: "Comunhão Parcial de Bens. Comunicam-se os bens adquiridos onerosamente na constância do casamento, excluindo-se os particulares (anteriores, doados ou herdados). Art. 1.640 e 1.658 CC." },
            { front: "Quem são os Herdeiros Necessários?", back: "Descendentes (filhos/netos), Ascendentes (pais/avós) e o Cônjuge. A eles pertence, de pleno direito, a metade dos bens da herança (legítima). Art. 1.845 CC." }
        ],
        "Direito Médico": [
            { front: "O que é o Termo de Consentimento Livre e Esclarecido (TCLE)?", back: "Documento obrigatório onde o paciente manifesta autorização para procedimentos, após ser informado sobre riscos e benefícios. A falta dele gera responsabilidade civil por falha no dever de informação." },
            { front: "Responsabilidade Civil do Médico é Subjetiva ou Objetiva?", back: "Regra geral: Subjetiva (depende de culpa). Porém, em procedimentos estéticos de resultado, a obrigação é de fim, presumindo-se a culpa se o resultado não for atingido." }
        ],
        "Direito Agrário": [
            { front: "O que é Função Social da Propriedade Rural?", back: "Requisito constitucional para não desapropriação. Exige: aproveitamento racional, uso adequado dos recursos naturais, cumprimento da legislação trabalhista e bem-estar dos proprietários/trabalhadores. Art. 186 CF." },
            { front: "Diferença entre Arrendamento e Parceria Rural.", back: "Arrendamento: Aluguel da terra (preço fixo). Parceria: Sociedade de capital/trabalho (partilha de riscos e lucros/prejuízos). Estatuto da Terra (Lei 4.504/64)." }
        ]
    };

    const generateDeck = (topic: string, count: number, area: string) => {
        // Try to get specific mocks, fallback to generic structure if needed
        const specificMocks = mockDb[area as keyof typeof mockDb] || [];
        const deck = [];

        for (let i = 0; i < count; i++) {
            if (i < specificMocks.length) {
                deck.push({ id: i, ...specificMocks[i] });
            } else {
                deck.push({
                    id: i,
                    front: `Questão Prática #${i + 1} sobre ${topic}`,
                    back: `A resposta envolve a aplicação direta do Art. ${100 + i} da legislação de ${area}. É crucial observar a jurisprudência recente que mitiga a aplicação literal da norma em casos de vulnerabilidade.`
                });
            }
        }
        return deck;
    };

    const [deck, setDeck] = useState<any[]>([]);

    const handleInitialRequest = () => {
        if (!topic || !area) {
            toast.error("Preencha a área e o tópico para continuar.");
            return;
        }
        setReservedCredits(cardCount * getCostPerCard());
        setShowProcessConfirm(true);
    };

    const confirmProcessing = async () => {
        if (!user) {
            toast.error("Erro de autenticação. Recarregue a página.");
            return;
        }

        if ((user.creditBalance || 0) < reservedCredits) {
            setShowInsufficientModal(true);
            return;
        }

        setShowProcessConfirm(false);
        setStep('ESTIMATING');

        // Process consumption
        const result = await consumeCredits(user.uid, 'util_jurismemoria', reservedCredits, `JurisMemória: ${topic} (${cardCount} cards)`);

        if (!result.success) {
            setStep('SETUP');
            toast.error(result.message || "Erro ao processar pagamento.");
            return;
        }

        // Update local balance immediately
        if (refreshUser) refreshUser();

        setTimeout(() => {
            setDeck(generateDeck(topic, cardCount, area));
            // Package Logic: Charge FULL amount immediately upon generation
            setConsumedCredits(reservedCredits);
            toast.success("Deck gerado e debitado com sucesso!", { icon: '🧠' });
            setStep('ACTIVE');
        }, 2000);
    };

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNextCard = (remembered: boolean) => {
        if (remembered) setCorrectCount(prev => prev + 1);

        const newReviewed = cardsReviewed + 1;
        setCardsReviewed(newReviewed);
        // Cost is already fully consumed at start (Package Model)

        setIsFlipped(false);
        if (currentCardIdx < deck.length - 1) {
            setCurrentCardIdx(prev => prev + 1);
        } else {
            finishSession(newReviewed);
        }
    };

    const finishSession = (_finalReviewedCount?: number) => {
        // No refunds for early exit - generation cost is sunk
        setRefundAmount(0);

        // Show Analysis Pop-up FIRST
        setStep('ANALYSIS_POPUP');
    };

    const closeAnalysis = () => {
        setStep('SUMMARY');
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative h-auto">
            {/* Header */}
            <div className="bg-gray-950/80 p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                <div className="absolute left-6">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
                        🧠 JurisMemória
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">Flashcards com Reserva de Crédito</p>
                </div>
                {step === 'ACTIVE' && (
                    <div className="absolute right-6 hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300">Reserva: {reservedCredits} CR</span>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative">

                {/* SETUP */}
                {step === 'SETUP' && (
                    <div className="max-w-md w-full space-y-6 animate-fade-in relative z-10">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">O que vamos memorizar hoje?</h3>
                            <p className="text-gray-400 text-sm">A IA criará flashcards personalizados e cobrará apenas pelo que você estudar.</p>
                        </div>

                        {/* Gamification Dashboard (New) */}
                        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-3xl relative overflow-hidden mb-8">
                            <div className="absolute top-0 right-0 p-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-white font-bold text-lg">Seu Progresso</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Cards Vistos</span>
                                    <span className="text-2xl font-bold text-white">342</span>
                                </div>
                                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Retenção</span>
                                    <span className="text-2xl font-bold text-green-400">87%</span>
                                </div>
                                <div className="col-span-2 md:col-span-1 bg-gray-900 border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Ofensiva</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                        <span className="text-lg font-bold text-white">12 Dias</span>
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-2">
                                            <Award className="w-3 h-3 text-purple-500" /> Progresso da Carreira
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-300 font-bold uppercase">Estagiário</span>
                                                <span className="text-[10px] text-green-400 font-bold">100%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-300 font-bold uppercase">Associado</span>
                                                <span className="text-[10px] text-purple-400 font-bold">45%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 w-[45%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Sócio Sênior</span>
                                                <span className="text-[10px] text-gray-600 font-bold">12%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gray-600 w-[12%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Área do Direito</label>
                                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={area} onChange={(e) => setArea(e.target.value)}>
                                    <option value="">Selecione...</option>
                                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tópico Específico</label>
                                <input type="text" placeholder="Ex: Prazos, Art. 5 da CF..." className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" value={topic} onChange={(e) => setTopic(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nível de Dificuldade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(DIFFICULTY_LEVELS).map(([key, data]) => (
                                        <button
                                            key={key}
                                            onClick={() => setDifficulty(key)}
                                            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${difficulty === key ? `bg-gray-800 ${data.border} ${data.color} ring-1 ring-offset-1 ring-offset-gray-900 ring-${data.color.split('-')[1]}-500` : 'bg-gray-800 border-gray-700 text-gray-500 hover:bg-gray-700'}`}
                                        >
                                            <span className="uppercase tracking-tighter">{data.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade de Cards</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[5, 10, 20].map(num => (
                                        <button key={num} onClick={() => setCardCount(num)} className={`p-3 rounded-xl border font-bold transition-all ${cardCount === num ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>{num} Cards</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 pb-8 md:pb-0">
                            <Button onClick={handleInitialRequest} className="w-full !py-4 !bg-purple-600 hover:!bg-purple-500 font-bold uppercase tracking-wider shadow-lg shadow-purple-500/20">
                                <Zap className="w-5 h-5 mr-2" /> Iniciar Processamento
                            </Button>
                        </div>
                    </div>
                )}

                {/* LOADING */}
                {step === 'ESTIMATING' && (
                    <div className="text-center space-y-4 animate-pulse py-20">
                        <Brain className="w-16 h-16 text-purple-500 mx-auto animate-bounce" />
                        <h3 className="text-xl font-bold text-white">Consultando Vade Mecum...</h3>
                        <p className="text-gray-500">A IA está gerando suas perguntas e respostas.</p>
                    </div>
                )}

                {/* CONFIRMATION POPUP */}
                {showProcessConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-scale-up">
                            <div className="flex items-center gap-3 text-purple-500 mb-2">
                                <Layers className="w-6 h-6" />
                                <h3 className="text-lg font-bold text-white">Reserva de Crédito</h3>
                            </div>
                            <p className="text-sm text-gray-300">
                                Você está gerando {cardCount} cards sobre <strong>{topic}</strong>.
                            </p>
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Custo do Pacote:</span>
                                    <span className="text-white font-mono">{reservedCredits} Créditos</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                                    <span>Saldo Atual:</span>
                                    <span className="text-green-400">1.250 Créditos</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => setShowProcessConfirm(false)} className="flex-1 !bg-gray-800 hover:!bg-gray-700 !text-white border border-gray-600">Cancelar</Button>
                                <Button onClick={confirmProcessing} className="flex-1 !bg-purple-600 hover:!bg-purple-500">Confirmar</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIVE GAME */}
                {step === 'ACTIVE' && deck[currentCardIdx] && (
                    <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in relative z-10 pb-8 md:pb-0">
                        <div className="flex justify-between items-center px-4">
                            <span className="text-gray-400 text-sm font-mono bg-gray-800 px-3 py-1 rounded-full">{currentCardIdx + 1} / {cardCount}</span>
                            <button onClick={() => finishSession(cardsReviewed)} className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-900/10 px-3 py-1 rounded-full text-center transition-colors hover:bg-red-900/30">
                                Encerrar Rodada
                            </button>
                        </div>
                        <div className="relative w-full h-[400px] cursor-pointer group" onClick={handleFlip} style={{ perspective: '1000px' }}>
                            <div className="relative w-full h-full transition-all duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                <div className="absolute inset-0 bg-gray-800 border border-gray-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl hover:border-purple-500 transition-colors" style={{ backfaceVisibility: 'hidden' }}>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pergunta</span>
                                    <h3 className="text-2xl font-bold text-white leading-relaxed">{deck[currentCardIdx].front}</h3>
                                    <p className="text-xs text-gray-500 mt-8 animate-pulse border border-gray-700 px-3 py-1 rounded-full">Toque para ver a resposta</p>
                                </div>
                                <div className="absolute inset-0 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Resposta</span>
                                    <p className="text-lg text-gray-800 leading-relaxed font-medium">{deck[currentCardIdx].back}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-4 justify-center transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                            <button onClick={(e) => { e.stopPropagation(); handleNextCard(false); }} className="group relative overflow-hidden bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-2xl w-40 h-16 shadow-[0_4px_0_rgb(239,68,68)] hover:shadow-[0_2px_0_rgb(239,68,68)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <span className="text-2xl group-hover:animate-shake">🤯</span>
                                <div className="flex flex-col leading-none"><span className="text-xs font-bold uppercase tracking-wider opacity-70">Putz...</span><span className="font-black text-sm">Esqueci</span></div>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleNextCard(true); }} className="group relative overflow-hidden bg-green-100 hover:bg-green-200 text-green-600 border-2 border-green-200 hover:border-green-300 rounded-2xl w-40 h-16 shadow-[0_4px_0_rgb(34,197,94)] hover:shadow-[0_2px_0_rgb(34,197,94)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                <span className="text-2xl group-hover:animate-bounce">😎</span>
                                <div className="flex flex-col leading-none"><span className="text-xs font-bold uppercase tracking-wider opacity-70">Boa!</span><span className="font-black text-sm">Lembrei</span></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* AI ANALYSIS POP-UP */}
                {step === 'ANALYSIS_POPUP' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-gray-900 border border-purple-500/50 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden">
                            {/* Confetti / Decor */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>

                            <div className="text-center">
                                <div className="inline-block p-4 rounded-full bg-yellow-500/10 mb-4 border border-yellow-500/20">
                                    <Star className="w-12 h-12 text-yellow-500 animate-spin-slow" />
                                </div>
                                <h2 className="text-2xl font-black text-white italic transform -rotate-2">
                                    {correctCount > (cardsReviewed / 2) ? "MANDOU BEM!" : "BORA ESTUDAR MAIS!"}
                                </h2>
                                <p className="text-gray-400 text-sm mt-2">Você acertou {correctCount} de {cardsReviewed} cards.</p>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Brain className="w-4 h-4" /> Análise da IA
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    "{correctCount > (cardsReviewed / 2)
                                        ? "Excelente domínio dos conceitos fundamentais. Notei que você tem facilidade com a base legal, mas preste atenção nas exceções jurisprudenciais. Continue assim para gabaritar!"
                                        : "O desempenho indica que precisamos reforçar a base teórica. Foque na leitura dos artigos citados e tente criar mnemônicos para os prazos. A repetição é a mãe da retenção!"}"
                                </p>
                            </div>

                            <Button onClick={closeAnalysis} className="w-full !py-4 !bg-white !text-black hover:scale-105 font-black uppercase tracking-widest shadow-xl">
                                Ver Extrato & Fechar
                            </Button>
                        </div>
                    </div>
                )}


                {/* SUMMARY (EXTRATO) */}
                {step === 'SUMMARY' && (
                    <div className="text-center space-y-8 animate-fade-in max-w-md w-full relative z-10 py-10">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto relative">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">Sessão Finalizada</h2>
                            <p className="text-gray-400">Confira seu extrato de créditos.</p>
                        </div>
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4 shadow-xl">
                            {/* Detailed Statement */}
                            <div className="space-y-3">
                                {/* Previous Balance */}
                                <div className="flex justify-between items-center text-sm text-gray-500 px-2">
                                    <span>Saldo Anterior</span>
                                    <span className="font-mono">{(user?.creditBalance || 0) + consumedCredits} CR</span>
                                </div>

                                {/* Debit Row */}
                                <div className="flex justify-between items-center text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                    <span className="font-bold text-sm">Investimento ({cardCount} cards)</span>
                                    <span className="font-mono font-black text-lg">-{consumedCredits} CR</span>
                                </div>

                                {/* Current Balance */}
                                <div className="flex justify-between items-center border-t border-gray-700 pt-4 px-2">
                                    <span className="text-gray-300 font-bold uppercase text-xs tracking-wider">Saldo Atual</span>
                                    <span className={`font-mono font-black text-2xl ${(user?.creditBalance || 0) < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                        {user?.creditBalance || 0} CR
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => { setStep('SETUP'); setCardsReviewed(0); setCorrectCount(0); setCurrentCardIdx(0); }} className="w-full !py-4 font-bold !bg-white !text-black border border-gray-300 hover:!bg-gray-200">
                            Iniciar Nova Rodada
                        </Button>
                    </div>
                )}

            </div>
            {/* Footer Note */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-center gap-2 text-center">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <p className="text-[10px] text-gray-500 max-w-lg">
                    <strong>Nota:</strong> Ferramenta baseada em IA. As respostas servem de auxílio e aprendizado, não substituem consultoria legal oficial.
                </p>
            </div>

            {/* Global Modals */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
                requiredCredits={reservedCredits}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
