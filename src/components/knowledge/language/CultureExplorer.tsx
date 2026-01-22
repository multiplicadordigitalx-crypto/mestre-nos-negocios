import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Coffee, Shirt, DollarSign, ArrowLeft, Star, Crown, ShieldCheck, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { consumeCredits, getToolCosts } from '../../../services/mockFirebase';
import { InsufficientFundsAlert } from './InsufficientFundsAlert';
import { StudentPage } from '../../../types';

type ObjectiveType = 'BUSINESS' | 'TRAVEL' | 'ACADEMIC';
type RegionType = 'ALL' | 'NAM' | 'SAM' | 'EUR' | 'ASI' | 'AFR' | 'OCE' | 'MDE';

const REGIONS: { id: RegionType; label: string }[] = [
    { id: 'ALL', label: 'Todas' },
    { id: 'NAM', label: 'América do Norte' },
    { id: 'SAM', label: 'América do Sul' },
    { id: 'EUR', label: 'Europa' },
    { id: 'ASI', label: 'Ásia' },
    { id: 'MDE', label: 'Oriente Médio' },
    { id: 'AFR', label: 'África' },
    { id: 'OCE', label: 'Oceania' },
];

interface CityData {
    id: string;
    name: string;
    country: string;
    region: RegionType;
    image: string;
    tips: {
        [key in ObjectiveType]: {
            category: string;
            icon: React.ElementType;
            content: string;
        }[];
    };
}

const OBJECTIVES: { id: ObjectiveType; label: string }[] = [
    { id: 'BUSINESS', label: 'Carreira & Negócios' },
    { id: 'TRAVEL', label: 'Viagens & Turismo' },
    { id: 'ACADEMIC', label: 'Intercâmbio & Estudos' }
];

