import { useState, useEffect, useMemo } from 'react';
import { Transaction, Account, Closing } from '../types';
import { toCents, fromCents, sumAmounts } from '../utils/financialUtils';

export function useDashboardData() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [closings, setClosings] = useState<Closing[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Date filter state
    const [dateFilter, setDateFilter] = useState('7days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Initial Load
    useEffect(() => {
        const savedData = localStorage.getItem('pentefino_data');
        const savedAccounts = localStorage.getItem('pentefino_accounts');
        const savedClosings = localStorage.getItem('pentefino_closings');

        if (savedData) setTransactions(JSON.parse(savedData));
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        if (savedClosings) setClosings(JSON.parse(savedClosings));

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Persistence
    useEffect(() => {
        localStorage.setItem('pentefino_data', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('pentefino_accounts', JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('pentefino_closings', JSON.stringify(closings));
    }, [closings]);

    // Derived Data & Calculations
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date.split('/').reverse().join('-'));
            const now = new Date();

            if (dateFilter === '7days') {
                const last7 = new Date();
                last7.setDate(now.getDate() - 7);
                return tDate >= last7;
            }
            if (dateFilter === '30days') {
                const last30 = new Date();
                last30.setDate(now.getDate() - 30);
                return tDate >= last30;
            }
            if (dateFilter === 'custom' && startDate && endDate) {
                return tDate >= new Date(startDate) && tDate <= new Date(endDate);
            }
            return true;
        });
    }, [transactions, dateFilter, startDate, endDate]);

    const stats = useMemo(() => {
        const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
        const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

        const totalIncome = sumAmounts(incomeTransactions.map(t => t.amount));
        const totalExpense = sumAmounts(expenseTransactions.map(t => t.amount));
        const balance = fromCents(toCents(totalIncome) - toCents(totalExpense));

        return {
            totalIncome,
            totalExpense,
            balance,
            transactionCount: filteredTransactions.length
        };
    }, [filteredTransactions]);

    const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...t, id: Date.now() };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const handleUpdateTransaction = (id: string | number, t: Partial<Transaction>) => {
        setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
    };

    const handleDeleteTransaction = (id: string | number) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleAddAccount = (acc: Omit<Account, 'id'>) => {
        const newAccount = { ...acc, id: Date.now() };
        setAccounts(prev => [newAccount, ...prev]);
    };

    const handleUpdateAccount = (id: string | number, acc: Partial<Account>) => {
        setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...acc } : item));
    };

    const handleDeleteAccount = (id: string | number) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const handleToggleAccountStatus = (id: string | number) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === id ? { ...acc, status: acc.status === 'paid' ? 'pending' : 'paid', paidAt: acc.status === 'paid' ? undefined : new Date().toLocaleDateString('pt-BR') } : acc
        ));
    };

    return {
        transactions,
        setTransactions,
        accounts,
        setAccounts,
        closings,
        setClosings,
        isOnline,
        dateFilter,
        setDateFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        filteredTransactions,
        stats,
        handleAddTransaction,
        handleUpdateTransaction,
        handleDeleteTransaction,
        handleAddAccount,
        handleUpdateAccount,
        handleDeleteAccount,
        handleToggleAccountStatus
    };
}
