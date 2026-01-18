
import React, { useState } from 'react';
import { BookOpen, CheckCircle, Clock, Plus, Zap, Search, Bookmark, ChevronRight, X } from '../Icons';
import Button from '../Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Book {
    id: number;
    title: string;
    author: string;
    totalPages: number;
    currentPage: number;
    status: 'Lendo' | 'Lido' | 'Pausado';
    lastReadDate?: string;
}

export const IntellectLogCard: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([
        { id: 1, title: "Hábitos Atômicos", author: "James Clear", totalPages: 320, currentPage: 208, status: "Lendo", lastReadDate: "Hoje" },
        { id: 2, title: "Essencialismo", author: "Greg McKeown", totalPages: 270, currentPage: 270, status: "Lido", lastReadDate: "Ontem" }
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Form States
    const [newTitle, setNewTitle] = useState("");
    const [newTotalPages, setNewTotalPages] = useState("");
    const [readingPage, setReadingPage] = useState("");
    const [readingNotes, setReadingNotes] = useState("");

    const handleAddBook = () => {
        if (!newTitle || !newTotalPages) return;
        const newBook: Book = {
            id: Date.now(),
            title: newTitle,
            author: "Autor Desconhecido", // Simplified for now
            totalPages: parseInt(newTotalPages),
            currentPage: 0,
            status: "Lendo",
            lastReadDate: "Hoje"
        };
        setBooks([...books, newBook]);
        setNewTitle("");
        setNewTotalPages("");
        setIsAdding(false);
    };

    const handleUpdateProgress = () => {
        if (!selectedBook || !readingPage) return;
        const newPage = parseInt(readingPage);

        const updatedBooks = books.map(b => {
            if (b.id === selectedBook.id) {
                const isFinished = newPage >= b.totalPages;
                return {
                    ...b,
                    currentPage: newPage > b.totalPages ? b.totalPages : newPage,
                    status: isFinished ? "Lido" : "Lendo",
                    lastReadDate: "Hoje"
                };
            }
            return b;
        });

        setBooks(updatedBooks as Book[]);
        setSelectedBook(null);
        setReadingPage("");
        setReadingNotes("");
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 relative">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic">Intelecto & Estudos</h2>
                            <p className="text-gray-400 text-sm">Gerencie seu progresso página por página.</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsAdding(!isAdding)} className="!py-2 !px-4 text-xs !bg-yellow-500 hover:!bg-yellow-400 !text-black font-black uppercase shadow-lg shadow-yellow-500/20">
                        {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isAdding ? "Cancelar" : "Novo Livro"}
                    </Button>
                </div>

                {/* Add Book Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 ml-2">Título do Livro</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Ex: O Poder do Hábito"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 ml-2">Total de Páginas</label>
                                    <input
                                        type="number"
                                        value={newTotalPages}
                                        onChange={(e) => setNewTotalPages(e.target.value)}
                                        placeholder="000"
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <Button onClick={handleAddBook} className="w-full !py-3 !bg-blue-600 hover:!bg-blue-500 font-bold">
                                        Começar Leitura
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reading Session Modal (Overlay within card) */}
                <AnimatePresence>
                    {selectedBook && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-gray-900 z-20 rounded-[2.5rem] p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedBook.title}</h3>
                                    <p className="text-sm text-gray-400">Atualizar Progresso de Leitura</p>
                                </div>
                                <Button onClick={() => setSelectedBook(null)} className="!p-2 bg-gray-800 hover:bg-gray-700">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex-1 flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                        <p className="text-xs text-gray-500 mb-1">Página Atual</p>
                                        <p className="text-2xl font-black text-white">{selectedBook.currentPage}</p>
                                    </div>
                                    <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                        <p className="text-xs text-gray-500 mb-1">Meta / Total</p>
                                        <p className="text-2xl font-black text-gray-400">{selectedBook.totalPages}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-blue-400 ml-1">Li hoje até a página:</label>
                                    <input
                                        type="number"
                                        value={readingPage}
                                        onChange={(e) => setReadingPage(e.target.value)}
                                        placeholder={selectedBook.currentPage.toString()}
                                        className="w-full bg-gray-800 border-2 border-blue-500/20 rounded-2xl px-6 py-4 text-3xl font-black text-white outline-none focus:border-blue-500 transition-colors"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 ml-1">Insight / Resumo do dia (Opcional)</label>
                                    <textarea
                                        value={readingNotes}
                                        onChange={(e) => setReadingNotes(e.target.value)}
                                        placeholder="O que você aprendeu com essas páginas?"
                                        className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl p-4 text-gray-300 outline-none focus:border-blue-500/50 resize-none h-24"
                                    />
                                </div>

                                <Button onClick={handleUpdateProgress} className="w-full mt-auto !bg-green-500 hover:!bg-green-400 !text-black font-black uppercase">
                                    Salvar Sessão
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Book List */}
                <div className="grid grid-cols-1 gap-4">
                    {books.map(book => {
                        const progress = Math.round((book.currentPage / book.totalPages) * 100);
                        return (
                            <div
                                key={book.id}
                                onClick={() => setSelectedBook(book)}
                                className="bg-gray-950/30 border border-gray-800 p-5 rounded-3xl flex items-center gap-5 cursor-pointer hover:border-blue-500/50 hover:bg-gray-900 transition-all group relative overflow-hidden"
                            >
                                {/* Status Tag - Corner Positioned */}
                                <div className="absolute top-0 right-0 p-3">
                                    {book.status === 'Lendo' && <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-wider">Lendo</span>}
                                    {book.status === 'Lido' && <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-wider">Concluído</span>}
                                    {book.status === 'Pausado' && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg font-black uppercase tracking-wider">Abandonado</span>}
                                </div>

                                {/* Book Icon/Cover Placeholder */}
                                <div className={`w-14 h-16 rounded-lg shadow-lg flex items-center justify-center shrink-0 mt-1 ${book.status === 'Lido' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                    {book.status === 'Lido' ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                </div>

                                <div className="flex-1 min-w-0 pr-12">
                                    <div className="mb-2">
                                        {/* No Truncate - Full Title */}
                                        <h3 className="font-bold text-white text-sm leading-tight mb-1">{book.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-400 font-mono">
                                            {book.currentPage} <span className="text-gray-600">/</span> {book.totalPages}
                                        </span>
                                        <span className="text-[10px] text-gray-600">•</span>
                                        <span className="text-[10px] text-gray-500">{book.lastReadDate}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${book.status === 'Lido' ? 'bg-green-500' : book.status === 'Pausado' ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
