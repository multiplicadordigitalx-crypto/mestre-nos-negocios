import React, { useState } from 'react';
import { BookOpen, Search, Bookmark, ChevronLeft } from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';

interface VadeMecumProps {
    onBack: () => void;
}

export const VadeMecum: React.FC<VadeMecumProps> = ({ onBack }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Array<{ title: string; text: string; source: string }>>([]);

    const handleSearch = () => {
        if (!query) return;
        setIsSearching(true);
        // Simulate Search
        setTimeout(() => {
            setIsSearching(false);
            setResults([
                {
                    title: "Art. 1.277 - Código Civil",
                    text: "O proprietário ou o possuidor de um prédio tem o direito de fazer cessar as interferências prejudiciais à segurança, ao sossego e à saúde dos que o habitam, provocadas pela utilização de propriedade vizinha.",
                    source: "Lei nº 10.406/2002"
                },
                {
                    title: "Art. 42 - Lei das Contravenções Penais",
                    text: "Perturbar alguém o trabalho ou o sossego alheios: I – com gritaria ou algazarra; II – exercendo profissão incômoda ou ruidosa... III – abusando de instrumentos sonoros ou sinais acústicos.",
                    source: "Decreto-Lei nº 3.688/1941"
                }
            ]);
        }, 1500);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px] relative">
            {/* Header */}
            <div className="bg-gray-950 p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-2xl">📖</span> Vade Mecum <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded uppercase border border-green-500/30">Semântico</span>
                        </h2>
                        <p className="text-xs text-gray-400">Busque por conceito, não apenas palavras-chave.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col gap-8 max-w-4xl mx-auto w-full">

                {/* Search Box */}
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ex: Vizinho fazendo barulho depois das 22h..."
                        className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl py-5 pl-6 pr-16 text-lg text-white outline-none focus:border-green-500 shadow-xl transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-green-600 hover:bg-green-500 rounded-xl text-white transition-colors"
                    >
                        <Search className={`w-5 h-5 ${isSearching ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {results.length === 0 && !isSearching && (
                        <div className="text-center text-gray-500 mt-20">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Digite uma dúvida jurídica acima para encontrar os artigos de lei relacionados.</p>
                        </div>
                    )}

                    {results.map((res, idx) => (
                        <div key={idx} className="bg-gray-950 border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-green-500 uppercase tracking-wider bg-green-900/20 px-2 py-1 rounded">{res.source}</span>
                                <button className="text-gray-500 hover:text-white"><Bookmark className="w-5 h-5" /></button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{res.title}</h3>
                            <p className="text-gray-300 leading-relaxed font-serif text-lg">"{res.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
