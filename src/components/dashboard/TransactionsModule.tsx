import React from 'react';
import { Search, Filter, Trash2, Pencil, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../utils';
import { formatCurrency } from '../../utils/financialUtils';
import { Transaction } from '../../types';

interface TransactionsModuleProps {
    transactions: Transaction[];
    type: 'income' | 'expense';
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string | number) => void;
    subTab: string;
    setSubTab: (tab: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const TransactionsModule: React.FC<TransactionsModuleProps> = ({
    transactions,
    type,
    onEdit,
    onDelete,
    subTab,
    setSubTab,
    searchTerm,
    setSearchTerm
}) => {
    const isIncome = type === 'income';

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {isIncome ? (
                        <>
                            <button
                                onClick={() => setSubTab('services')}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    subTab === 'services' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Serviços
                            </button>
                            <button
                                onClick={() => setSubTab('products')}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    subTab === 'products' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    subTab === 'professional' ? "bg-white dark:bg-[#2A2A2A] text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Profissional
                            </button>
                            <button
                                onClick={() => setSubTab('personal')}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    subTab === 'personal' ? "bg-white dark:bg-[#2A2A2A] text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00d26a]/20 outline-none transition-all"
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-[#1E1E1E]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lançamento</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                        Nenhum lançamento encontrado para este filtro.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    isIncome ? "bg-[#00d26a]/10 text-[#00d26a]" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                </div>
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">{t.desc}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{t.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{t.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("font-bold", isIncome ? "text-[#00d26a]" : "text-red-500")}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onEdit(t)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => onDelete(t.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
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
