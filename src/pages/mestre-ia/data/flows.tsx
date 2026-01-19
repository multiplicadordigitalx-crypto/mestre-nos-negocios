
import React from 'react';
import {
  Briefcase, Zap, FileText, Image, Film, Globe, Facebook, Google,
  Music, Youtube, Users, Mail, MessageCircle, Star, Video, Target,
  ShoppingBag, PenTool, Layout, ShieldCheck, Search
} from '../../../components/Icons';

export const FLOWS_CONFIG = [
  {
    id: 'mestre_dos_negocios',
    title: 'Mestre dos Negócios (Consultoria Estratégica)',
    emoji: '👔',
    icon: <Briefcase className="w-12 h-12 text-blue-500" />,
    priority: 5,
    subtitle: 'Seu consultor particular que já faturou milhões e te guia passo a passo.',
    modalText: 'Aqui você conversa direto comigo, o Mestre dos Negócios.\n\nEu vejo exatamente onde seu negócio está hoje (faturamento, custo, equipe) e te entrego o próximo passo mais inteligente pra você multiplicar agora mesmo.'
  },
  {
    id: 'vendas_hoje',
    title: 'Quero mais venda Hoje (Planos de Ação)',
    emoji: '💰',
    priority: 5,
    subtitle: 'Campanhas Google + Meta prontas pra rodar em 30 min.',
    modalText: 'Gera campanhas completas de Google e Meta já testadas e validadas que alunos estão rodando e vendo vendas no mesmo dia.'
  },
  {
    id: 'kwai_turbinado',
    title: 'Kwai Turbinado (Automação Viral)',
    emoji: '🔥',
    priority: 5,
    subtitle: 'Explode de views e fatura todos os dias no Kwai com a fórmula de 2025.',
    modalText: 'Gera 30 vídeos prontos pro Kwai (15–60 seg) usando a fórmula exata que está dando 1–15 milhões de views por vídeo em 2025.'
  },
  {
    id: 'infoproduto_apresentacao',
    title: 'Seu InfoProduto e Apresentação PDF (Geração de Ativos)',
    emoji: '📄',
    icon: <FileText className="w-12 h-12 text-indigo-500" />,
    priority: 5,
    subtitle: 'Ebook, apostila ou apresentação que impressiona e vende.',
    modalText: 'Crio seu ebook completo, apostila prática ou apresentação de workshop/mentoria/TCC em minutos.'
  },
  {
    id: 'ugc_piloto_automatico',
    title: 'UGC Vende no Piloto Automático (Roteiros Emocionais)',
    emoji: '🤳',
    priority: 5,
    subtitle: '3 roteiros validados pra vender sem aparecer.',
    modalText: 'Crio 3 roteiros de UGC (25 a 90 segundos) que seguem as 7 perguntas e vendem 24 h no orgânico.'
  },
  {
    id: 'gerador_logomarcas',
    title: 'Gerador de logomarcas (Identidade Visual)',
    emoji: '✒️',
    icon: <PenTool className="w-12 h-12 text-red-600" />,
    priority: 5,
    subtitle: 'Cria sua logo profissional que transmite autoridade e vende só de olhar.',
    modalText: 'Em 30 segundos você recebe 3 opções de logo + slogan seguindo as 7 perguntas de ouro.'
  },
  {
    id: 'landing_page',
    title: 'Criar Página de Vendas (Estruturas de Conversão)',
    emoji: '🚀',
    icon: <Layout className="w-12 h-12 text-purple-600" />,
    priority: 5,
    subtitle: 'Estrutura completa de alta conversão em minutos.',
    modalText: 'Página de vendas inteira pronta que converte frio em cliente pagante. Ideal para perpétuo e lançamentos.'
  },
  {
    id: 'conteudo_viral',
    title: 'Conteúdo que viraliza (Calendários Inteligentes)',
    emoji: '🎬',
    priority: 5,
    subtitle: '30 dias de Reels/TikToks com roteiros prontos.',
    modalText: '30 roteiros prontos de Reels e TikToks que explodem visualizações e vendas orgânicas.'
  },
  {
    id: 'criativos_arts',
    title: 'Criativos e Arts (Design de Posts)',
    emoji: '🎨',
    icon: <Image className="w-12 h-12 text-pink-500" />,
    priority: 5,
    subtitle: 'Artes que fazem a pessoa parar de rolar o feed e comprar.',
    modalText: 'Em 30 segundos você tem 3 artes prontas (feed, stories, carrossel ou anúncio) seguindo as 7 perguntas.'
  },
  {
    id: 'seo_melhorar',
    title: 'Melhorar SEO do meu Site (Otimização técnica)',
    emoji: '📈',
    icon: <Globe className="w-12 h-12 text-green-500" />,
    priority: 5,
    subtitle: 'Coloca seu site no topo do Google em menos de 7 dias.',
    modalText: 'Gera título, meta description, H1–H6, texto otimizado e palavras-chave certas.'
  },
  {
    id: 'ugc_viral_scripts',
    title: 'Criador de Roteiros UGC Viral (Cérebro Emocional)',
    emoji: '🎥',
    icon: <Film className="w-12 h-12 text-yellow-500" />,
    priority: 5,
    subtitle: 'Gera roteiros 100% emocionais que transformam pessoas comuns em influencers.',
    modalText: 'Mapeia as dores reais dos brasileiros e gera histórias de transformação que conectam e vendem.'
  },
  {
    id: 'google_ads_zero',
    title: 'Fazer meu Google ADS do zero (Setup de Tráfego)',
    emoji: '🗂️',
    icon: <Google className="w-12 h-12" />,
    priority: 5,
    subtitle: 'Campanhas completas do zero que trazem cliente no mesmo dia.',
    modalText: 'Crio campanhas Google Ads do zero já testadas que alunos estão rodando e vendo lucro.'
  },
  {
    id: 'meta_ads_zero',
    title: 'Meta Ads do Zero (Setup de Tráfego)',
    emoji: '📱',
    icon: <Facebook className="w-12 h-12 text-blue-500" />,
    priority: 5,
    subtitle: 'Anúncios Meta que param o scroll e vendem desde o primeiro real.',
    modalText: 'Crio anúncios completos do Meta (criativo + copy) que param o scroll imediatamente.'
  },
  {
    id: 'lancamento_perfeito',
    title: 'Lançamento perfeito (Estratégia Passo a Passo)',
    emoji: '🎯',
    priority: 5,
    subtitle: 'Plano completo de lançamento que lota carrinho em menos de 15 dias.',
    modalText: 'Plano passo a passo de lançamento interno ou externo que alunos estão usando pra bater recordes.'
  },
  {
    id: 'influencer_crescimento',
    title: 'Sou Influencer – crescer/reter (Estratégia de Perfil)',
    emoji: '🌟',
    priority: 5,
    subtitle: 'Estratégia completa pra explodir seguidores e vendas como influencer.',
    modalText: 'Estratégia completa pra crescer seguidores reais, engajar e vender todos os dias.'
  },
  {
    id: 'emails_venda',
    title: 'Email Marketing Turbinado (Copies de E-mail)',
    emoji: '📧',
    priority: 5,
    subtitle: 'Cria e e-mails que vendem, recuperam e engajam no automático.',
    modalText: 'Crio seu e-mail completo em segundos (texto puro ou HTML profissional) com foco em conversão.'
  },
  {
    id: 'thumbnails_titulos',
    title: 'Thumbnails e títulos (Aumento de CTR)',
    emoji: '🖼️',
    priority: 5,
    subtitle: 'Thumbnails + títulos que dobram cliques no YouTube e TikTok.',
    modalText: 'Crio designs de thumbnails e títulos magnéticos que aumentam drasticamente sua taxa de cliques.'
  },
  {
    id: 'oferta_irresistivel',
    title: 'Criar ofertas irresistíveis (Psicologia de Venda)',
    emoji: '💎',
    priority: 5,
    subtitle: 'Ofertas que o cliente não consegue dizer não.',
    modalText: 'Crio ofertas completas incluindo preço psicológico, bônus e escassez.'
  },
  {
    id: 'analise_concorrente',
    title: 'Análise de concorrentes (Inteligência Competitiva)',
    emoji: '🔍',
    priority: 5,
    subtitle: 'Descubro exatamente o que seus concorrentes fazem de certo.',
    modalText: 'Analiso seus concorrentes e te mostro como você pode passar na frente com inteligência.'
  },
  {
    id: 'calendario_conteudo',
    title: 'Calendário de conteúdo (Planejamento)',
    emoji: '📅',
    priority: 5,
    subtitle: '90 dias de posts prontos que aquecem e vendem no orgânico.',
    modalText: '90 dias de posts prontos pro feed que aquecem audiência e vendem sem gastar com anúncio.'
  },
  {
    id: 'tiktok_ads',
    title: 'Criar anúncio TikTok Ads (Tráfego Vertical)',
    emoji: '🎵',
    icon: <Music className="w-12 h-12 text-pink-500" />,
    priority: 5,
    subtitle: 'Anúncios TikTok que viralizam e vendem no piloto automático.',
    modalText: 'Crio anúncios TikTok Ads que viralizam e vendem no piloto automático usando as trends atuais.'
  },
  {
    id: 'youtube_zero',
    title: 'YouTube do zero (Criação de Canal)',
    emoji: '▶️',
    icon: <Youtube className="w-12 h-12 text-red-600" />,
    priority: 5,
    subtitle: 'Canal do zero + estratégia pra monetizar em menos de 60 dias.',
    modalText: 'Crio canal do zero + estratégia completa de SEO, roteiros e nicho.'
  },
  {
    id: 'equipe_trafego',
    title: 'Gerenciar equipe de tráfego (Gestão de Squad)',
    emoji: '👥',
    priority: 5,
    subtitle: 'Treina e gerencia sua equipe pra escalar anúncios sem dor.',
    modalText: 'Treino e scripts pra sua equipe de tráfego escalar anúncios com organização máxima.'
  },
  {
    id: 'recuperar_carrinho',
    title: 'Recuperar carrinho (Script de Recuperação)',
    emoji: '🛒',
    priority: 5,
    subtitle: 'Resgata 40–60 % das vendas que o cliente abandonou.',
    modalText: 'Sequências de mensagens persuasivas para recuperar carrinhos abandonados no WhatsApp e E-mail.'
  },
  {
    id: 'whatsapp_1x1',
    title: 'WhatsApp que fecha na hora (Scripts de Fechamento)',
    emoji: '💬',
    icon: <MessageCircle className="w-12 h-12 text-green-500" />,
    priority: 5,
    subtitle: 'Sequências que transformam conversa em venda em minutos.',
    modalText: 'Sequências de WhatsApp que fecham vendas em minutos para atendimento humano ou bot.'
  },
  // ... existing tools ...
  {
    id: 'blindagem_legal',
    title: 'Blindagem Legal para Anúncios (Anti-Bloqueio)',
    emoji: '⚖️',
    icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
    priority: 5,
    subtitle: 'Gera Políticas e Termos obrigatórios para não levar bloqueio no Facebook/Google.',
    modalText: 'Evite bloqueios imediatos. Gera Políticas de Privacidade e Termos de Uso formatados para rodar anúncios com segurança.'
  },
  {
    id: 'raio_x_metricas',
    title: 'Analista de ROI & Métricas (Otimização)',
    emoji: '📊',
    icon: <Search className="w-12 h-12 text-green-500" />,
    priority: 5,
    subtitle: 'Descubra exatamente por que seu anúncio não está vendendo.',
    modalText: 'Você cola suas métricas (CPC, CTR, CPM) e a IA diagnostica o gargalo: se é o criativo, a copy ou a página.'
  }
];

