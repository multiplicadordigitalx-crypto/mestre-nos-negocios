import React, { useState } from 'react';
import { Search, FileText, Download, Briefcase, ChevronRight, Star, Folder, AlertCircle, Eye, Lock, CheckCircle, X } from '../../Icons';
import Button from '../../Button';
import { useAuth } from '../../../hooks/useAuth';
import { useCreditGuard } from '../../../hooks/useCreditGuard'; // Use standardized hook
import toast from 'react-hot-toast';
import { InsufficientFundsAlert } from '../language/InsufficientFundsAlert';
import { StudentPage } from '../../../types';

// Mock Data for the Repository
const MOCK_DOCUMENTS = [
    // Empresarial
    {
        id: 1,
        title: 'Contrato de Constituição de Holding Familiar',
        category: 'Empresarial',
        type: 'DOCX',
        downloads: 1240,
        premium: true,
        price: 5,
        description: 'Estrutura completa para planejamento sucessório e proteção patrimonial. Inclui cláusulas de impenhorabilidade e incomunicabilidade.',
        preview: 'CLÁUSULA PRIMEIRA - DA DENOMINAÇÃO E SEDE\nA sociedade girará sob a denominação social de [NOME DA HOLDING] LTDA., e terá sede e foro na cidade de...'
    },
    {
        id: 5,
        title: 'Acordo de Sócios (Shareholders Agreement)',
        category: 'Empresarial',
        type: 'DOCX',
        downloads: 540,
        premium: true,
        price: 5,
        description: 'Regula a relação entre sócios, prevendo regras de saída (Tag Along/Drag Along), avaliação (Valuation) e resolução de conflitos.',
        preview: 'DO OBJETO\nO presente Acordo tem por objeto regular o exercício do direito de voto nas Reuniões de Sócios, bem como a compra e venda de quotas...'
    },
    { id: 9, title: 'Distrato Social de Sociedade Limitada', category: 'Empresarial', type: 'DOCX', downloads: 310, premium: false, price: 2, description: 'Instrumento para encerramento formal de empresa Ltda com baixa na Junta Comercial.', preview: 'Pelo presente instrumento particular, os abaixo assinados resolvem, de comum acordo, dissolver a sociedade...' },

    // Família
    {
        id: 2,
        title: 'Petição Inicial de Inventário Judicial',
        category: 'Família',
        type: 'DOCX',
        downloads: 850,
        premium: true,
        price: 3,
        description: 'Peça completa para abertura de inventário, com rol de herdeiros, bens e plano de partilha preliminar.',
        preview: 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA DE FAMÍLIA E SUCESSÕES DA COMARCA DE...\n[NOME], [QUALIFICAÇÃO], vem, respeitosamente...'
    },
    { id: 10, title: 'Ação de Alimentos com Pedido Liminar', category: 'Família', type: 'DOCX', downloads: 1100, premium: false, price: 2, description: 'Modelo padrão para solicitação de pensão alimentícia com pedido de fixação provisória.', preview: 'DOS ALIMENTOS PROVISÓRIOS\nNecessário se faz a fixação de alimentos provisórios, no importe de 30% dos rendimentos líquidos...' },

    // Contratos
    { id: 12, title: 'Contrato de Locação Comercial', category: 'Contratos', type: 'DOCX', downloads: 1500, premium: false, price: 2, description: 'Contrato seguro para locação de imóvel comercial, com cláusulas de garantia e renovação.', preview: 'DO PRAZO DA LOCAÇÃO\nA locação terá o prazo de [PRAZO] meses, iniciando-se em [DATA] e terminando em [DATA]...' },

    // Cível
    { id: 13, title: 'Ação Indenizatória por Danos Morais (Negativação)', category: 'Cível', type: 'DOCX', downloads: 1800, premium: true, price: 3, description: 'Peça para casos de inscrição indevida no SPC/Serasa, com pedido de liminar e jurisprudência consolidada.', preview: 'DO DANO MORAL IN RE IPSA\nA jurisprudência do STJ é pacífica no sentido de que a inscrição indevida em cadastros de inadimplentes...' },
];

const CATEGORIES = ['Todos', 'Empresarial', 'Família', 'Cível', 'Penal', 'Trabalhista', 'Bancário', 'Tributário', 'Contratos'];