const CITIES: CityData[] = [
    {
        id: 'ny',
        name: 'New York',
        country: 'United States',
        region: 'NAM',
        image: 'from-blue-900 to-indigo-900',
        tips: {
            'BUSINESS': [
                { category: 'Etiqueta de Negócios', icon: Crown, content: "Tempo é dinheiro. Seja direto, pontual e firme no aperto de mão." },
                { category: 'Dress Code', icon: Shirt, content: "Business Professional em finanças/direito; Business Casual em tech." },
                { category: 'Reuniões', icon: Coffee, content: "Chegue 5 min antes. Pequenas conversas são breves. Vá direto ao ponto." }
            ],
            'TRAVEL': [
                { category: 'Gorjetas (Tipping)', icon: DollarSign, content: "Obrigatório. 20-25% em restaurantes. $1/drink em bares." },
                { category: 'Metrô', icon: MapPin, content: "Use o OMNY (pagamento por aproximação). Evite vagões vazios (tem motivo)." },
                { category: 'Segurança', icon: Star, content: "Times Square é segura, mas cuidado com 'pickpockets' em multidões." }
            ],
            'ACADEMIC': [
                { category: 'Bibliotecas', icon: Globe, content: "NY Public Library é icônica, mas as bibliotecas das universidades exigem ID." },
                { category: 'Moradia', icon: MapPin, content: "Dorms são comuns. Dividir apto (roommates) é a norma fora do campus." },
                { category: 'Visto', icon: Crown, content: "Mantenha seu I-20 sempre atualizado. Trabalhar fora do campus é restrito." }
            ]
        }
    },
    {
        id: 'tor',
        name: 'Toronto',
        country: 'Canada',
        region: 'NAM',
        image: 'from-red-600 to-white',
        tips: {
            'BUSINESS': [
                { category: 'Polidez', icon: Crown, content: "Canadenses são educados. Ser agressivo em negociações pode sair pela culatra." },
                { category: 'Diversidade', icon: Globe, content: "Uma das cidades mais multiculturais. Respeito à diversidade é mandatório." },
                { category: 'Café', icon: Coffee, content: "Tim Hortons é um ícone nacional para cafés rápidos e informais." }
            ],
            'TRAVEL': [
                { category: 'PATH', icon: MapPin, content: "Explore a cidade subterrânea (PATH) no inverno para fugir do frio." },
                { category: 'Gorjeta', icon: DollarSign, content: "15-20% é o padrão. Serviço não está incluído na conta." },
                { category: 'Natureza', icon: Star, content: "Niagara Falls fica a uma curta viagem de distância. Vale o passeio." }
            ],
            'ACADEMIC': [
                { category: 'UofT', icon: Brain, content: "Universidade de Toronto é top global. Campus lindo no centro da cidade." },
                { category: 'Trabalho', icon: Crown, content: "Estudantes podem trabalhar 20h/semana. O mercado é receptivo." },
                { category: 'Segurança', icon: ShieldCheck, content: "Muito segura para estudantes internacionais." }
            ]
        }
    },
    {
        id: 'mex',
        name: 'Mexico City',
        country: 'Mexico',
        region: 'NAM',
        image: 'from-green-600 to-red-600',
        tips: {
            'BUSINESS': [
                { category: 'Hierarquia', icon: Crown, content: "Títulos (Licenciado, Ingeniero) são importantes. Use-os." },
                { category: 'Almoço', icon: Coffee, content: "Negócios acontecem no almoço, que pode durar horas (sobremesa inclusa)." },
                { category: 'Relacionamento', icon: Star, content: "Conexão pessoal é vital. Pergunte sobre a família antes dos negócios." }
            ],
            'TRAVEL': [
                { category: 'Museus', icon: Globe, content: "Tem mais museus que a maioria das cidades globais. Antropologia é obrigatório." },
                { category: 'Uber', icon: ShieldCheck, content: "Use Uber ou táxis oficiais de sitio. Evite pegar táxi na rua." },
                { category: 'Altitude', icon: MapPin, content: "A cidade é alta. Beba muita água e pegue leve nos primeiros dias." }
            ],
            'ACADEMIC': [
                { category: 'UNAM', icon: Brain, content: "Campus gigante e patrimônio da UNESCO. O coração intelectual do país." },
                { category: 'Custo', icon: DollarSign, content: "Custo de vida acessível para estudantes, com ótima comida de rua." },
                { category: 'Espanhol', icon: Globe, content: "Melhor lugar para aprender espanhol neutro e claro." }
            ]
        }
    },
    {
        id: 'mia',
        name: 'Miami',
        country: 'United States',
        region: 'NAM',
        image: 'from-pink-500 to-cyan-500',
        tips: {
            'BUSINESS': [
                { category: 'Latam Hub', icon: Globe, content: "A capital de negócios da América Latina. Espanhol é tão útil quanto inglês." },
                { category: 'Estilo', icon: Shirt, content: "Business Casual focado no clima quente. Linho é aceitável." },
                { category: 'Networking', icon: Coffee, content: "Eventos sociais e jantares são chave para fechar negócios." }
            ],
            'TRAVEL': [
                { category: 'Arte', icon: Star, content: "Wynwood Walls e Art Basel são imperdíveis para amantes de arte." },
                { category: 'Carro', icon: MapPin, content: "Transporte público é limitado. Alugar carro é quase obrigatório." },
                { category: 'Clima', icon: Zap, content: "Verão é muito úmido e época de furacões. Inverno é perfeito." }
            ],
            'ACADEMIC': [
                { category: 'UMiami', icon: Brain, content: "Forte em medicina e negócios. Campus tropical lindo." },
                { category: 'Diversão', icon: Star, content: "Equilibrar estudo e festas é o desafio. A vida noturna é intensa." },
                { category: 'Custo', icon: DollarSign, content: "Moradia é cara. Procure roommates cedo." }
            ]
        }
    },
    {
        id: 'ldn',
        name: 'London',
        country: 'United Kingdom',
        region: 'EUR',
        image: 'from-red-900 to-blue-900',
        tips: {
            'BUSINESS': [
                { category: 'Etiqueta', icon: Crown, content: "Polidez excessiva é comum. 'Interesting' pode significar 'Ruim'. Leia nas entrelinhas." },
                { category: 'Pub Culture', icon: Coffee, content: "Networking acontece no Pub. Pague uma rodada ('round') se pagarem para você." },
                { category: 'Pontualidade', icon: Star, content: "Extremamente valorizada. Atrasos são vistos como desrespeito." }
            ],
            'TRAVEL': [
                { category: 'Transporte', icon: MapPin, content: "O Tube (metrô) é caro. Use Contactless. 'Mind the Gap' sempre." },
                { category: 'Polidez', icon: Crown, content: "Sempre diga 'Sorry', mesmo se alguém esbarrar em você. Fique à direita na escada rolante." },
                { category: 'Clima', icon: Shirt, content: "Camadas (Layers) são essenciais. Chove a qualquer momento, tenha um guarda-chuva." }
            ],
            'ACADEMIC': [
                { category: 'Ensino', icon: Globe, content: "Muito foco em estudo independente e leitura. Menos horas de aula, mais pesquisa." },
                { category: 'Student Discounts', icon: DollarSign, content: "Use o UNiDAYS ou Student Beans para descontos em tudo." },
                { category: 'NHS', icon: Star, content: "Registre-se num GP (General Practitioner) assim que chegar." }
            ]
        }
    },
    {
        id: 'tky',
        name: 'Tokyo',
        country: 'Japan',
        region: 'ASI',
        image: 'from-pink-900 to-red-900',
        tips: {
            'BUSINESS': [
                { category: 'Meishi (Cartões)', icon: Crown, content: "Entregue/receba com as duas mãos. Leia com reverência. Nunca escreva nele." },
                { category: 'Hierarquia', icon: Star, content: "Respeite a senioridade. Decisões são tomadas em grupo (Consenso)." },
                { category: 'Nomikai', icon: Coffee, content: "Beber com colegas após o trabalho é essencial para fortalecer laços." }
            ],
            'TRAVEL': [
                { category: 'Silêncio', icon: Crown, content: "Não fale ao celular no trem. Mantenha o tom de voz baixo em público." },
                { category: 'Lixo', icon: MapPin, content: "Não há lixeiras públicas. Carregue seu lixo com você até o hotel/loja." },
                { category: 'Gorjeta', icon: DollarSign, content: "Nunca dê gorjeta. É considerado ofensivo, como se o serviço precisasse melhorar." }
            ],
            'ACADEMIC': [
                { category: 'Sempai/Kohai', icon: Globe, content: "Respeite os veteranos (Sempai). A relação hierárquica é forte nas universidades." },
                { category: 'Pontualidade', icon: Star, content: "Chegue 10 minutos antes da aula. Atraso é desrespeito ao Sensei." },
                { category: 'Clubes', icon: Coffee, content: "Entre em um 'Circle' (clube estudantil) para fazer amigos japoneses." }
            ]
        }
    },
    {
        id: 'dxb',
        name: 'Dubai',
        country: 'UAE',
        region: 'MDE',
        image: 'from-yellow-700 to-gray-900',
        tips: {
            'BUSINESS': [
                { category: 'Relacionamento', icon: Crown, content: "Confiança pessoal vem antes dos negócios. Aceite chá/café sempre." },
                { category: 'Fim de Semana', icon: Star, content: "A semana de trabalho pode ser Seg-Sex ou Dom-Qui dependendo da empresa." },
                { category: 'Vestimenta', icon: Shirt, content: "Conservadora. Ombros e joelhos cobertos sempre. Evite roupas justas." }
            ],
            'TRAVEL': [
                { category: 'PDA', icon: Crown, content: "Demonstrações públicas de afeto (beijos/abraços) são proibidas e podem gerar multa." },
                { category: 'Álcool', icon: Coffee, content: "Apenas em hotéis e locais licenciados. Nunca na rua ou dirigindo (Tolerância Zero)." },
                { category: 'Ramadan', icon: Star, content: "Não coma, beba ou fume em público durante o dia no mês sagrado." }
            ],
            'ACADEMIC': [
                { category: 'Multiculturalismo', icon: Globe, content: "O ambiente é super internacional. Respeite todas as culturas e religiões." },
                { category: 'Verão', icon: MapPin, content: "O calor é extremo. A vida acontece dentro de ambientes climatizados (Shoppings/Campus)." },
                { category: 'Networking', icon: DollarSign, content: "Excelente lugar para conexões globais. Participe de eventos." }
            ]
        }

    },
    {
        id: 'par',
        name: 'Paris',
        country: 'France',
        region: 'EUR',
        image: 'from-blue-600 to-red-600',
        tips: {
            'BUSINESS': [
                { category: 'Hierarquia', icon: Crown, content: "Respeito formal. Use 'Vous' até ser convidado a usar 'Tu'. O chefe decide." },
                { category: 'Almoço', icon: Coffee, content: "O almoço é sagrado e pode durar 2 horas. Fale sobre cultura, não apenas trabalho." },
                { category: 'Debate', icon: Star, content: "Os franceses amam debater ideias. Descordar educadamente mostra intelecto." }
            ],
            'TRAVEL': [
                { category: 'Metrô', icon: MapPin, content: "Nunca jogue o bilhete fora até sair da estação. Fiscais são comuns." },
                { category: 'Educação', icon: Crown, content: "Sempre diga 'Bonjour' ao entrar em qualquer loja. É rude não dizer." },
                { category: 'Cafés', icon: Coffee, content: "Sente-se de frente para a rua para observar o movimento ('people watching')." }
            ],
            'ACADEMIC': [
                { category: 'Grandes Écoles', icon: Globe, content: "Sistema de elite separado das universidades públicas. O networking é vital." },
                { category: 'Estilo', icon: Shirt, content: "Estudantes se vestem bem. Casual chique é o padrão, mesmo na aula." },
                { category: 'Burocracia', icon: Star, content: "Prepare-se para muita papelada (dossiers). Tenha cópias de tudo." }
            ]
        }
    },
    {
        id: 'rom',
        name: 'Rome',
        country: 'Italy',
        region: 'EUR',
        image: 'from-yellow-600 to-red-700',
        tips: {
            'BUSINESS': [
                { category: 'Aparência', icon: Shirt, content: "'Bella Figura' é tudo. Vista-se impecavelmente bem." },
                { category: 'Atrasos', icon: Coffee, content: "Flexibilidade com horário é comum no sul, mas não abuse." },
                { category: 'Hierarquia', icon: Crown, content: "Respeite os mais velhos e os cargos superiores." }
            ],
            'TRAVEL': [
                { category: 'Café', icon: Coffee, content: "Cappuccino só no café da manhã. Depois das 11h, peça Espresso." },
                { category: 'Igrejas', icon: Star, content: "Ombros cobertos para entrar no Vaticano e igrejas." },
                { category: 'Água', icon: Zap, content: "As fontes (Nasoni) têm água potável e gelada grátis. Leve garrafa." }
            ],
            'ACADEMIC': [
                { category: 'História', icon: Globe, content: "Estudar aqui é viver num museu a céu aberto." },
                { category: 'Burocracia', icon: ShieldCheck, content: "Prepare-se para processos lentos na universidade (Segreteria)." },
                { category: 'Exames', icon: Brain, content: "Muitas provas são orais. Treine sua retórica e confiança." }
            ]
        }
    },
    {
        id: 'mad',
        name: 'Madrid',
        country: 'Spain',
        region: 'EUR',
        image: 'from-orange-600 to-red-600',
        tips: {
            'BUSINESS': [
                { category: 'Sobremesa', icon: Coffee, content: "Negócios se prolongam após o almoço (Sobremesa). Não tenha pressa." },
                { category: 'Agosto', icon: Star, content: "A cidade para em Agosto. Evite marcar reuniões importantes." },
                { category: 'Cumprimento', icon: Crown, content: "Dois beijos no rosto é comum socialmente, aperto de mão em business." }
            ],
            'TRAVEL': [
                { category: 'Jantar', icon: Coffee, content: "Janta-se tarde, depois das 21h ou 22h." },
                { category: 'Siesta', icon: Zap, content: "Lojas pequenas podem fechar à tarde (14h-17h). Shoppings não." },
                { category: 'Museus', icon: Globe, content: "Prado, Reina Sofia e Thyssen formam o Triângulo da Arte." }
            ],
            'ACADEMIC': [
                { category: 'Vida Social', icon: Star, content: "Estudantes vivem na rua (terrazas). Tapas e cañas são baratos." },
                { category: 'IE/ESADE', icon: Brain, content: "Escolas de negócios de classe mundial." },
                { category: 'Transporte', icon: MapPin, content: "Abono Joven dá transporte ilimitado muito barato até 26 anos." }
            ]
        }
    },
    {
        id: 'lis',
        name: 'Lisbon',
        country: 'Portugal',
        region: 'EUR',
        image: 'from-green-600 to-red-600',
        tips: {
            'BUSINESS': [
                { category: 'Relacionamento', icon: Coffee, content: "Portugueses valorizam a confiança e a cortesia. Seja amável." },
                { category: 'Títulos', icon: Crown, content: "'Doutor' e 'Engenheiro' são usados formalmente. Pergunte como preferem." },
                { category: 'Café', icon: Coffee, content: "Convite para café é um ótimo sinal. Aceite sempre." }
            ],
            'TRAVEL': [
                { category: 'Sapatos', icon: Shirt, content: "Calçada portuguesa é linda mas escorregadia. Use sapatos confortáveis." },
                { category: 'Elétrico', icon: MapPin, content: "O bonde 28 é turístico. Cuidado com batedores de carteira." },
                { category: 'Jantar', icon: Coffee, content: "Restaurantes fecham cozinha as 15h e reabrem as 19h." }
            ],
            'ACADEMIC': [
                { category: 'Acolhimento', icon: Star, content: "Brasileiros são muito bem-vindos, mas adapte-se ao vocabulário local." },
                { category: 'Praxe', icon: Brain, content: "Trotes universitários (Praxe) são tradicionais. Participe se quiser." },
                { category: 'Custo', icon: DollarSign, content: "Uma das capitais mais baratas da Europa Ocidental." }
            ]
        }
    },
    {
        id: 'ams',
        name: 'Amsterdam',
        country: 'Netherlands',
        region: 'EUR',
        image: 'from-orange-500 to-blue-500',
        tips: {
            'BUSINESS': [
                { category: 'Direto', icon: Zap, content: "Holandeses são diretos e honestos. Não se ofenda com críticas." },
                { category: 'Consenso', icon: Crown, content: "Modelo Polder. Todos devem concordar antes de avançar." },
                { category: 'Agenda', icon: Star, content: "Marque reuniões com semanas de antecedência. Tudo é planejado." }
            ],
            'TRAVEL': [
                { category: 'Bike', icon: MapPin, content: "Cuidado ao andar. Ciclovias são para bicicletas, não pedestres." },
                { category: 'Cartões', icon: DollarSign, content: "Muitos lugares só aceitam cartão de débito Maestro (V-Pay). Tenha cash." },
                { category: 'Coffeeshop', icon: Coffee, content: "Coffeeshops vendem maconha. Cafés vendem café." }
            ],
            'ACADEMIC': [
                { category: 'Inglês', icon: Globe, content: "Quase todos falam inglês perfeito. Fácil adaptação." },
                { category: 'Moradia', icon: ShieldCheck, content: "Crise habitacional severa. Comece a procurar meses antes." },
                { category: 'Notas', icon: Brain, content: "Tirar 10 é quase impossível. 6-7 é uma nota boa." }
            ]
        }
    },
    {
        id: 'ber',
        name: 'Berlin',
        country: 'Germany',
        region: 'EUR',
        image: 'from-yellow-500 to-black',
        tips: {
            'BUSINESS': [
                { category: 'Direto ao Ponto', icon: Crown, content: "Eficiência é chave. Small talk é mínimo. Seja claro e factual." },
                { category: 'Títulos', icon: Star, content: "Use títulos acadêmicos (Doktor, Professor) se existirem. É sinal de respeito." },
                { category: 'Planejamento', icon: Coffee, content: "Tudo é agendado com antecedência. Improvisos são mal vistos." }
            ],
            'TRAVEL': [
                { category: 'Transporte', icon: MapPin, content: "Não há catracas, mas valide o bilhete na máquina antes de entrar. Multas pesadas." },
                { category: 'Dinheiro', icon: DollarSign, content: "Muitos lugares ('Cash only') não aceitam cartão. Tenha Euros sempre." },
                { category: 'Reciclagem', icon: Globe, content: "O sistema 'Pfand' devolve dinheiro ao retornar garrafas plásticas/vidro." }
            ],
            'ACADEMIC': [
                { category: 'Autonomia', icon: Brain, content: "Espera-se que você estude sozinho. Ninguém vai cobrar presença." },
                { category: 'Mensa', icon: Coffee, content: "Restaurantes universitários baratos e bons. Use o cartão de estudante." },
                { category: 'WG (República)', icon: MapPin, content: "Dividir apartamento (Wohngemeinschaft) é a forma mais comum de morar." }
            ]
        }
    },
    {
        id: 'shg',
        name: 'Shanghai',
        country: 'China',
        region: 'ASI',
        image: 'from-red-600 to-yellow-500',
        tips: {
            'BUSINESS': [
                { category: 'Guanxi', icon: Crown, content: "Relacionamentos pessoais são a base de tudo. Construa confiança antes de vender." },
                { category: 'Face', icon: Star, content: "Nunca faça alguém 'perder a face' (passar vergonha) em público. Critique em privado." },
                { category: 'Banquetes', icon: Coffee, content: "Negócios são fechados no jantar. Prove tudo o que for oferecido." }
            ],
            'TRAVEL': [
                { category: 'Apps', icon: Globe, content: "Instale WeChat e Alipay. Dinheiro e Cartão gringo raramente são usados." },
                { category: 'Internet', icon: Zap, content: "Prepare uma VPN confiável antes de embarcar para acessar Google/Social." },
                { category: 'Transporte', icon: MapPin, content: "O Maglev é o trem mais rápido do mundo conectando o aeroporto." }
            ],
            'ACADEMIC': [
                { category: 'Competição', icon: Star, content: "O ambiente é altamente competitivo ('Gaokao' mentality). Estude muito." },
                { category: 'Língua', icon: Globe, content: "Aprender o básico de Mandarim abre todas as portas, mesmo em cursos em inglês." },
                { category: 'Dormitórios', icon: MapPin, content: "Dorms têm toque de recolher e regras estritas." }
            ]
        }
    },
    {
        id: 'sin',
        name: 'Singapore',
        country: 'Singapore',
        region: 'ASI',
        image: 'from-red-500 to-white',
        tips: {
            'BUSINESS': [
                { category: 'Eficiência', icon: Crown, content: "Tudo funciona. Reuniões começam e terminam na hora exata." },
                { category: 'Meritocracia', icon: Star, content: "Resultados importam mais que conexões. O governo é modelo de gestão." },
                { category: 'Singlish', icon: Globe, content: "Acostume-se com o sotaque local ('Lah', 'Can'). Mas mantenha o inglês formal." }
            ],
            'TRAVEL': [
                { category: 'Regras', icon: ShieldCheck, content: "Não masque chiclete. Não coma no metrô. Multas são reais e altas." },
                { category: 'Hawker Centers', icon: Coffee, content: "Comida de rua segura, barata e com estrelas Michelin. Onde todos comem." },
                { category: 'Clima', icon: Shirt, content: "Quente e úmido o ano todo. Leve roupas leves e guarda-chuva." }
            ],
            'ACADEMIC': [
                { category: 'Excelência', icon: Crown, content: "NUS e NTU são tops mundiais. O nível de exigência é altíssimo." },
                { category: 'Kiasu', icon: Brain, content: "Conceito de 'medo de perder'. Estudantes pegam lugares na biblioteca cedo." },
                { category: 'Segurança', icon: Star, content: "Um dos países mais seguros do mundo. Pode estudar até tarde sem medo." }
            ]
        }
    },
    {
        id: 'syd',
        name: 'Sydney',
        country: 'Australia',
        region: 'OCE',
        image: 'from-blue-500 to-indigo-500',
        tips: {
            'BUSINESS': [
                { category: 'Informalidade', icon: Crown, content: "Ambiente relaxado, mas profissional. 'Mate' é usado com colegas, não chefes de início." },
                { category: 'Igualitarismo', icon: Star, content: "A 'Tall Poppy Syndrome' desencoraja quem se acha superior. Seja humilde." },
                { category: 'Work-Life', icon: Coffee, content: "Trabalho duro, mas o fim de semana é sagrado para praia/esporte." }
            ],
            'TRAVEL': [
                { category: 'Sol', icon: Star, content: "O sol é brutal. Use protetor solar fator 50+ sempre. 'Slip, Slop, Slap'." },
                { category: 'Café', icon: Coffee, content: "A cultura do café é séria. Não peça apenas 'café', peça um 'Flat White'." },
                { category: 'Transporte', icon: MapPin, content: "Use o cartão Opal para trens, ônibus e ferries (barcas)." }
            ],
            'ACADEMIC': [
                { category: 'Seminários', icon: Globe, content: "Participação ativa é esperada. Não fique calado na sala de aula." },
                { category: 'BBQ', icon: Coffee, content: "O churrasco australiano ('Barbie') é o principal evento social estudantil." },
                { category: 'Natureza', icon: MapPin, content: "Campus geralmente verdes. Cuidado com a vida selvagem, mas na cidade é tranquilo." }
            ]
        }
    },
    {
        id: 'bue',
        name: 'Buenos Aires',
        country: 'Argentina',
        region: 'SAM',
        image: 'from-blue-400 to-white',
        tips: {
            'BUSINESS': [
                { category: 'Relacionamento', icon: Coffee, content: "Negócios são feitos entre amigos. Jantares longos são comuns." },
                { category: 'Horário', icon: Star, content: "Jantares de negócios começam depois das 21h ou 22h." },
                { category: 'Política', icon: Zap, content: "Evite falar de política e economia local, temas sensíveis." }
            ],
            'TRAVEL': [
                { category: 'Câmbio', icon: DollarSign, content: "Use Western Union ou cartões digitais (Wise) para melhor cotação (Blue)." },
                { category: 'Tango', icon: Crown, content: "Evite shows pega-turista. Vá a uma Milonga para ver o real." },
                { category: 'Jantar', icon: Coffee, content: "Prove o Asado (churrasco) e o vinho Malbec." }
            ],
            'ACADEMIC': [
                { category: 'UBA', icon: Brain, content: "Universidade pública de prestígio e gratuita (inclusive para estrangeiros)." },
                { category: 'Vida Noturna', icon: Star, content: "A cidade respira cultura e vida noturna intensa." },
                { category: 'Portunhol', icon: Globe, content: "Falam rápido e com gírias (Lunfardo). Estude o sotaque." }
            ]
        }
    },
    {
        id: 'scl',
        name: 'Santiago',
        country: 'Chile',
        region: 'SAM',
        image: 'from-red-600 to-blue-600',
        tips: {
            'BUSINESS': [
                { category: 'Formalidade', icon: Crown, content: "Mais formais que o resto da Latam. Use terno e sobrenomes." },
                { category: 'Pontualidade', icon: Star, content: "Valoriza-se a pontualidade, ao contrário de vizinhos." },
                { category: 'Confiança', icon: ShieldCheck, content: "Instituições funcionam bem. Contratos são respeitados." }
            ],
            'TRAVEL': [
                { category: 'Vinho', icon: Coffee, content: "Visite vinícolas no Valle del Maipo, acessíveis de metrô/táxi." },
                { category: 'Montanha', icon: MapPin, content: "No inverno, esquiar no Valle Nevado é um must." },
                { category: 'Terremotos', icon: Zap, content: "O país é sísmico. Mantenha a calma, construções são preparadas." }
            ],
            'ACADEMIC': [
                { category: 'PUC-Chile', icon: Brain, content: "Líder na região. Campus modernos e excelente ensino." },
                { category: 'Custo', icon: DollarSign, content: "Uma das cidades mais caras da América do Sul." },
                { category: 'Modismos', icon: Globe, content: "Espanhol chileno é cheio de gírias ('Cachai?'). Tenha paciência." }
            ]
        }
    },
    {
        id: 'bog',
        name: 'Bogota',
        country: 'Colombia',
        region: 'SAM',
        image: 'from-yellow-500 to-red-600',
        tips: {
            'BUSINESS': [
                { category: 'Formalidade', icon: Crown, content: "Usted é usado sempre. Formalidade e educação são essenciais." },
                { category: 'Café', icon: Coffee, content: "O Tinto (café) é oferecido em toda reunião. Aceite." },
                { category: 'Regiões', icon: Globe, content: "Cultura de Bogotá é diferente de Medellín/Cartagena. Adapte-se." }
            ],
            'TRAVEL': [
                { category: 'Clima', icon: Zap, content: "'A nevera'. Faz frio e chove. Leve casaco e guarda-chuva." },
                { category: 'Museu', icon: Star, content: "Museu do Ouro é impressionante e obrigatório." },
                { category: 'Trânsito', icon: MapPin, content: "O trânsito é caótico. Planeje deslocamentos com folga." }
            ],
            'ACADEMIC': [
                { category: 'Espanhol', icon: Globe, content: "Considerado um dos espanhóis mais claros e neutros do mundo." },
                { category: 'Andes', icon: Brain, content: "Universitat de los Andes é excelente. Campus no centro histórico." },
                { category: 'Segurança', icon: ShieldCheck, content: "Melhorou muito, mas fique atento ('No dar papaya')." }
            ]
        }
    },
    // NOVAS CIDADES (Expansion Pack)
    {
        id: 'sao',
        name: 'São Paulo',
        country: 'Brazil',
        region: 'SAM',
        image: 'from-green-600 to-yellow-500',
        tips: {
            'BUSINESS': [
                { category: 'Ritmo', icon: Zap, content: "Oritmo é frenético, estilo NY. 'Time is money', mas o relacionamento importa." },
                { category: 'Cafézinho', icon: Coffee, content: "Nada se resolve sem um café. É rude recusar." },
                { category: 'Trânsito', icon: MapPin, content: "Considere o trânsito nos agendamentos. Atrasos de 15min são toleráveis, mas evite." }
            ],
            'TRAVEL': [
                { category: 'Gastronomia', icon: Coffee, content: "Capital gastronômica. De coxinha a Michelin, prove tudo." },
                { category: 'Segurança', icon: ShieldCheck, content: "Evite usar celular na rua, especialmente na Av. Paulista e Centro." },
                { category: 'Noite', icon: Star, content: "Vila Madalena para bares, Augusta para alternativos, Itaim para upscale." }
            ],
            'ACADEMIC': [
                { category: 'USP/FGV', icon: Brain, content: "Centros de excelência. A competição acadêmica é alta." },
                { category: 'Networking', icon: Globe, content: "Eventos e palestras acontecem todo dia. Use o LinkedIn intensamente." },
                { category: 'Moradia', icon: MapPin, content: "More perto do metrô. O transporte público é eficiente e essencial." }
            ]
        }
    },
    {
        id: 'cpt',
        name: 'Cape Town',
        country: 'South Africa',
        region: 'AFR',
        image: 'from-yellow-500 to-green-600',
        tips: {
            'BUSINESS': [
                { category: 'Diversidade', icon: Globe, content: "A 'Rainbow Nation' exige sensibilidade cultural. Respeito é fundamental." },
                { category: 'Horário', icon: Crown, content: "Reuniões começam na hora, mas podem se estender. 'African time' é mito em business de alto nível." },
                { category: 'Relacionamento', icon: Coffee, content: "Construir confiança (Trust) leva tempo. Não force vendas imediatas." }
            ],
            'TRAVEL': [
                { category: 'Segurança', icon: ShieldCheck, content: "Evite andar a pé à noite. Use Uber. Mantenha seus pertences seguros." },
                { category: 'Natureza', icon: Star, content: "Table Mountain e praias são imperdíveis. Leve casaco, o vento é forte." },
                { category: 'Vinho', icon: Coffee, content: "Visite as vinícolas de Stellenbosch. Mundialmente famosas e acessíveis." }
            ],
            'ACADEMIC': [
                { category: 'UCT', icon: Brain, content: "University of Cape Town é a melhor da África. Ambiente lindo e histórico." },
                { category: 'Custo', icon: DollarSign, content: "Custo de vida acessível comparado a Europa/EUA." },
                { category: 'Idioma', icon: Globe, content: "Inglês é a língua franca, mas aprender Xhosa básico é um diferencial enorme." }
            ]
        }
    },
    {
        id: 'tlv',
        name: 'Tel Aviv',
        country: 'Israel',
        region: 'MDE',
        image: 'from-blue-400 to-white',
        tips: {
            'BUSINESS': [
                { category: 'Chutzpah', icon: Brain, content: "Ousadia é virtude. Seja assertivo, direto e cuestione o status quo." },
                { category: 'Casual', icon: Shirt, content: "Ninguém usa terno. Jeans e camiseta é o padrão, mesmo com CEOs." },
                { category: 'Agilidade', icon: Zap, content: "Tudo é para ontem. O ecossistema de startups é extremamente veloz." }
            ],
            'TRAVEL': [
                { category: 'Shabbat', icon: Star, content: "Sexta à noite até Sabado à noite quase tudo fecha. Planeje-se." },
                { category: 'Segurança', icon: ShieldCheck, content: "Segurança é visível e rigorosa em shoppings/trens. Coopere sempre." },
                { category: 'Vida Noturna', icon: Coffee, content: "A cidade não dorme. Bares e clubes bombam qualquer dia da semana." }
            ],
            'ACADEMIC': [
                { category: 'Tecnologia', icon: Brain, content: "Foco total em Hi-Tech e inovação. Ótimo para STEM." },
                { category: 'Debate', icon: Globe, content: "Alunos desafiam professores. O debate é encorajado e esperado." },
                { category: 'Isolamento', icon: MapPin, content: "O país é uma ilha política. Viajar para vizinhos pode ser complexo." }
            ]
        }
    }
];

