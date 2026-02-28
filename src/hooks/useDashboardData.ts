import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Account, Closing } from '../types';
import { toCents, fromCents, sumAmounts } from '../utils/financialUtils';

export function useDashboardData() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [closings, setClosings] = useState<Closing[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Filter states
    const [dateFilter, setDateFilter] = useState('7days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [subTab, setSubTab] = useState('services');
    const [accountsTab, setAccountsTab] = useState<'fixas' | 'variaveis'>('fixas');
    const [commissionRate, setCommissionRate] = useState(50);

    // Initial Load from LocalStorage
    useEffect(() => {
        const savedData = localStorage.getItem('pentefino_data');
        const savedAccounts = localStorage.getItem('pentefino_accounts');
        const savedClosings = localStorage.getItem('pentefino_closings');
        const savedSettings = localStorage.getItem('pentefino_settings');

        if (savedData) setTransactions(JSON.parse(savedData));
        if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
        if (savedClosings) setClosings(JSON.parse(savedClosings));
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.commissionRate) setCommissionRate(settings.commissionRate);
        }

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Local Persistence
    useEffect(() => {
        localStorage.setItem('pentefino_data', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('pentefino_accounts', JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('pentefino_closings', JSON.stringify(closings));
    }, [closings]);

    useEffect(() => {
        localStorage.setItem('pentefino_settings', JSON.stringify({ commissionRate }));
    }, [commissionRate]);

    // Offline Sync Logic (Placeholder for background sync)
    const syncWithServer = useCallback(async () => {
        if (!isOnline) return;
        // This will eventually call /api/sync with all unsynced records
        console.log("Syncing with server...");
    }, [isOnline, transactions, accounts, closings]);

    useEffect(() => {
        const timer = setTimeout(() => syncWithServer(), 5000);
        return () => clearTimeout(timer);
    }, [transactions, accounts, closings, isOnline, syncWithServer]);

    // Enhanced Filtering Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const [d, m, y] = t.date.split('/').map(Number);
            const tDate = new Date(y, m - 1, d);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            // Search term filter
            if (searchTerm && !t.desc.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            if (dateFilter === 'today') {
                return tDate.getTime() === now.getTime();
            }
            if (dateFilter === 'yesterday') {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return tDate.getTime() === yesterday.getTime();
            }
            if (dateFilter === '7days') {
                const limit = new Date(now);
                limit.setDate(now.getDate() - 7);
                return tDate >= limit;
            }
            if (dateFilter === '14days') {
                const limit = new Date(now);
                limit.setDate(now.getDate() - 14);
                return tDate >= limit;
            }
            if (dateFilter === 'month') {
                return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            }
            if (dateFilter === 'custom' && startDate && endDate) {
                // Ensure dates are parsed as local YYYY-MM-DD
                const [sY, sM, sD] = startDate.split('-').map(Number);
                const [eY, eM, eD] = endDate.split('-').map(Number);
                const start = new Date(sY, sM - 1, sD);
                const end = new Date(eY, eM - 1, eD);

                return tDate.getTime() >= start.getTime() && tDate.getTime() <= end.getTime();
            }
            return true;
        });
    }, [transactions, dateFilter, startDate, endDate, searchTerm]);

    const stats = useMemo(() => {
        const calculateStats = (filteredList: Transaction[]) => {
            const incomeTransactions = filteredList.filter(t => t.type === 'income');
            const expenseTransactions = filteredList.filter(t => t.type === 'expense');

            const totalIncome = sumAmounts(incomeTransactions.map(t => t.amount));
            const totalExpense = sumAmounts(expenseTransactions.map(t => t.amount));
            const serviceIncome = sumAmounts(incomeTransactions.filter(t => t.revenueType === 'services').map(t => t.amount));
            const totalCommissions = (serviceIncome * commissionRate) / 100;

            const balance = fromCents(toCents(totalIncome) - toCents(totalExpense));
            const netProfit = fromCents(toCents(balance) - toCents(totalCommissions));

            return { totalIncome, totalExpense, totalCommissions, balance, netProfit, count: filteredList.length };
        };

        const currentStats = calculateStats(filteredTransactions);

        // Comparison Logic
        let prevTransactions: Transaction[] = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            prevTransactions = transactions.filter(t => {
                const [d, m, y] = t.date.split('/').map(Number);
                const tDate = new Date(y, m - 1, d);
                return tDate.getTime() === yesterday.getTime();
            });
        } else if (dateFilter === '7days') {
            const start = new Date(now); start.setDate(now.getDate() - 14);
            const end = new Date(now); end.setDate(now.getDate() - 7);
            prevTransactions = transactions.filter(t => {
                const [d, m, y] = t.date.split('/').map(Number);
                const tDate = new Date(y, m - 1, d);
                return tDate >= start && tDate < end;
            });
        } else if (dateFilter === 'month') {
            const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            prevTransactions = transactions.filter(t => {
                const [d, m, y] = t.date.split('/').map(Number);
                const tDate = new Date(y, m - 1, d);
                return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
            });
        }

        const prevStats = prevTransactions.length > 0 ? calculateStats(prevTransactions) : null;

        const getTrend = (curr: number, prev: number | undefined) => {
            if (prev === undefined || prev === 0) return undefined;
            const diff = ((curr - prev) / Math.abs(prev)) * 100;
            return (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
        };

        return {
            ...currentStats,
            comparison: prevStats ? {
                incomeTrend: getTrend(currentStats.totalIncome, prevStats.totalIncome),
                expenseTrend: getTrend(currentStats.totalExpense, prevStats.totalExpense),
                profitTrend: getTrend(currentStats.netProfit, prevStats.netProfit),
                balanceTrend: getTrend(currentStats.balance, prevStats.balance)
            } : undefined
        };
    }, [filteredTransactions, transactions, dateFilter, commissionRate]);

    // Handlers
    const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
        const newRecord = { ...t, id: Date.now(), synced: false };
        setTransactions(prev => [newRecord, ...prev]);
    };

    const handleUpdateTransaction = (id: string | number, t: Partial<Transaction>) => {
        setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t, synced: false } : item));
    };

    const handleDeleteTransaction = (id: string | number) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleAddAccount = (acc: Omit<Account, 'id'>, recurrenceMonths?: number) => {
        if (acc.variableType === 'recorrente') {
            const count = recurrenceMonths || 1;
            const newAccounts: Account[] = [];
            const [month, year] = acc.referenceMonth.split('/').map(Number);

            for (let i = 0; i < count; i++) {
                const d = new Date(year, month - 1 + i, 1);
                const ref = `${d.getMonth() + 1}/${d.getFullYear()}`;
                newAccounts.push({
                    ...acc,
                    id: Date.now() + i,
                    name: count > 1 ? `${acc.name} (${i + 1}/${count})` : acc.name,
                    referenceMonth: ref,
                    synced: false
                });
            }
            setAccounts(prev => [...newAccounts, ...prev]);
        } else {
            setAccounts(prev => [{ ...acc, id: Date.now(), synced: false }, ...prev]);
        }
    };

    const handleUpdateAccount = (id: string | number, acc: Partial<Account>) => {
        setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...acc, synced: false } : item));
    };

    const handleDeleteAccount = (id: string | number) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
    };

    const handleToggleAccountStatus = (id: string | number) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === id ? {
                ...acc,
                status: acc.status === 'paid' ? 'pending' : 'paid',
                paidAt: acc.status === 'paid' ? undefined : new Date().toLocaleDateString('pt-BR'),
                synced: false
            } : acc
        ));
    };

    const handleAddClosing = (c: Omit<Closing, 'id'>) => {
        setClosings(prev => [{ ...c, id: Date.now(), synced: false }, ...prev]);
    };

    return {
        transactions, accounts, closings, isOnline,
        dateFilter, setDateFilter, startDate, setStartDate, endDate, setEndDate,
        searchTerm, setSearchTerm, subTab, setSubTab, accountsTab, setAccountsTab,
        commissionRate, setCommissionRate,
        filteredTransactions, stats,
        handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
        handleAddAccount, handleUpdateAccount, handleDeleteAccount, handleToggleAccountStatus,
        handleAddClosing
    };
}
