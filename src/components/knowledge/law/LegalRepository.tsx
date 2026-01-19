import React, { useState } from 'react';
import { Search, FileText, Download, Briefcase, ChevronRight, Star, Folder } from '../../Icons';
import Button from '../../Button';

// Mock Data for the Repository
const MOCK_DOCUMENTS = [
    // Empresarial
    { id: 1, title: 'Contrato de Constituição de Holding Familiar', category: 'Empresarial', type: 'DOCX', downloads: 1240, premium: true },
    { id: 5, title: 'Acordo de Sócios (Shareholders Agreement)', category: 'Empresarial', type: 'DOCX', downloads: 540, premium: true },
    { id: 9, title: 'Distrato Social de Sociedade Limitada', category: 'Empresarial', type: 'DOCX', downloads: 310, premium: false },

    // Família
    { id: 2, title: 'Petição Inicial de Inventário Judicial', category: 'Família', type: 'DOCX', downloads: 850, premium: true },
    { id: 10, title: 'Ação de Alimentos com Pedido Liminar', category: 'Família', type: 'DOCX', downloads: 1100, premium: false },
    { id: 11, title: 'Minuta de Pacto Antenupcial', category: 'Família', type: 'DOCX', downloads: 420, premium: true },

    // Contratos
    { id: 3, title: 'Contrato de Compra e Venda com Reserva de Domínio', category: 'Contratos', type: 'DOCX', downloads: 620, premium: false },
    { id: 12, title: 'Contrato de Locação Comercial', category: 'Contratos', type: 'DOCX', downloads: 1500, premium: false },

    // Cível
    { id: 4, title: 'Modelo de Contestação Cível Genérica', category: 'Cível', type: 'DOCX', downloads: 2100, premium: false },
    { id: 13, title: 'Ação Indenizatória por Danos Morais (Negativação)', category: 'Cível', type: 'DOCX', downloads: 1800, premium: true },

    // Penal
    { id: 6, title: 'Habeas Corpus Preventivo', category: 'Penal', type: 'DOCX', downloads: 300, premium: false },
    { id: 14, title: 'Pedido de Liberdade Provisória', category: 'Penal', type: 'DOCX', downloads: 450, premium: true },

    // Administrativo
    { id: 7, title: 'Contrato de Prestação de Serviços Advocatícios', category: 'Administrativo', type: 'DOCX', downloads: 5000, premium: false },

    // Processual
    { id: 8, title: 'Recurso de Apelação - Modelo Base', category: 'Processual', type: 'DOCX', downloads: 1200, premium: true },

    // Trabalhista
    { id: 15, title: 'Reclamação Trabalhista (Verbas Rescisórias)', category: 'Trabalhista', type: 'DOCX', downloads: 980, premium: false },

    // Bancário (NEW)
    { id: 16, title: 'Ação Revisional de Juros em Financiamento', category: 'Bancário', type: 'DOCX', downloads: 720, premium: true },
    { id: 17, title: 'Defesa em Ação de Busca e Apreensão', category: 'Bancário', type: 'DOCX', downloads: 650, premium: true },
    { id: 18, title: 'Pedido de Desbloqueio Sisbajud (Conta Salário)', category: 'Bancário', type: 'DOCX', downloads: 410, premium: false },

    // Tributário (NEW)
    { id: 19, title: 'Exceção de Pré-Executividade em Execução Fiscal', category: 'Tributário', type: 'DOCX', downloads: 380, premium: true },
    { id: 20, title: 'Mandado de Segurança para Compensação Tributária', category: 'Tributário', type: 'DOCX', downloads: 290, premium: true },
    { id: 21, title: 'Ação Anulatória de Débito Fiscal', category: 'Tributário', type: 'DOCX', downloads: 310, premium: false },

    // Previdenciário (NEW)
    { id: 22, title: 'Petição Inicial Aposentadoria por Invalidez', category: 'Previdenciário', type: 'DOCX', downloads: 890, premium: true },
    { id: 23, title: 'Recurso Administrativo INSS (BPC/LOAS)', category: 'Previdenciário', type: 'DOCX', downloads: 670, premium: false },
    { id: 24, title: 'Ação de Concessão de Auxílio-Doença Rural', category: 'Previdenciário', type: 'DOCX', downloads: 520, premium: true },
];

const CATEGORIES = ['Todos', 'Empresarial', 'Família', 'Cível', 'Penal', 'Trabalhista', 'Bancário', 'Tributário', 'Previdenciário', 'Contratos', 'Administrativo'];

export const LegalRepository: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                            Chega de perder tempo formatando do zero. Baixe modelos validados de contratos, petições e inventários completos.
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
                        <div key={doc.id} className="bg-gray-800/50 border border-gray-700/50 p-4 md:p-5 rounded-2xl flex items-center justify-between group hover:border-yellow-500/30 hover:bg-gray-800 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700 group-hover:border-yellow-500/50 transition-colors flex-shrink-0">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-yellow-500 transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 whitespace-nowrap">{doc.category}</span>
                                        {doc.premium && <span className="text-[9px] md:text-[10px] uppercase font-bold text-yellow-400 flex items-center gap-1 whitespace-nowrap"><Star className="w-3 h-3 fill-current" /> Premium</span>}
                                    </div>
                                    <h4 className="font-bold text-white text-xs md:text-sm group-hover:text-yellow-100 transition-colors truncate">{doc.title}</h4>
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1 truncate">{doc.downloads} downloads • Formato {doc.type}</p>
                                </div>
                            </div>
                            <Button className="!p-2 !rounded-xl !bg-gray-700 hover:!bg-yellow-500 hover:text-black transition-colors flex-shrink-0 ml-2">
                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
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
        </div>
    );
};
