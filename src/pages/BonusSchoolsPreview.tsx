
import React from 'react';
import { motion } from 'framer-motion';
import {
    Layout, ShoppingCart, PlayCircle, Users,
    Trophy, MessageSquare, Activity, HeartPulse,
    ArrowLeft, ExternalLink, CheckCircle, Monitor
} from '../components/Icons';
import Button from '../components/Button';

const SCHOOL_PAGES = [
    {
        id: 'landing',
        title: 'Página de Vendas (Landing Page)',
        icon: Layout,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        description: 'A vitrine da sua escola. Otimizada com gatilhos mentais do Nexus IA para converter visitantes em alunos.',
        features: ['Copywriting Persuasivo (IA)', 'Design Premium', 'Carregamento Ultra-rápido'],
        previewUrl: '#'
    },
    {
        id: 'checkout',
        title: 'Checkout de Alta Conversão',
        icon: ShoppingCart,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        description: 'Onde o dinheiro entra. Um checkout limpo, seguro e desenhado para maximizar o ticket médio com Order Bumps e Upsells.',
        features: ['Recuperação de Carrinho', 'One-Click Upsell', 'Pixel Integrado'],
        previewUrl: '#'
    },
    {
        id: 'player',
        title: 'Área de Membros (Nexus Player)',
        icon: PlayCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        description: 'A experiência Netflix. Um player imersivo que mantém o aluno engajado e reduz os pedidos de reembolso.',
        features: ['Continuar de onde parou', 'Mentor IA Integrado', 'Qualidade 4K Adaptativa'],
        previewUrl: '/painel'
    },
    {
        id: 'community',
        title: 'Comunidade & Feed',
        icon: Users,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        description: 'A tribo do seu movimento. Os alunos interagem, tiram dúvidas e se motivam mutuamente.',
        features: ['Feed estilo Rede Social', 'Gamificação de Comentários', 'Moderação Automática'],
        previewUrl: '#'
    },
    {
        id: 'gamification',
        title: 'Sistema de Gamificação',
        icon: Trophy,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        description: 'Vicie seus alunos em estudar. Recompensas, níveis e conquistas que aumentam o LTV e a conclusão do curso.',
        features: ['Ranking de Alunos', 'Medalhas Desbloqueáveis', 'Certificados Automáticos'],
        previewUrl: '#'
    },
    {
        id: 'support',
        title: 'Suporte Inteligente (Mentor IA)',
        icon: MessageSquare,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
        description: 'Seu clone digital. Responde 90% das dúvidas dos alunos instantaneamente, 24/7.',
        features: ['Treinado no seu Método', 'Atendimento Humanizado', 'Escala Infinita'],
        previewUrl: '#'
    },
    {
        id: 'biotracker',
        title: 'Bio-Tracker (Nicho Saúde)',
        icon: Activity,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        description: 'Ferramenta exclusiva para nichos de emagrecimento e fitness. Acompanha a evolução física do aluno.',
        features: ['Gráficos de Peso', 'Calculadora de Macros', 'Diário Alimentar'],
        previewUrl: '#'
    },
    {
        id: 'moodtracker',
        title: 'Diário Emocional (Nicho Terapia)',
        icon: HeartPulse,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        description: 'Ferramenta para nichos de saúde mental. Monitoramento de humor e exercícios de TCC.',
        features: ['Registro de Humor', 'Exercícios de Respiração', 'Botão de SOS'],
        previewUrl: '#'
    }
];

export const BonusSchoolsPreview: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center px-8 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                        <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wider">Ecossistema Mestre</h1>
                        <p className="text-[10px] text-gray-400 font-medium">Sua escola completa em um só lugar</p>
                    </div>
                </div>
                <Button onClick={() => window.close()} variant="ghost" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Fechar Preview
                </Button>
            </div>

            <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block py-1 px-4 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-widest mb-4"
                    >
                        Bônus Exclusivo
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 uppercase leading-tight"
                    >
                        Muito Mais que um Curso. <br /> <span className="text-purple-500">Uma Plataforma Completa.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Ao adquirir o Mestre nos Negócios, você não recebe apenas videoaulas. Você recebe um ecossistema tecnológico inteiro pronto para escalar seu infoproduto.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SCHOOL_PAGES.map((page, idx) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className={`group relative bg-gray-900 border ${page.borderColor} rounded-3xl p-8 hover:bg-gray-800 transition-all hover:scale-[1.02] hover:shadow-2xl overflow-hidden`}
                        >
                            <div className={`absolute top-0 right-0 p-32 ${page.bgColor} opacity-20 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-30`}></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-14 h-14 ${page.bgColor} rounded-2xl flex items-center justify-center mb-6 border ${page.borderColor} group-hover:scale-110 transition-transform`}>
                                    <page.icon className={`w-7 h-7 ${page.color}`} />
                                </div>

                                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">{page.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-grow">{page.description}</p>

                                <div className="space-y-3 mb-8">
                                    {page.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle className={`w-4 h-4 ${page.color}`} />
                                            <span className="text-xs text-gray-300 font-bold">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => page.previewUrl !== '#' && window.open(page.previewUrl, '_blank')}
                                    disabled={page.previewUrl === '#'}
                                    className={`w-full py-4 text-xs font-black uppercase tracking-widest ${page.previewUrl === '#' ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {page.previewUrl === '#' ? 'Em Breve' : 'Ver ao Vivo'} <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-black text-white uppercase mb-8">E cada nicho tem suas ferramentas exclusivas...</h3>
                    <div className="flex flex-wrap justify-center gap-4 opacity-50">
                        {['Nutrição', 'Fitness', 'Psicologia', 'Finanças', 'Idiomas', 'Marketing'].map(n => (
                            <span key={n} className="px-6 py-3 rounded-full border border-gray-700 text-gray-400 text-sm font-bold uppercase">{n}</span>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