export const LegalRepository: React.FC<{ onBack: () => void, navigateTo?: (page: StudentPage) => void }> = ({ onBack, navigateTo }) => {
    const { user } = useAuth();
    const { checkAndConsume } = useCreditGuard();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Selection state for Modal
    const [selectedDoc, setSelectedDoc] = useState<typeof MOCK_DOCUMENTS[0] | null>(null);
    const [isConfirmingPurchase, setIsConfirmingPurchase] = useState(false);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);

    const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDocClick = (doc: typeof MOCK_DOCUMENTS[0]) => {
        setSelectedDoc(doc);
    };

    const handlePurchase = async () => {
        if (!selectedDoc) return;

        if ((user?.creditBalance || 0) < selectedDoc.price) {
            setShowInsufficientModal(true);
            return;
        }

        const success = await checkAndConsume('legal_download', `Download: ${selectedDoc.title}`, selectedDoc.price);
        if (success) {
            toast.success(
                <div className='flex flex-col gap-1'>
                    <span className='font-bold'>Download Iniciado!</span>
                    <span className='text-xs'>Arquivo DOCX limpo e sem marcas d'água.</span>
                </div>,
                { duration: 5000, icon: '📄' }
            );
            setIsConfirmingPurchase(false);
            setSelectedDoc(null);
            // Simulate download action here
        }
    };

    return (
        <div className="animate-fade-in bg-gray-900 min-h-[600px] border border-gray-800 rounded-3xl overflow-hidden relative">
            {/* Header / Search Section */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 pb-12">
                <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para o Menu
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-yellow-500/20 p-2 rounded-lg">
                                <Folder className="w-6 h-6 text-yellow-500" />
                            </div>
                            <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Acervo Premium</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Banco de Modelos</h2>
                        <p className="text-gray-400 max-w-xl">
                            Modelos validados e prontos para uso real. Arquivos .docx limpos e editáveis.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl">
                    <input
                        type="text"
                        placeholder="Ex: Contrato de Holding, Inventário, Divórcio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-xl placeholder:text-gray-600"
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 -mt-8 bg-gray-900 rounded-t-[2.5rem] relative z-10 border-t border-gray-800">

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                                ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20'
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => handleDocClick(doc)}
                            className="bg-gray-800/50 border border-gray-700/50 p-4 md:p-5 rounded-2xl flex items-center justify-between group hover:border-yellow-500/30 hover:bg-gray-800 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden relative z-10">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-yellow-500/50 transition-colors flex-shrink-0">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-yellow-500 transition-colors" />
                                </div>
                                <div className="min-w-0 text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 whitespace-nowrap">{doc.category}</span>
                                        {doc.premium && <span className="text-[9px] md:text-[10px] uppercase font-bold text-yellow-500 flex items-center gap-1 whitespace-nowrap"><Star className="w-3 h-3 fill-current" /> Premium</span>}
                                    </div>
                                    <h4 className="font-bold text-white text-xs md:text-sm group-hover:text-yellow-100 transition-colors truncate">{doc.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-500">{doc.downloads} downloads</span>
                                        <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">{doc.price} Créditos</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 rounded-xl bg-gray-700 group-hover:bg-yellow-500 group-hover:text-black transition-colors flex-shrink-0 ml-2 z-10">
                                <Eye className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDocs.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-gray-400 font-bold text-lg">Nenhum modelo encontrado</h3>
                        <p className="text-gray-600 text-sm">Tente buscar por termos mais genéricos como "Contrato" ou "Petição".</p>
                    </div>
                )}
            </div>

            {/* PREVIEW MODAL */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => { setSelectedDoc(null); setIsConfirmingPurchase(false); }}
                                    className="p-2 hover:bg-gray-700 rounded-full transition-colors text-white group"
                                    title="Voltar"
                                >
                                    <ChevronRight className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">{selectedDoc.title}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">{selectedDoc.category}</span>
                                        <span className="text-[10px] text-gray-400">Visualização Protegida</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedDoc(null); setIsConfirmingPurchase(false); }} className="hidden md:block p-2 hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-950/30">

                            {/* Document Viewer */}
                            <div
                                className="bg-white text-black p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl mx-auto min-h-full select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {/* Watermark Effect (Subtle) */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
                                    <div className="rotate-45 text-6xl font-black uppercase text-black whitespace-nowrap">
                                        Visualização • Mestre nos Negócios • Visualização
                                    </div>
                                </div>

                                <div className="font-serif text-lg leading-relaxed space-y-6">
                                    {selectedDoc.preview.split('\n').map((paragraph, index) => (
                                        <p key={index} className="text-justify">{paragraph}</p>
                                    ))}

                                    {/* Simulated Full Content for Preview */}
                                    <div className="opacity-90">
                                        <p className="text-justify">
                                            CLÁUSULA SEGUNDA - DOS OBJETIVOS SOCIAL. A sociedade tem por objeto a administração de bens próprios, bem como a participação em outras sociedades, como sócia, acionista ou quotista.
                                        </p>
                                        <p className="text-justify mt-4">
                                            CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL. O capital social é de R$ 100.000,00 (cem mil reais), dividido em 100.000 (cem mil) quotas de valor nominal de R$ 1,00 (um real) cada uma, totalmente subscritas e integralizadas, em moeda corrente do País.
                                        </p>
                                        <p className="text-justify mt-4">
                                            CLÁUSULA QUARTA - DA ADMINISTRAÇÃO. A administração da sociedade caberá a [NOME DO ADMINISTRADOR], a quem compete a representação da sociedade ativa e passiva, judicial e extrajudicialmente.
                                        </p>
                                        <p className="text-justify mt-4">
                                            PARÁGRAFO ÚNICO. É vedado ao administrador o uso da denominação social em negócios estranhos aos fins sociais, bem como onerar ou alienar bens imóveis da sociedade sem a autorização dos outros sócios.
                                        </p>
                                        <p className="text-justify mt-4">
                                            CLÁUSULA QUINTA - DO FALECIMENTO OU RETIRADA DE SÓCIO. Falecendo ou retirando-se qualquer sócio, a sociedade não se dissolverá, continuando suas atividades com os herdeiros do falecido ou com os sócios remanescentes.
                                        </p>
                                        <p className="text-justify mt-4 text-gray-400 italic text-sm border-t border-gray-300 pt-4 mt-8">
                                            ... Fim da pré-visualização. O documento completo (.docx) contém todas as cláusulas, formatação profissional e sem marcas de proteção.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-6 border-t border-gray-800 bg-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0 z-10">

                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-500/10 p-2 rounded-full">
                                    <Lock className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-white font-bold">Conteúdo Protegido</p>
                                    <p className="text-gray-500 text-xs">Pague com créditos para liberar o arquivo editável.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="text-right hidden md:block">
                                    <span className="text-xs text-gray-400 block uppercase tracking-wider">Investimento</span>
                                    <span className="text-xl font-black text-white">{selectedDoc.price} Créditos</span>
                                </div>

                                {isConfirmingPurchase ? (
                                    <div className="flex items-center gap-3 animate-fade-in-right w-full md:w-auto justify-end">
                                        <span className="text-xs text-red-400 font-bold hidden md:inline">Confirmar?</span>
                                        <Button onClick={handlePurchase} className="flex-1 md:flex-none !bg-green-600 hover:!bg-green-500 !py-3 !px-6 shadow-lg shadow-green-500/20 whitespace-nowrap">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Sim, Baixar
                                        </Button>
                                        <button onClick={() => setIsConfirmingPurchase(false)} className="text-gray-400 hover:text-white text-sm underline px-2">Cancelar</button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setIsConfirmingPurchase(true)} className="w-full md:w-auto !bg-yellow-500 hover:!bg-yellow-400 !text-black !font-bold !py-3 !px-8 shadow-lg shadow-yellow-500/20 whitespace-nowrap">
                                        <Download className="w-5 h-5 mr-2" /> Baixar Doc ({selectedDoc.price} Créditos)
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Note */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-center gap-2 text-center">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <p className="text-[10px] text-gray-500 max-w-lg">
                    <strong>Nota:</strong> Ferramenta baseada em IA. Os modelos servem de auxílio e direção, não substituem consultoria legal oficial.
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
                requiredCredits={selectedDoc?.price || 0}
                currentCredits={user?.creditBalance || 0}
            />
        </div>
    );
};
