import React from 'react';
import { Search, Filter, Trash2, Pencil, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../utils';
import { formatCurrency } from '../../utils/financialUtils';
import { Transaction } from '../../types';

interface TransactionsModuleProps {
    transactions: Transaction[];
    type?: 'income' | 'expense';
    darkMode?: boolean;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string | number) => void;
    subTab?: string;
    setSubTab?: (tab: any) => void;
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
}

export const TransactionsModule: React.FC<TransactionsModuleProps> = ({
    transactions = [],
    type = 'income',
    darkMode = false,
    onEdit,
    onDelete,
    subTab = '',
    setSubTab = (_: any) => { },
    searchTerm = '',
    setSearchTerm = (_: any) => { }
}) => {
    const isIncome = type === 'income';

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    {isIncome ? (
                        <>
                            <button
                                onClick={() => setSubTab('services')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    subTab === 'services' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Serviços
                            </button>
                            <button
                                onClick={() => setSubTab('products')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    subTab === 'products' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Produtos
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setSubTab('professional')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    subTab === 'professional' ? "bg-white dark:bg-[#2A2A2A] text-red-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Profissional
                            </button>
                            <button
                                onClick={() => setSubTab('personal')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    subTab === 'personal' ? "bg-white dark:bg-[#2A2A2A] text-red-500 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Pessoal
                            </button>
                        </>
                    )}
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar lançamentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00d26a]/20 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-[#1E1E1E] rounded-2xl">
                <div className="overflow-x-auto no-scrollbar scrollbar-hide">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lançamento</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categoria</th>
                                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                                        Nenhum lançamento encontrado para este filtro.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                                    isIncome ? "bg-[#00d26a]/10 text-[#00d26a]" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{t.desc}</span>
                                                    {t.barber && <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t.barber}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.category}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                                                    {isIncome ? t.revenueType : t.expenseType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-xs font-bold text-gray-400">{t.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("font-black text-sm", isIncome ? "text-[#00d26a]" : "text-red-500")}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onEdit(t)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-all active:scale-90">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => onDelete(t.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-90">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