export const CultureExplorer: React.FC<{ onBack?: () => void; navigateTo?: (page: StudentPage) => void }> = ({ onBack, navigateTo }) => {
    const { user, refreshUser } = useAuth();
    const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
    const [selectedObjective, setSelectedObjective] = useState<ObjectiveType>('BUSINESS');
    const [selectedRegion, setSelectedRegion] = useState<RegionType>('ALL');
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingCity, setPendingCity] = useState<CityData | null>(null);
    const [reservedCredits, setReservedCredits] = useState(25); // Default, updates from DB
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    useEffect(() => {
        const loadCost = async () => {
            try {
                const tools = await getToolCosts();
                const vipTool = tools.find(t => t.toolId === 'nexus_culture');
                if (vipTool) {
                    setReservedCredits(vipTool.costPerTask);
                }
            } catch (error) {
                console.error("Failed to load VIP cost");
            }
        };
        loadCost();
    }, []);

    const handleCityClick = (city: CityData) => {
        setPendingCity(city);
        setShowConfirm(true);
    };

    const confirmAccess = async () => {
        if (!user || !pendingCity) return;

        if ((user.creditBalance || 0) < reservedCredits) {
            setShowConfirm(false);
            setShowInsufficientModal(true);
            return;
        }

        console.log("Attempting to consume credits", { uid: user.uid, cost: reservedCredits, city: pendingCity.name });
        const result = await consumeCredits(user.uid, 'nexus_culture', Number(reservedCredits), `VIP Lounge: ${pendingCity.name} (${selectedObjective})`);
        console.log("Consumption result:", result);

        if (result.success) {
            if (refreshUser) refreshUser();
            toast.success("Acesso VIP liberado!", { icon: '🥂' });
            setSelectedCity(pendingCity);
            setShowConfirm(false);
            setPendingCity(null);
        } else {
            console.error("Credit consumption failed:", result);
            toast.error(`Erro ao processar: ${result.error || result.message || 'Desconhecido'}`);
        }
    };

    return (
        <div className="rounded-[2.5rem] shadow-2xl p-4 md:p-6 bg-gray-900 border border-gray-800 h-auto min-h-[500px] flex flex-col relative overflow-hidden">
            {/* Dekor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col gap-6 mb-6 z-10 relative">
                {/* Top Row: Title & Objectives */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {selectedCity ? (
                        <button onClick={() => setSelectedCity(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Voltar ao Mapa</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button onClick={onBack} className="mr-1 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                <Crown className="w-6 h-6 text-pink-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">VIP Lounge</h2>
                                <p className="text-xs text-gray-500">Inteligência Cultural Global</p>
                            </div>
                        </div>
                    )}

                    {/* Objective Selector (Moved to Top Row) */}
                    {!selectedCity && (
                        <div className="flex bg-gray-800/50 p-1 rounded-xl border border-gray-700 w-full md:w-auto overflow-x-auto scrollbar-hide">
                            <div className="flex w-full md:w-auto gap-2 p-1 min-w-max">
                                {OBJECTIVES.map(obj => (
                                    <button
                                        key={obj.id}
                                        onClick={() => setSelectedObjective(obj.id)}
                                        className={`flex-1 md:flex-none px-4 py-2.5 md:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-center ${selectedObjective === obj.id ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                    >
                                        {obj.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Second Row: Region Selector (Full Width) */}
                {!selectedCity && (
                    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2">
                            {REGIONS.map(region => (
                                <button
                                    key={region.id}
                                    onClick={() => setSelectedRegion(region.id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${selectedRegion === region.id
                                        ? 'bg-white text-black border-white'
                                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                                        }`}
                                >
                                    {region.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
                <AnimatePresence mode="wait">
                    {!selectedCity ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {CITIES.filter(c => selectedRegion === 'ALL' || c.region === selectedRegion).map(city => (
                                <motion.div
                                    key={city.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCityClick(city)}
                                    className={`h-32 md:h-40 cursor-pointer rounded-3xl relative overflow-hidden group bg-gradient-to-br ${city.image}`}
                                >
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                    <div className="absolute bottom-6 left-6">
                                        <p className="text-gray-300 text-xs font-bold uppercase trackin-wider mb-1">{city.country}</p>
                                        <h3 className="text-3xl font-black text-white">{city.name}</h3>
                                    </div>
                                    <div className="absolute top-6 right-6 p-2 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="space-y-6"
                        >
                            <div className={`h-32 rounded-3xl bg-gradient-to-r ${selectedCity.image} flex items-center px-8 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-black text-white">{selectedCity.name}</h2>
                                    <p className="text-white/80 font-medium">Guia de Sobrevivência Executiva</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {selectedCity.tips[selectedObjective].map((tip, idx) => (
                                    <div key={idx} className="bg-gray-800/50 border border-gray-700 p-5 rounded-2xl flex gap-4 hover:bg-gray-800 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 border border-gray-700">
                                            <tip.icon className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-pink-400 font-bold text-sm uppercase tracking-wide mb-1">{tip.category}</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">{tip.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* Credit Confirmation Modal */}
            {
                showConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-gray-900 border border-pink-500/30 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <DollarSign className="w-6 h-6 text-pink-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Acessar Guia VIP?</h3>
                                <p className="text-sm text-gray-400">Desbloquear conteúdo cultural de <strong>{pendingCity?.name}</strong>.</p>
                            </div>

                            <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center text-sm">
                                <span className="text-gray-400">Custo:</span>
                                <span className="text-white font-mono font-bold">{reservedCredits} Créditos</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => setShowConfirm(false)} className="flex-1 !bg-gray-800 hover:!bg-gray-700 text-white border border-gray-600">Cancelar</Button>
                                <Button onClick={confirmAccess} className="flex-1 !bg-pink-600 hover:!bg-pink-500 text-white shadow-lg shadow-pink-500/20">Confirmar</Button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Insufficient Funds Modal */}
            <InsufficientFundsAlert
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                onRecharge={() => {
                    setShowInsufficientModal(false);
                    if (navigateTo) navigateTo('recharge');
                    else toast.error("Navegação indisponível");
                }}
            />

            {/* Recharge Modal */}

        </div >
    );
};
