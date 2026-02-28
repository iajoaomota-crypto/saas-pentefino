import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { cn } from '../../utils';
import { Transaction, Account, Closing } from '../../types';
import { PAYMENT_METHODS } from '../../constants/config';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (t: Omit<Transaction, 'id'>) => void;
    darkMode: boolean;
    editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen, onClose, onSubmit, darkMode, editingTransaction
}) => {
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [category, setCategory] = useState('PIX');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [revenueType, setRevenueType] = useState<'services' | 'products' | 'courses' | 'other'>('services');
    const [expenseType, setExpenseType] = useState<'Empresa' | 'Pessoal'>('Empresa');
    const [barber, setBarber] = useState('');

    useEffect(() => {
        if (editingTransaction) {
            setDesc(editingTransaction.desc);
            setAmount(editingTransaction.amount.toString());
            setType(editingTransaction.type);
            setCategory(editingTransaction.category);
            setDate(editingTransaction.date.split('/').reverse().join('-'));
            setRevenueType(editingTransaction.revenueType || 'services');
            setExpenseType(editingTransaction.expenseType || 'Empresa');
            setBarber(editingTransaction.barber || '');
        } else {
            setDesc('');
            setAmount('');
            setType('income');
            setCategory('PIX');
            setDate(new Date().toISOString().split('T')[0]);
            setRevenueType('services');
            setExpenseType('Empresa');
            setBarber('');
        }
    }, [editingTransaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            desc,
            amount: parseFloat(amount),
            type,
            category,
            date: date.split('-').reverse().join('/'),
            revenueType: type === 'income' ? revenueType : undefined,
            expenseType: type === 'expense' ? expenseType : undefined,
            barber: type === 'income' ? barber : undefined,
            synced: false
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            darkMode={darkMode}
            onSubmit={handleSubmit}
            footer={
                <Button type="submit" className="w-full">
                    {editingTransaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}
                </Button>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                                type === 'income' ? "bg-[#00d26a] text-white border-[#00d26a]" : "bg-transparent text-gray-400 border-gray-200"
                            )}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                                type === 'expense' ? "bg-red-500 text-white border-red-500" : "bg-transparent text-gray-400 border-gray-200"
                            )}
                        >
                            Despesa
                        </button>
                    </div>
                </div>

                {type === 'income' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Receita</label>
                            <select
                                value={revenueType}
                                onChange={(e) => setRevenueType(e.target.value as any)}
                                className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                            >
                                <option value="services">Serviços</option>
                                <option value="products">Produtos</option>
                                <option value="courses">Cursos</option>
                                <option value="other">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Barbeiro / Atendente</label>
                            <input
                                type="text"
                                value={barber}
                                onChange={(e) => setBarber(e.target.value)}
                                placeholder="Nome do profissional"
                                className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                            />
                        </div>
                    </div>
                )}

                {type === 'expense' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Despesa</label>
                        <select
                            value={expenseType}
                            onChange={(e) => setExpenseType(e.target.value as any)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                        >
                            <option value="Empresa">Empresa</option>
                            <option value="Pessoal">Pessoal</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                    <input
                        type="text"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                        <input
                            type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                        <input
                            type="date" value={date} onChange={(e) => setDate(e.target.value)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria / Forma de Pagto</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    >
                        {PAYMENT_METHODS.map(m => <option key={m.id} value={m.label}>{m.label}</option>)}
                    </select>
                </div>
            </div>
        </Modal>
    );
};

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (acc: Omit<Account, 'id'>) => void;
    darkMode: boolean;
    activeTab: 'fixas' | 'variaveis';
    editingAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
    isOpen, onClose, onSubmit, darkMode, activeTab, editingAccount
}) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Outras');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('15');
    const [variableType, setVariableType] = useState<'unica' | 'recorrente'>('unica');
    const [referenceMonth, setReferenceMonth] = useState(`${new Date().getMonth() + 1}/${new Date().getFullYear()}`);

    useEffect(() => {
        if (editingAccount) {
            setName(editingAccount.name);
            setCategory(editingAccount.category);
            setAmount(editingAccount.amount.toString());
            setDueDate(editingAccount.dueDate.toString());
            setVariableType(editingAccount.variableType || 'unica');
            setReferenceMonth(editingAccount.referenceMonth);
        } else {
            setName('');
            setCategory('Outras');
            setAmount('');
            setDueDate('15');
            setVariableType('unica');
            setReferenceMonth(`${new Date().getMonth() + 1}/${new Date().getFullYear()}`);
        }
    }, [editingAccount, isOpen, activeTab]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            category,
            amount: parseFloat(amount),
            dueDate: parseInt(dueDate),
            status: editingAccount?.status || 'pending',
            type: activeTab,
            variableType: activeTab === 'variaveis' ? variableType : undefined,
            referenceMonth,
            synced: false
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${editingAccount ? 'Editar' : 'Cadastrar'} Conta ${activeTab === 'fixas' ? 'Fixa' : 'Variável'}`}
            darkMode={darkMode}
            onSubmit={handleSubmit}
            footer={<Button type="submit" className="w-full">{editingAccount ? 'Salvar' : 'Cadastrar'}</Button>}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Conta</label>
                    <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                        <input
                            type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimento (Dia)</label>
                        <input
                            type="number" min="1" max="31" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                        />
                    </div>
                </div>
                {activeTab === 'variaveis' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de recorrência</label>
                        <select
                            value={variableType}
                            onChange={(e) => setVariableType(e.target.value as any)}
                            className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                        >
                            <option value="unica">Única (Este mês)</option>
                            <option value="recorrente">Recorrente (Parcelado)</option>
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mês de Referência</label>
                    <input
                        type="text" value={referenceMonth} onChange={(e) => setReferenceMonth(e.target.value)}
                        placeholder="MM/AAAA"
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                </div>
            </div>
        </Modal>
    );
};

interface ClosingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (c: Omit<Closing, 'id' | 'created_at' | 'updated_at'>) => void;
    darkMode: boolean;
    editingClosing?: Closing | null;
}

export const ClosingModal: React.FC<ClosingModalProps> = ({
    isOpen, onClose, onSubmit, darkMode, editingClosing
}) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (editingClosing) {
            setDate(editingClosing.date);
            setAmount(editingClosing.total_amount.toString());
            setNotes(editingClosing.notes);
        } else {
            setDate(new Date().toISOString().split('T')[0]);
            setAmount('');
            setNotes('');
        }
    }, [editingClosing, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            date,
            total_amount: parseFloat(amount),
            status: editingClosing?.status || 'closed',
            notes,
            user_id: '1',
            synced: false
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingClosing ? 'Editar Fechamento' : 'Novo Fechamento'}
            darkMode={darkMode}
            onSubmit={handleSubmit}
            footer={<Button type="submit" className="w-full">Confirmar Fechamento</Button>}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                    <input
                        type="date" value={date} onChange={(e) => setDate(e.target.value)}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Total (R$)</label>
                    <input
                        type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas</label>
                    <textarea
                        value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                        className={cn("w-full p-3 border rounded-xl text-sm outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                </div>
            </div>
        </Modal>
    );
};
