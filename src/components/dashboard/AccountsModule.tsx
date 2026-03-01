import React from 'react';
import { Plus, CheckCircle2, Clock, Trash2, Pencil } from 'lucide-react';
import { Card, Button } from '../ui';
import { cn } from '../../utils';
import { formatCurrency, sumAmounts } from '../../utils/financialUtils';
import { Account } from '../../types';

interface AccountsModuleProps {
    accounts: Account[];
    activeTab: 'fixas' | 'variaveis';
    setActiveTab: (tab: 'fixas' | 'variaveis') => void;
    onAddAccount: () => void;
    onEditAccount: (account: Account) => void;
    onDeleteAccount: (id: string | number) => void;
    onToggleStatus: (id: string | number) => void;
}

export const AccountsModule: React.FC<AccountsModuleProps> = ({
    accounts,
    activeTab,
    setActiveTab,
    onAddAccount,
    onEditAccount,
    onDeleteAccount,
    onToggleStatus
}) => {
    const filteredAccounts = accounts.filter(acc => acc.type === activeTab);

    const pendingCount = filteredAccounts.filter(a => a.status === 'pending').length;
    const paidCount = filteredAccounts.filter(a => a.status === 'paid').length;
    const catTotal = sumAmounts(filteredAccounts.map(a => a.amount));

    const allPending = accounts.filter(a => a.status === 'pending');
    const totalPendingAll = sumAmounts(allPending.map(a => a.amount));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white dark:bg-[#1E1E1E]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total {activeTab === 'fixas' ? 'Fixas' : 'Variáveis'}</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(catTotal)}</span>
                </Card>
                <Card className="p-4 bg-white dark:bg-[#1E1E1E] border-l-4 border-l-red-500">
                    <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">Total Pendente (Geral)</span>
                    <span className="text-xl font-bold text-red-500">{formatCurrency(totalPendingAll)}</span>
                </Card>
                <Card className="p-4 bg-white dark:bg-[#1E1E1E]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Pendentes ({activeTab === 'fixas' ? 'F' : 'V'})</span>
                    <span className="text-xl font-bold text-amber-500">{pendingCount}</span>
                </Card>
                <Card className="p-4 bg-white dark:bg-[#1E1E1E]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Pagas ({activeTab === 'fixas' ? 'F' : 'V'})</span>
                    <span className="text-xl font-bold text-[#00d26a]">{paidCount}</span>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('fixas')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'fixas' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-500"
                        )}
                    >
                        Fixas
                    </button>
                    <button
                        onClick={() => setActiveTab('variaveis')}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'variaveis' ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-500"
                        )}
                    >
                        Variáveis
                    </button>
                </div>

                <Button onClick={onAddAccount} className="bg-[#00d26a] hover:bg-[#00b85c] text-white gap-2">
                    <Plus size={18} />
                    <span>Nova Conta</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccounts.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400 italic">
                        Nenhuma conta registrada nesta categoria.
                    </div>
                ) : (
                    filteredAccounts.map((acc) => (
                        <Card key={acc.id} className="p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 font-medium mb-1">{acc.category}</span>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{acc.name}</h4>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                    acc.status === 'paid' ? "bg-[#00d26a]/10 text-[#00d26a]" : "bg-amber-500/10 text-amber-500"
                                )}>
                                    {acc.status === 'paid' ? 'Paga' : 'Pendente'}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Vencimento: dia {acc.dueDate}</span>
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{formatCurrency(acc.amount)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onToggleStatus(acc.id)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all shadow-sm active:scale-95",
                                            acc.status === 'paid' ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-[#00d26a]/10 text-[#00d26a] hover:bg-[#00d26a]/20"
                                        )}
                                        title={acc.status === 'paid' ? "Marcar como pendente" : "Marcar como paga"}
                                    >
                                        {acc.status === 'paid' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                                    </button>
                                    <button onClick={() => onEditAccount(acc)} className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl shadow-sm active:scale-95">
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => onDeleteAccount(acc.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl shadow-sm active:scale-95">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