export const FLOW_QUESTIONS: Record<string, any[]> = {
  mestre_dos_negocios: [
    { id: 'revenue', label: 'Quanto você está faturando por mês hoje?', type: 'text', placeholder: 'Ex: R$ 5.000, Zero, R$ 100.000...', required: true },
    { id: 'pain', label: 'Qual seu maior custo ou dor atual?', type: 'textarea', placeholder: 'Ex: Não tenho tempo, custo alto com equipe, não sei vender...', required: true },
    { id: 'investment', label: 'Quanto dinheiro você tem pra investir agora?', type: 'text', placeholder: 'Ex: Zero, R$ 1.000, R$ 10.000...', required: true },
  ],
  blindagem_legal: [
    { id: 'site_name', label: 'Nome do seu Site/Produto', type: 'text', placeholder: 'Ex: Método Mestre dos Negócios', required: true },
    { id: 'site_url', label: 'URL do seu Site', type: 'text', placeholder: 'Ex: www.seusite.com.br', required: true },
    { id: 'contact_email', label: 'E-mail de Suporte', type: 'text', placeholder: 'Ex: contato@seusite.com.br', required: true },
    { id: 'company_details', label: 'CNPJ ou CPF e Endereço (Opcional, mas recomendado)', type: 'textarea', placeholder: 'Para maior credibilidade junto ao Google/Facebook.', required: false }
  ],
  raio_x_metricas: [
    { id: 'platform', label: 'Onde você está anunciando?', type: 'select', options: ['Facebook/Instagram Ads', 'Google/YouTube Ads', 'TikTok Ads'], required: true },
    { id: 'cpc', label: 'Qual seu CPC (Custo por Clique)?', type: 'text', placeholder: 'Ex: R$ 1,50', required: true },
    { id: 'ctr', label: 'Qual seu CTR (Taxa de Cliques)?', type: 'text', placeholder: 'Ex: 0.8% ou 2.5%', required: true },
    { id: 'cpm', label: 'Qual seu CPM (Custo por 1000 imp.)?', type: 'text', placeholder: 'Ex: R$ 25,00', required: true },
    { id: 'conversion_rate', label: 'Taxa de Conversão da Página (Se souber)', type: 'text', placeholder: 'Ex: 1% ou "Não sei"', required: false }
  ],

  // ... outras questões (mantidas conforme sistema original)
};
