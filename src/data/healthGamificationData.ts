
export type HealthNiche = 'diet' | 'therapy' | 'fitness' | 'default';

export interface GamificationConfig {
    flashcardTitle: string;
    quizTitle: string;
    setupMessage: string;
    levels: { [key: string]: string };
}

export const NICHE_CONFIGS: Record<HealthNiche, GamificationConfig> = {
    diet: {
        flashcardTitle: 'Memorização Nutricional',
        quizTitle: 'Quiz da Dieta & Nutrição',
        setupMessage: 'Domine os conceitos de macros, micronutrientes e jejum.',
        levels: {
            basic: 'Básico',
            inter: 'Intermediário',
            pro: 'Avançado'
        }
    },
    therapy: {
        flashcardTitle: 'Memorização Terapêutica',
        quizTitle: 'Desafio do Autoconhecimento',
        setupMessage: 'Reforce conceitos de TCC, regulação emocional e hábitos.',
        levels: {
            basic: 'Básico',
            inter: 'Intermediário',
            pro: 'Avançado'
        }
    },
    fitness: {
        flashcardTitle: 'Memorização de Performance',
        quizTitle: 'Quiz do Atleta',
        setupMessage: 'Aprofunde seus conhecimentos em fisiologia e treino.',
        levels: {
            basic: 'Básico',
            inter: 'Intermediário',
            pro: 'Avançado'
        }
    },
    default: {
        flashcardTitle: 'Estudo Prático IA',
        quizTitle: 'Desafio de Evolução',
        setupMessage: 'Aprimore seu aprendizado com desafios baseados no curso.',
        levels: {
            basic: 'Básico',
            inter: 'Intermediário',
            pro: 'Avançado'
        }
    }
};

export const MOCK_HEALTH_FLASHCARDS = {
    diet: [
        { front: "O que é o índice glicêmico?", back: "É uma medida de quão rápido o açúcar no sangue sobe após comer carboidratos." },
        { front: "Qual a função das proteínas no corpo?", back: "Construção e reparo de tecidos, enzimas e hormônios." }
    ],
    therapy: [
        { front: "O que é um 'pensamento automático' na TCC?", back: "Pensamentos rápidos e espontâneos que surgem diante de situações, muitas vezes distorcidos." },
        { front: "Defina o conceito de Janela de Tolerância.", back: "É a zona onde conseguimos processar emoções sem entrar em colapso ou desligar." }
    ],
    fitness: [
        { front: "O que é hipertrofia muscular?", back: "O aumento do diâmetro das fibras musculares devido ao treino e síntese proteica." },
        { front: "Diferença entre exercício aeróbico e anaeróbico?", back: "Aeróbico usa oxigênio para energia (longa duração). Anaeróbico não depende de O2 (explosão/força)." }
    ]
};

export const MOCK_HEALTH_QUIZ = {
    diet: [
        { id: 1, text: "Qual destes é um micronutriente?", options: ["Proteína", "Magnésio", "Carboidrato", "Gordura"], correctIndex: 1, explanation: "Vitaminas e minerais (como Magnésio) são micronutrientes." }
    ],
    therapy: [
        { id: 1, text: "O que o acrônimo S.T.O.P. significa na atenção plena?", options: ["Stop, Talk, Open, Play", "Stop, Take a breath, Observe, Proceed", "Stay, Think, Order, Pause", "Silence, Trust, Only, Present"], correctIndex: 1, explanation: "STOP é uma técnica de pausa: Pare, Respire, Observe e Prossiga." }
    ],
    fitness: [
        { id: 1, text: "Qual músculo é o principal motor do agachamento?", options: ["Bíceps", "Quadríceps", "Deltoide", "Tríceps"], correctIndex: 1, explanation: "O quadríceps é o grupo muscular primário no movimento de agachar." }
    ]
};
