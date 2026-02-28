import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Account, Closing } from '../types';
import { toCents, fromCents, sumAmounts } from '../utils/financialUtils';

export function useDashboardData() {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('pentefino_data');
        return saved ? JSON.parse(saved) : [];
    });
    const [accounts, setAccounts] = useState<Account[]>(() => {
        const saved = localStorage.getItem('pentefino_accounts');
        return saved ? JSON.parse(saved) : [];
    });
    const [closings, setClosings] = useState<Closing[]>(() => {
        const saved = localStorage.getItem('pentefino_closings');
        return saved ? JSON.parse(saved) : [];
    });
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Filter states
    const [dateFilter, setDateFilter] = useState('7days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [subTab, setSubTab] = useState('services');
    const [accountsTab, setAccountsTab] = useState<'fixas' | 'variaveis'>('fixas');
    const [commissionRate, setCommissionRate] = useState(50);

    const [loading, setLoading] = useState(true);

    const getAuthHeader = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/data', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
                setAccounts(data.accounts);
                setClosings(data.closings);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        const savedSettings = localStorage.getItem('pentefino_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.commissionRate) setCommissionRate(settings.commissionRate);
        }

        fetchData();

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchData]);

    // Local Persistence (as backup)
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('pentefino_data', JSON.stringify(transactions));
            localStorage.setItem('pentefino_accounts', JSON.stringify(accounts));
            localStorage.setItem('pentefino_closings', JSON.stringify(closings));
        }
    }, [transactions, accounts, closings, loading]);

    useEffect(() => {
        localStorage.setItem('pentefino_settings', JSON.stringify({ commissionRate }));
    }, [commissionRate]);

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
            const totalCommissions = (totalIncome > 0) ? (serviceIncome * commissionRate) / 100 : 0;

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
    const handleAddTransaction = async (t: Omit<Transaction, 'id'>) => {
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(t)
            });
            if (res.ok) {
                const newRecord = await res.json();
                setTransactions(prev => [newRecord, ...prev]);
            } else {
                const localRecord = { ...t, id: Date.now(), synced: false };
                setTransactions(prev => [localRecord, ...prev]);
            }
        } catch (error) {
            const localRecord = { ...t, id: Date.now(), synced: false };
            setTransactions(prev => [localRecord, ...prev]);
        }
    };

    const handleUpdateTransaction = async (id: string | number, t: Partial<Transaction>) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'PUT',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(t)
            });
            if (res.ok) {
                const updated = await res.json();
                setTransactions(prev => prev.map(item => item.id === id ? updated : item));
            } else {
                setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t, synced: false } : item));
            }
        } catch (error) {
            setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t, synced: false } : item));
        }
    };

    const handleDeleteTransaction = async (id: string | number) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            if (res.ok) {
                setTransactions(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddAccount = async (acc: Omit<Account, 'id'>, recurrenceMonths?: number) => {
        const createAccount = async (accountData: any) => {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(accountData)
            });
            return res.ok ? await res.json() : { ...accountData, id: Date.now(), synced: false };
        };

        if (acc.variableType === 'recorrente') {
            const count = recurrenceMonths || 1;
            const [month, year] = acc.referenceMonth.split('/').map(Number);
            const newAccounts: Account[] = [];

            for (let i = 0; i < count; i++) {
                const d = new Date(year, month - 1 + i, 1);
                const ref = `${d.getMonth() + 1}/${d.getFullYear()}`;
                const accountData = {
                    ...acc,
                    name: count > 1 ? `${acc.name} (${i + 1}/${count})` : acc.name,
                    referenceMonth: ref
                };
                const newAcc = await createAccount(accountData);
                newAccounts.push(newAcc);
            }
            setAccounts(prev => [...newAccounts, ...prev]);
        } else {
            const newAcc = await createAccount(acc);
            setAccounts(prev => [newAcc, ...prev]);
        }
    };

    const handleUpdateAccount = async (id: string | number, acc: Partial<Account>) => {
        try {
            const res = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(acc)
            });
            if (res.ok) {
                const updated = await res.json();
                setAccounts(prev => prev.map(item => item.id === id ? updated : item));
            } else {
                setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...acc, synced: false } : item));
            }
        } catch (error) {
            setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...acc, synced: false } : item));
        }
    };

    const handleDeleteAccount = async (id: string | number) => {
        try {
            await fetch(`/api/accounts/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            setAccounts(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleToggleAccountStatus = async (id: string | number) => {
        const account = accounts.find(a => a.id === id);
        if (!account) return;

        const newStatus = account.status === 'paid' ? 'pending' : 'paid';
        const paidAt = newStatus === 'paid' ? new Date().toLocaleDateString('pt-BR') : undefined;

        await handleUpdateAccount(id, { status: newStatus, paidAt });
    };

    const handleAddClosing = async (c: Omit<Closing, 'id'>) => {
        try {
            const res = await fetch('/api/closings', {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify(c)
            });
            if (res.ok) {
                const newClosing = await res.json();
                setClosings(prev => [newClosing, ...prev]);
            }
        } catch (error) {
            setClosings(prev => [{ ...c, id: Date.now(), synced: false }, ...prev]);
        }
    };

    // Synchronization of unsynced local data
    useEffect(() => {
        if (isOnline && !loading) {
            const syncData = async () => {
                const unsyncedTransactions = transactions.filter(t => t.synced === false);
                const unsyncedAccounts = accounts.filter(a => a.synced === false);
                const unsyncedClosings = closings.filter(c => c.synced === false);

                if (unsyncedTransactions.length === 0 && unsyncedAccounts.length === 0 && unsyncedClosings.length === 0) return;

                console.log("Syncing unsynced local data to server...");

                // Transactions
                for (const t of unsyncedTransactions) {
                    try {
                        const res = await fetch('/api/transactions', {
                            method: 'POST',
                            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                            body: JSON.stringify(t)
                        });
                        if (res.ok) {
                            const synced = await res.json();
                            setTransactions(prev => prev.map(item => item.id === t.id ? synced : item));
                        }
                    } catch (e) {
                        console.error("Failed to sync transaction:", t.id, e);
                    }
                }

                // Accounts
                for (const a of unsyncedAccounts) {
                    try {
                        const res = await fetch('/api/accounts', {
                            method: 'POST',
                            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                            body: JSON.stringify(a)
                        });
                        if (res.ok) {
                            const synced = await res.json();
                            setAccounts(prev => prev.map(item => item.id === a.id ? synced : item));
                        }
                    } catch (e) {
                        console.error("Failed to sync account:", a.id, e);
                    }
                }

                // Closings
                for (const c of unsyncedClosings) {
                    try {
                        const res = await fetch('/api/closings', {
                            method: 'POST',
                            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                            body: JSON.stringify(c)
                        });
                        if (res.ok) {
                            const synced = await res.json();
                            setClosings(prev => prev.map(item => item.id === c.id ? synced : item));
                        }
                    } catch (e) {
                        console.error("Failed to sync closing:", c.id, e);
                    }
                }
            };

            syncData();
        }
    }, [isOnline, loading, transactions, accounts, closings]);

    return {
        transactions, accounts, closings, isOnline, loading,
        dateFilter, setDateFilter, startDate, setStartDate, endDate, setEndDate,
        searchTerm, setSearchTerm, subTab, setSubTab, accountsTab, setAccountsTab,
        commissionRate, setCommissionRate,
        filteredTransactions, stats,
        handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
        handleAddAccount, handleUpdateAccount, handleDeleteAccount, handleToggleAccountStatus,
        handleAddClosing
    };
}
