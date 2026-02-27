/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart
} from 'recharts';
import {
  LayoutDashboard, Scissors, DollarSign, TrendingUp, TrendingDown,
  Plus, ShieldCheck, X, Check, Wallet, Calendar, FileText, BarChart3, Settings,
  ArrowUpRight, ArrowDownRight, CreditCard, PieChart as PieChartIcon, AlertCircle,
  Briefcase, Home, Trash2, Pencil, Search, ChevronDown, Filter, RefreshCw, Zap, Clock, CheckCircle2, Menu, Wifi, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../utils';

import { Transaction, Closing } from '../types';

const USERS = [
  { id: '1', name: 'Wesley Gabriel', active: true },
  { id: '2', name: 'João Silva', active: true },
  { id: '3', name: 'Pedro Santos', active: true },
  { id: '4', name: 'Ana Oliveira', active: false },
];

import { Card, Modal, Button } from '../components/ui';

const MetricCard = ({ title, value, trend, icon: Icon, color = 'green' }: {
  title: string,
  value: string,
  trend: string,
  icon: any,
  color?: 'green' | 'red' | 'blue'
}) => {
  const colorClasses = {
    green: {
      text: 'text-[#00d26a]',
      bg: 'bg-[#00d26a]/10',
      icon: 'text-[#00d26a]'
    },
    red: {
      text: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: 'text-red-500'
    },
    blue: {
      text: 'text-blue-500',
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500'
    }
  };

  return (
    <Card className={cn(
      "flex flex-col justify-between h-full transition-colors duration-300",
      "bg-white dark:bg-[#1E1E1E]"
    )}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</span>
        <div className={cn("p-2 rounded-lg", colorClasses[color].bg)}>
          <Icon size={20} className={colorClasses[color].icon} />
        </div>
      </div>
      <div>
        <h3 className={cn("text-2xl font-bold mb-1", colorClasses[color].text)}>{value}</h3>
        <div className="flex items-center gap-1">
          {trend.startsWith('+') ? <TrendingUp size={14} className="text-[#00d26a]" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={cn("text-xs font-medium", trend.startsWith('+') ? "text-[#00d26a]" : "text-red-500")}>
            {trend} vs mês anterior
          </span>
        </div>
      </div>
    </Card>
  );
};

const BalanceWidget = ({ balance, income, expense, darkMode }: { balance: number, income: number, expense: number, darkMode: boolean }) => {
  return (
    <Card className={cn(
      "p-8 relative overflow-hidden border-none shadow-xl mb-8 transition-all duration-300",
      darkMode ? "bg-[#0A0A0A] text-white" : "bg-gradient-to-br from-[#00d26a] to-blue-500 text-white"
    )}>
      {/* Background patterns for a premium feel */}
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50",
        darkMode ? "bg-[#00d26a]/5" : "bg-white/10"
      )} />
      <div className={cn(
        "absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50",
        darkMode ? "bg-blue-500/5" : "bg-white/10"
      )} />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-2">Saldo Total Disponível</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
              <span className="text-2xl font-medium text-white/60">R$</span>
              {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {balance < 0 && <span className="text-white text-xl ml-2">(-)</span>}
            </h2>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <Wallet size={28} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block mb-0.5">Entradas</span>
              <span className="text-xl font-bold text-white">
                {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block mb-0.5">Saídas</span>
              <span className="text-xl font-bold text-white">
                {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const SmallMetric = ({ label, value, color = 'gray' }: { label: string, value: string, color?: string }) => (
  <Card className={cn(
    "p-4 transition-colors duration-300",
    "bg-white dark:bg-[#1E1E1E]"
  )}>
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-300 mb-1">{label}</span>
      <span className={cn("text-sm font-bold", color === 'green' ? "text-[#00d26a]" : "text-gray-800 dark:text-white")}>{value}</span>
    </div>
  </Card>
);

const MONTHS_BR = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// --- APLICAÇÃO PRINCIPAL ---
export default function DashboardPenteFino() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLgpdAccepted, setIsLgpdAccepted] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [expenseSubTab, setExpenseSubTab] = useState<'professional' | 'personal'>('professional');
  const [revenueSubTab, setRevenueSubTab] = useState<'services' | 'products'>('services');
  const [dateFilter, setDateFilter] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Corte');
  const [expenseType, setExpenseType] = useState<'professional' | 'personal'>('professional');
  const [revenueType, setRevenueType] = useState<'services' | 'products'>('services');
  const [barber, setBarber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportChartType, setReportChartType] = useState<'line' | 'bar'>('line');

  // Accounts State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeAccountTab, setActiveAccountTab] = useState<'fixas' | 'variaveis'>('fixas');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  // Closings State
  const [closings, setClosings] = useState<Closing[]>([]);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [editingClosing, setEditingClosing] = useState<Closing | null>(null);
  const [closingFilters, setClosingFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    userId: 'all'
  });

  // Closing Form State
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [closingUserId, setClosingUserId] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [closingStatus, setClosingStatus] = useState<'open' | 'closed'>('open');
  const [closingNotes, setClosingNotes] = useState('');

  // Account Form State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'unica' | 'recorrente'>('unica');
  const [accAmount, setAccAmount] = useState('');
  const [accDueDate, setAccDueDate] = useState('15');
  const [accMonth, setAccMonth] = useState(`${MONTHS_BR[new Date().getMonth()]}/${new Date().getFullYear()}`);
  const [accDuration, setAccDuration] = useState('1');
  const [accCategory, setAccCategory] = useState('Outras Despesas');
  const [accObs, setAccObs] = useState('');

  // Settings State
  const [userName, setUserName] = useState('Wesley Gabriel');
  const [userEmail, setUserEmail] = useState('wesley@barbearia.com');
  const [businessName, setBusinessName] = useState('PenteFino Barber Shop');
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);


  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.desc,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pentefino_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório Financeiro - PenteFino', 14, 15);
    doc.setFontSize(10);
    doc.text(`Período: ${dateFilter}`, 14, 22);

    const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
    const tableRows = filteredTransactions.map(t => [
      t.date,
      t.desc,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      `R$ ${t.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`relatorio_pentefino_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const savedData = localStorage.getItem('pentefino_data');
    const savedAccounts = localStorage.getItem('pentefino_accounts');
    const savedClosings = localStorage.getItem('pentefino_closings');
    const lgpdConsent = localStorage.getItem('pentefino_lgpd');

    if (savedData) {
      setTransactions(JSON.parse(savedData));
    } else {
      // Mock data based on images
      const mockData = [
        { id: 1, desc: 'Pomada', category: 'Produtos (pomadas, gel, lâminas, toalhas descartáveis, álcool, etc.)', date: '24/02/2026', amount: 70, type: 'expense', expenseType: 'professional' },
        { id: 2, desc: 'Mei', category: 'DAS (MEI)', date: '24/02/2026', amount: 80, type: 'expense', expenseType: 'professional' },
        { id: 3, desc: 'Plano de Celular', category: 'Plano de Celular', date: '24/02/2026', amount: 100, type: 'expense', expenseType: 'professional' },
        { id: 4, desc: 'Internet', category: 'Internet', date: '24/02/2026', amount: 100, type: 'expense', expenseType: 'professional' },
        { id: 5, desc: 'Aluguel Casa', category: 'Moradia', date: '24/02/2026', amount: 120, type: 'expense', expenseType: 'personal' },
        { id: 6, desc: 'Mercado', category: 'Alimentação', date: '24/02/2026', amount: 100, type: 'expense', expenseType: 'personal' },
        { id: 7, desc: 'Faturamento Semana', category: 'Receita', date: '16/02/2026', amount: 250, type: 'income' },
      ];
      setTransactions(mockData);
    }

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      const mockAccounts = [
        { id: 1, name: 'Aluguel', category: 'Aluguel', amount: 1000, dueDate: 15, status: 'pending', type: 'fixa', referenceMonth: 'fevereiro/2026' },
        { id: 2, name: 'Internet', category: 'Internet / Telefone', amount: 100, dueDate: 15, status: 'pending', type: 'fixa', referenceMonth: 'fevereiro/2026' },
        { id: 3, name: 'Carro conserto', category: 'Outras Despesas', amount: 100, dueDate: 15, status: 'paid', type: 'variavel', variableType: 'unica', referenceMonth: 'fevereiro/2026', paidAt: '24/02/2026' },
        { id: 4, name: 'Conserto Ar Condicionado', category: 'Manutenção', amount: 500, dueDate: 15, status: 'pending', type: 'variavel', variableType: 'recorrente', referenceMonth: 'fev/26 - mar/26' },
      ];
      setAccounts(mockAccounts);
    }

    if (savedClosings) {
      setClosings(JSON.parse(savedClosings));
    } else {
      const mockClosings: Closing[] = [
        {
          id: 'c1',
          date: '2026-02-25',
          user_id: '1',
          total_amount: 450.50,
          status: 'closed',
          notes: 'Fechamento tranquilo, tudo ok.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'c2',
          date: '2026-02-26',
          user_id: '2',
          total_amount: 320.00,
          status: 'open',
          notes: 'Aguardando conferência final.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ];
      setClosings(mockClosings);
      localStorage.setItem('pentefino_closings', JSON.stringify(mockClosings));
    }

    if (!lgpdConsent) setIsLgpdAccepted(false);

    // Load User and Settings
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setUserName(parsedUser.name || parsedUser.username || 'Wesley Gabriel');
        setUserEmail(parsedUser.email || 'wesley@barbearia.com');
      } catch (e) { console.error("Error parsing user", e); }
    }

    const savedSettings = localStorage.getItem('pentefino_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.businessName) setBusinessName(settings.businessName);
        if (settings.businessLogo) setBusinessLogo(settings.businessLogo);
        if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
        if (settings.emailNotifications !== undefined) setEmailNotifications(settings.emailNotifications);
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pentefino_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pentefino_closings', JSON.stringify(closings));
  }, [closings]);

  useEffect(() => {
    localStorage.setItem('pentefino_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    const settings = { userName, userEmail, businessName, businessLogo, darkMode, emailNotifications };
    localStorage.setItem('pentefino_settings', JSON.stringify(settings));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userName, userEmail, businessName, businessLogo, darkMode, emailNotifications]);

  const acceptLgpd = () => {
    localStorage.setItem('pentefino_lgpd', 'true');
    setIsLgpdAccepted(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (type === 'income') {
      const services = ['Corte', 'Barba', 'Combo'];
      const products = ['Venda de Produto'];
      const courses = ['Cursos'];

      if (services.includes(category)) setRevenueType('services');
      else if (products.includes(category)) setRevenueType('products');
      else if (courses.includes(category)) setRevenueType('courses');
      else setRevenueType('other');
    }
  }, [category, type]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    // Use category as default description if empty
    const finalDesc = desc.trim() || category || 'Lançamento';

    const newTransaction = {
      id: Date.now(),
      desc: finalDesc,
      amount: parseFloat(amount),
      type,
      category,
      expenseType: type === 'expense' ? expenseType : undefined,
      revenueType: type === 'income' ? revenueType : undefined,
      date: date.split('-').reverse().join('/')
    };

    setTransactions([newTransaction, ...transactions]);
    setShowAddModal(false);
    setDesc('');
    setAmount('');
  };

  const filteredClosings = closings.filter(c => {
    const matchesStatus = closingFilters.status === 'all' || c.status === closingFilters.status;
    const matchesUser = closingFilters.userId === 'all' || c.user_id === closingFilters.userId;
    const matchesDate = (!closingFilters.startDate || c.date >= closingFilters.startDate) &&
      (!closingFilters.endDate || c.date <= closingFilters.endDate);
    return matchesStatus && matchesUser && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingDate || !closingUserId || !closingAmount) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newClosing: Closing = {
      id: editingClosing ? editingClosing.id : Math.random().toString(36).substring(2, 11),
      date: closingDate,
      user_id: closingUserId,
      total_amount: parseFloat(closingAmount),
      status: closingStatus,
      notes: closingNotes,
      created_at: editingClosing ? editingClosing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingClosing) {
      setClosings(closings.map(c => c.id === editingClosing.id ? newClosing : c));
    } else {
      setClosings([...closings, newClosing]);
    }

    setShowClosingModal(false);
    setEditingClosing(null);
    resetClosingForm();
    alert(editingClosing ? 'Fechamento atualizado!' : 'Novo fechamento registrado!');
  };

  const resetClosingForm = () => {
    setClosingDate(new Date().toISOString().split('T')[0]);
    setClosingUserId('');
    setClosingAmount('');
    setClosingStatus('open');
    setClosingNotes('');
  };

  const handleEditClosing = (closing: Closing) => {
    setEditingClosing(closing);
    setClosingDate(closing.date);
    setClosingUserId(closing.user_id);
    setClosingAmount(closing.total_amount.toString());
    setClosingStatus(closing.status);
    setClosingNotes(closing.notes);
    setShowClosingModal(true);
  };

  const handleDeleteClosing = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fechamento?')) {
      setClosings(closings.filter(c => c.id !== id));
    }
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName || !accAmount) return;

    const newAccount = {
      id: editingAccount ? editingAccount.id : Date.now(),
      name: accName,
      amount: parseFloat(accAmount),
      dueDate: parseInt(accDueDate),
      status: editingAccount ? editingAccount.status : 'pending',
      type: activeAccountTab === 'fixas' ? 'fixa' : 'variavel',
      variableType: activeAccountTab === 'variaveis' ? accType : undefined,
      referenceMonth: accType === 'recorrente' ? `${accMonth} - ${calculateEndMonth(accMonth, parseInt(accDuration))}` : accMonth,
      category: accCategory,
      observation: accObs
    };

    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === editingAccount.id ? newAccount : a));
    } else {
      setAccounts([...accounts, newAccount]);
    }

    setShowAccountModal(false);
    resetAccountForm();
  };

  const resetAccountForm = () => {
    setAccName('');
    setAccType('unica');
    setAccAmount('');
    setAccDueDate('15');
    setAccMonth(`${MONTHS_BR[new Date().getMonth()]}/${new Date().getFullYear()}`);
    setAccDuration('1');
    setAccCategory('Outras Despesas');
    setAccObs('');
    setEditingAccount(null);
  };

  const calculateEndMonth = (startMonth: string, duration: number) => {
    if (duration <= 1) return startMonth;
    const [monthName, year] = startMonth.split('/');
    let monthIndex = MONTHS_BR.indexOf(monthName.toLowerCase());
    let currentYear = parseInt(year);

    monthIndex += (duration - 1);
    while (monthIndex >= 12) {
      monthIndex -= 12;
      currentYear += 1;
    }

    return `${MONTHS_BR[monthIndex]}/${currentYear}`;
  };

  const referenceMonthOptions = [];
  const currentYear = new Date().getFullYear();
  for (let m = 0; m < 12; m++) {
    referenceMonthOptions.push(`${MONTHS_BR[m]}/${currentYear}`);
  }

  const handlePayAccount = (id: number) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    // Mark as paid
    setAccounts(accounts.map(a => a.id === id ? { ...a, status: 'paid', paidAt: new Date().toLocaleDateString('pt-BR') } : a));

    // Register as a transaction
    const newTransaction = {
      id: Date.now(),
      desc: `Pagamento: ${account.name}`,
      amount: account.amount,
      type: 'expense',
      category: account.category,
      expenseType: 'professional', // Defaulting to professional for accounts
      date: new Date().toLocaleDateString('pt-BR')
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteAccount = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredTransactions = transactions.filter(t => {
    const tDate = parseDate(t.date);
    const now = new Date();
    // Reset hours for accurate day comparison
    now.setHours(0, 0, 0, 0);
    tDate.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return tDate.getTime() === now.getTime();
    }
    if (dateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      return tDate.getTime() === yesterday.getTime();
    }
    if (dateFilter === '7days') {
      const diffTime = now.getTime() - tDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }
    if (dateFilter === '30days') {
      const diffTime = now.getTime() - tDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }
    if (dateFilter === 'custom') {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return tDate >= start && tDate <= end;
    }
    return true; // 'all'
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Dynamic Chart Data
  const chartData = (Array.from(new Set(filteredTransactions.map(t => t.date as string))) as string[]).sort((a: string, b: string) => {
    const dateA = a.split('/').reverse().join('-');
    const dateB = b.split('/').reverse().join('-');
    return dateA.localeCompare(dateB);
  }).map((date: string) => {
    const dayTransactions = filteredTransactions.filter(t => t.date === date);
    return {
      name: date.substring(0, 5), // DD/MM
      receita: dayTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
      despesa: dayTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
      Receitas: dayTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
      Despesas: dayTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
    };
  });

  // Dynamic Category Data
  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const categoryTotals = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartColors = ['#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f97316'];
  const categoryData = Object.keys(categoryTotals).map((cat, index) => ({
    name: cat,
    value: categoryTotals[cat],
    color: chartColors[index % chartColors.length]
  }));

  const pieData = categoryData;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'contas', label: 'Contas', icon: DollarSign },
    { id: 'fechamentos', label: 'Fechamentos', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'analise', label: 'Análise', icon: FileText },
  ];

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300",
      darkMode ? "dark bg-[#121212] text-gray-100" : "bg-[#f8fafc] text-gray-800"
    )}>

      {/* MOBILE HEADER */}
      <div className={cn(
        "md:hidden flex items-center justify-between p-4 sticky top-0 z-50 transition-colors duration-300",
        darkMode ? "bg-[#1E1E1E] border-b border-white/5" : "bg-white border-b border-gray-100 text-gray-900"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00d26a] rounded-lg flex items-center justify-center text-white overflow-hidden">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Scissors size={18} />
            )}
          </div>
          <span className="font-bold text-sm tracking-tight">{businessName}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* MENU LATERAL */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 md:w-64 flex flex-col h-screen overflow-y-auto transition-all duration-500 z-50 md:sticky md:top-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        darkMode
          ? "bg-[#1E1E1E] text-white border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
          : "bg-white text-gray-900 border-r border-gray-100 shadow-xl"
      )}>
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00d26a] rounded-lg flex items-center justify-center text-white overflow-hidden">
            {businessLogo ? (
              <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Scissors size={24} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">Olá, {userName.split(' ')[0].toLowerCase()}!</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{businessName}</span>
          </div>
        </div>

        <nav className="px-4 flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer",
                activeTab === item.id
                  ? "bg-[#00d26a] text-white shadow-lg shadow-[#00d26a]/20"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button
            onClick={() => {
              setActiveTab('config');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer",
              activeTab === 'config'
                ? "bg-[#00d26a] text-white shadow-lg shadow-[#00d26a]/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <Settings size={18} />
            <span className="text-sm">Configurações</span>
          </button>

          {user && user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer mt-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10"
            >
              <ShieldCheck size={18} />
              <span className="text-sm">Painel Admin</span>
            </button>
          )}
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className={cn(
        "flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto transition-colors duration-300 pb-24 md:pb-8",
        darkMode ? "bg-[#121212]" : "bg-[#f8fafc]"
      )}>
        {activeTab === 'dashboard' && (
          <>
            {/* Abinha de Troca Rápida */}
            <div className={cn(
              "flex p-1 rounded-xl w-full md:w-fit mb-6 transition-colors duration-300 overflow-x-auto overflow-y-hidden custom-scrollbar touch-pan-x flex-nowrap",
              darkMode ? "bg-[#1e293b]" : "bg-gray-100"
            )}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "flex-none px-6 py-3 md:py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === 'dashboard'
                    ? (darkMode ? "bg-[#0f172a] text-[#00d26a] shadow-sm" : "bg-white text-blue-600 shadow-sm")
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Geral
              </button>
              <button
                onClick={() => setActiveTab('receitas')}
                className={cn(
                  "flex-none px-6 py-3 md:py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  "text-gray-400 hover:text-gray-600"
                )}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveTab('despesas')}
                className={cn(
                  "flex-none px-6 py-3 md:py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  "text-gray-400 hover:text-gray-600"
                )}
              >
                Despesas
              </button>
            </div>

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>Dashboard</h1>
                {!isOnline && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-bold border border-amber-200 dark:border-amber-800 animate-pulse">
                    <WifiOff size={12} />
                    MODO OFFLINE (DADOS PROTEGIDOS NO DISPOSITIVO)
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-100 dark:border-green-800 opacity-60">
                    <Wifi size={10} />
                    CONECTADO
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                  <Scissors size={14} />
                  <span>Controle financeiro pessoal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn(
                "border rounded-lg px-3 py-2 flex items-center gap-2 text-sm transition-all",
                darkMode ? "bg-[#1e293b] border-white/5 text-gray-300" : "bg-white border-gray-200 text-gray-600"
              )}>
                <Calendar size={16} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer font-medium"
                >
                  <option value="today" className={darkMode ? "bg-[#0f172a]" : ""}>Hoje</option>
                  <option value="yesterday" className={darkMode ? "bg-[#0f172a]" : ""}>Ontem</option>
                  <option value="7days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 7 Dias</option>
                  <option value="30days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 30 Dias</option>
                  <option value="all" className={darkMode ? "bg-[#0f172a]" : ""}>Todo o Período</option>
                  <option value="custom" className={darkMode ? "bg-[#0f172a]" : ""}>Personalizado</option>
                </select>
                {dateFilter === 'custom' && (
                  <div className="flex items-center gap-2 ml-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-none bg-transparent text-xs font-bold outline-none" />
                    <span className="text-gray-300">-</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-none bg-transparent text-xs font-bold outline-none" />
                  </div>
                )}
                <X size={14} className="ml-2 text-gray-300 cursor-pointer" onClick={() => setDateFilter('all')} />
              </div>
              <div className={cn("text-[10px] font-bold px-2 py-1 rounded uppercase", darkMode ? "bg-[#1e293b] text-gray-400" : "bg-gray-100 text-gray-400")}>
                {dateFilter === 'today' ? 'Hoje' : dateFilter === 'yesterday' ? 'Ontem' : dateFilter === '7days' ? 'Últimos 7 dias' : dateFilter === '30days' ? 'Últimos 30 dias' : dateFilter === 'custom' ? 'Personalizado' : 'Todo o período'}
              </div>
            </div>

            {/* BALANCE WIDGET */}
            <BalanceWidget
              balance={netProfit}
              income={totalIncome}
              expense={totalExpense}
              darkMode={darkMode}
            />

            {/* TOP METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <MetricCard
                title="Total Recebido"
                value={formatCurrency(totalIncome)}
                trend="+100.0%"
                icon={ArrowUpRight}
                color="green"
              />
              <MetricCard
                title="Total Gasto"
                value={formatCurrency(totalExpense)}
                trend="+100.0%"
                icon={ArrowDownRight}
                color="red"
              />
              <MetricCard
                title="Lucro Líquido Real"
                value={formatCurrency(netProfit)}
                trend="+100.0%"
                icon={Wallet}
                color="green"
              />
            </div>

            {/* SECONDARY METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <SmallMetric label="% Margem de Economia" value="89.8%" color="green" />
              <SmallMetric label="Saldo Acumulado" value={formatCurrency(netProfit)} />
              <SmallMetric label="Média Semanal" value={formatCurrency(netProfit / 4)} />
              <SmallMetric label="Média Mensal" value={formatCurrency(netProfit / 3)} />
              <SmallMetric label="Média Diária" value={formatCurrency(netProfit / 90)} />
            </div>

            {/* PERIOD SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-[#f0fdf4] border-[#dcfce7]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#166534] uppercase">Entradas no Período</span>
                    <h3 className="text-2xl font-bold text-[#15803d] mt-1">{formatCurrency(totalIncome)}</h3>
                    <span className="text-[10px] text-[#166534]/60 font-medium">{transactions.filter(t => t.type === 'income').length} registro(s)</span>
                  </div>
                  <div className="p-2 bg-[#dcfce7] rounded-lg text-[#15803d]">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </Card>
              <Card className="bg-[#fef2f2] border-[#fee2e2]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#991b1b] uppercase">Despesas no Período</span>
                    <h3 className="text-2xl font-bold text-[#b91c1c] mt-1">{formatCurrency(totalExpense)}</h3>
                    <span className="text-[10px] text-[#991b1b]/60 font-medium">{transactions.filter(t => t.type === 'expense').length} registro(s)</span>
                  </div>
                  <div className="p-2 bg-[#fee2e2] rounded-lg text-[#b91c1c]">
                    <TrendingDown size={20} />
                  </div>
                </div>
              </Card>
            </div>

            {/* PAYMENT METHODS SECTION */}
            <div className="mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={18} className="text-[#00d26a]" />
                  <h3 className="text-sm font-bold text-gray-800">Receitas por Forma de Pagamento</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-[#00d26a]">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">PIX</p>
                        <p className="text-sm font-bold text-gray-800">{formatCurrency(1750)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">31%</span>
                  </div>
                  <div className={cn(
                    "rounded-xl p-4 flex items-center justify-between border transition-colors duration-300",
                    darkMode ? "bg-[#0f172a] border-white/5" : "bg-gray-50 border-gray-100"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
                      )}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Cartão de Crédito</p>
                        <p className={cn("text-sm font-bold", darkMode ? "text-gray-200" : "text-gray-800")}>{formatCurrency(3825.57)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">69%</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* CONTAS PENDENTES WARNING (Image 1) */}
            <div className="mb-8">
              <Card className={cn(
                "p-6 flex items-center justify-between transition-colors duration-300",
                darkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-[#fffbeb] border-[#fef3c7]"
              )}>
                <div>
                  <span className={cn("text-xs font-bold uppercase", darkMode ? "text-amber-400" : "text-[#92400e]")}>Contas Pendentes</span>
                  <h3 className={cn("text-2xl font-bold mt-1", darkMode ? "text-amber-400" : "text-[#b45309]")}>{formatCurrency(1000)}</h3>
                  <span className={cn("text-[10px] font-medium", darkMode ? "text-amber-400/60" : "text-[#92400e]/60")}>1 conta(s)</span>
                </div>
                <div className={cn(
                  "p-3 rounded-lg",
                  darkMode ? "bg-amber-500/20 text-amber-400" : "bg-[#fef3c7] text-[#b45309]"
                )}>
                  <AlertCircle size={24} />
                </div>
              </Card>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Lucro Líquido Green Card */}
              <Card className="bg-[#00d26a] text-white relative overflow-hidden flex flex-col justify-center min-h-[300px]" noPadding>
                <div className="p-8 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} />
                    <span className="text-sm font-medium">Lucro Líquido</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{formatCurrency(netProfit)}</h2>
                  <p className="text-white/80 text-sm">Margem de economia: 89.8%</p>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/20">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/60">Entradas</span>
                      <p className="font-bold">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/60">Despesas</span>
                      <p className="font-bold">{formatCurrency(totalExpense)}</p>
                    </div>
                  </div>
                </div>
                <DollarSign className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 rotate-12" />
              </Card>

              {/* Fluxo de Caixa Chart */}
              <Card className="xl:col-span-2 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-white" : "text-gray-800")}>Fluxo de Caixa</h3>
                  <div className={cn("flex p-1 rounded-lg", darkMode ? "bg-[#0f172a]" : "bg-gray-100")}>
                    <button className={cn("px-3 py-1 text-xs font-bold rounded-md shadow-sm", darkMode ? "bg-[#1e293b] text-white" : "bg-white text-gray-800")}>Linha</button>
                    <button className="px-3 py-1 text-xs font-bold text-gray-400">Barras</button>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d26a" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#00d26a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                      />
                      <Area type="monotone" dataKey="Receitas" stroke="#00d26a" strokeWidth={3} fillOpacity={1} fill="url(#colorReceitas)" />
                      <Area type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00d26a]" />
                    <span className="text-xs font-bold text-gray-500">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-gray-500">Despesas</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* EVOLUÇÃO DIÁRIA SECTION */}
            <div className="mb-8">
              <Card className="p-6">
                <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-white" : "text-gray-800")}>Evolução Diária do Lucro</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                      />
                      <Area type="monotone" dataKey="Receitas" stroke="#00d26a" fill="#00d26a" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* BOTTOM SECTION: TABLE AND DONUT */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Movimentações Table */}
              <Card className="xl:col-span-2" noPadding>
                <div className={cn(
                  "p-6 border-b flex justify-between items-center transition-colors duration-300",
                  darkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-white" : "text-gray-800")}>Movimentações do Período</h3>
                  <select className={cn(
                    "border rounded-lg px-3 py-1.5 text-xs font-medium outline-none transition-all",
                    darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                  )}>
                    <option>Todas categorias</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={cn(
                        "text-[10px] uppercase tracking-wider font-bold text-gray-400 border-b transition-colors duration-300",
                        darkMode ? "border-white/5" : "border-gray-50"
                      )}>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4 text-right">Valor</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y transition-colors duration-300", darkMode ? "divide-white/5" : "divide-gray-50")}>
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className={cn(
                          "transition-colors",
                          darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                        )}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-full",
                                t.type === 'income'
                                  ? (darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-green-500")
                                  : (darkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-500")
                              )}>
                                {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              </div>
                              <div>
                                <span className={cn("text-sm font-bold block", darkMode ? "text-gray-200" : "text-gray-700")}>{t.desc}</span>
                                {t.barber && <span className="text-[10px] text-gray-400">Barbeiro: {t.barber}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{t.category}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">{t.date}</td>
                          <td className={cn("px-6 py-4 text-sm font-bold text-right", t.type === 'income' ? "text-[#00d26a]" : "text-red-500")}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Right Column: Contas Pendentes & Donut */}
              <div className="space-y-6">
                <Card className="text-center py-10">
                  <h3 className={cn("text-sm font-bold mb-6", darkMode ? "text-white" : "text-gray-800")}>Contas Pendentes</h3>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                      darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                    )}>
                      <Check size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Todas as contas estão em dia!</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className={cn("text-sm font-bold mb-6", darkMode ? "text-white" : "text-gray-800")}>Despesas por Categoria</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                            color: darkMode ? '#ffffff' : '#000000'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-[10px] font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-500">{item.name}</span>
                        </div>
                        <span className={cn(darkMode ? "text-gray-200" : "text-gray-800")}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'receitas' && (
          <div className="space-y-8">
            {/* Abinha de Troca Rápida */}
            <div className={cn(
              "flex p-1 rounded-xl w-fit mb-4 transition-colors duration-300",
              darkMode ? "bg-[#1e293b]" : "bg-gray-100"
            )}>
              <button
                onClick={() => setActiveTab('receitas')}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'receitas'
                    ? (darkMode ? "bg-[#0f172a] text-[#00d26a] shadow-sm" : "bg-white text-[#00d26a] shadow-sm")
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveTab('despesas')}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'despesas'
                    ? (darkMode ? "bg-[#0f172a] text-red-500 shadow-sm" : "bg-white text-red-500 shadow-sm")
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Despesas
              </button>
            </div>

            {/* Cabeçalho Receitas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>Receitas</h1>
                <p className="text-gray-400 text-sm mt-1">Controle suas receitas de serviços e vendas</p>
              </div>
              <button
                onClick={() => {
                  setType('income');
                  setShowAddModal(true);
                }}
                className={cn(
                  "px-4 py-2 border rounded-lg font-bold text-sm transition-colors flex items-center gap-2",
                  darkMode ? "border-[#00d26a] text-[#00d26a] hover:bg-green-500/10" : "border-[#00d26a] text-[#00d26a] hover:bg-green-50"
                )}
              >
                <Plus size={18} /> Nova Receita
              </button>
            </div>

            {/* Filtros e Período Refinado (Receitas) */}
            <div className={cn(
              "flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm transition-colors duration-300",
              darkMode ? "bg-[#1e293b] border-white/5" : "bg-white border-gray-100"
            )}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <Search size={18} />
                  <span>Filtrar por Período:</span>
                </div>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={cn(
                      "appearance-none border rounded-xl px-4 py-2.5 pr-10 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                      darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-800"
                    )}
                  >
                    <option value="today" className={darkMode ? "bg-[#0f172a]" : ""}>Hoje</option>
                    <option value="yesterday" className={darkMode ? "bg-[#0f172a]" : ""}>Ontem</option>
                    <option value="7days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 7 Dias</option>
                    <option value="30days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 30 Dias</option>
                    <option value="all" className={darkMode ? "bg-[#0f172a]" : ""}>Todo o Período</option>
                    <option value="custom" className={darkMode ? "bg-[#0f172a]" : ""}>Personalizado (Calendário)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {dateFilter === 'custom' && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                    <span className="text-gray-300 font-bold">até</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                  </div>
                )}
              </div>
              <div className={cn("flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors duration-300", darkMode ? "bg-[#0f172a] border-white/10" : "bg-gray-50 border-gray-100")}>
                <Calendar size={12} />
                {dateFilter === 'today' ? 'Hoje' : dateFilter === 'yesterday' ? 'Ontem' : dateFilter === '7days' ? 'Últimos 7 dias' : dateFilter === '30days' ? 'Últimos 30 dias' : dateFilter === 'custom' ? 'Período Customizado' : 'Todo o período'}
              </div>
            </div>

            {/* Summary Cards Receitas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                )}>
                  <Scissors size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Serviços</p>
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income' && t.revenueType === 'services').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
                )}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Produtos</p>
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income' && t.revenueType === 'products').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-500"
                )}>
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cursos</p>
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income' && t.revenueType === 'courses').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-gray-500/10 text-gray-400" : "bg-gray-50 text-gray-500"
                )}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Outros</p>
                  <h3 className={cn("text-lg font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income' && t.revenueType === 'other').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                </div>
              </Card>
            </div>

            {/* Tabs Sub-Categorias */}
            <div className={cn("flex border-b transition-colors duration-300 overflow-x-auto", darkMode ? "border-white/5" : "border-gray-100")}>
              <button
                onClick={() => setRevenueSubTab('services')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                  revenueSubTab === 'services'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <Scissors size={16} /> Serviços
              </button>
              <button
                onClick={() => setRevenueSubTab('products')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                  revenueSubTab === 'products'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <CreditCard size={16} /> Produtos
              </button>
              <button
                onClick={() => setRevenueSubTab('courses')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                  revenueSubTab === 'courses'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <FileText size={16} /> Cursos
              </button>
              <button
                onClick={() => setRevenueSubTab('other')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                  revenueSubTab === 'other'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <TrendingUp size={16} /> Outros
              </button>
            </div>

            {/* Total Banner */}
            <div className={cn(
              "border rounded-xl p-6 flex justify-between items-center transition-colors duration-300",
              darkMode ? "bg-green-500/5 border-green-500/10" : "bg-green-50 border-green-100"
            )}>
              <div>
                <p className={cn("text-xs font-bold uppercase mb-1", darkMode ? "text-green-400/80" : "text-green-600")}>Total {revenueSubTab === 'services' ? 'Serviços' : 'Produtos'} no Período</p>
                <h3 className={cn("text-2xl font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income' && t.revenueType === revenueSubTab).reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                <p className={cn("text-[10px] font-bold mt-1", darkMode ? "text-green-400/60" : "text-green-600")}>Filtro ativo: {dateFilter}</p>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold", darkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700")}>
                {filteredTransactions.filter(t => t.type === 'income' && t.revenueType === revenueSubTab).length} registro(s)
              </div>
            </div>

            {/* Tabela de Receitas */}
            <Card noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={cn(
                      "text-[10px] uppercase tracking-wider font-bold text-gray-400 border-b transition-colors duration-300",
                      darkMode ? "border-white/5" : "border-gray-50"
                    )}>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y transition-colors duration-300", darkMode ? "divide-white/5" : "divide-gray-50")}>
                    {filteredTransactions.filter(t => t.type === 'income' && t.revenueType === revenueSubTab).map((t) => (
                      <tr key={t.id} className={cn(
                        "transition-colors",
                        darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                      )}>
                        <td className="px-6 py-4 text-xs text-gray-500 font-bold">{t.date}</td>
                        <td className="px-6 py-4">
                          <span className={cn("text-sm font-bold block", darkMode ? "text-gray-200" : "text-gray-700")}>{t.desc}</span>
                          {t.barber && <span className="text-[10px] text-gray-400">Barbeiro: {t.barber}</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">{t.category}</td>
                        <td className={cn("px-6 py-4 text-sm font-bold text-right", darkMode ? "text-green-400" : "text-[#00d26a]")}>
                          + {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            <button className="hover:text-gray-600 transition-colors cursor-pointer"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'despesas' && (
          <div className="space-y-8">
            {/* Abinha de Troca Rápida */}
            <div className={cn(
              "flex p-1 rounded-xl w-fit mb-4 transition-colors duration-300",
              darkMode ? "bg-[#1e293b]" : "bg-gray-100"
            )}>
              <button
                onClick={() => setActiveTab('receitas')}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'receitas'
                    ? (darkMode ? "bg-[#0f172a] text-[#00d26a] shadow-sm" : "bg-white text-[#00d26a] shadow-sm")
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveTab('despesas')}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === 'despesas'
                    ? (darkMode ? "bg-[#0f172a] text-red-500 shadow-sm" : "bg-white text-red-500 shadow-sm")
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Despesas
              </button>
            </div>

            {/* Cabeçalho Despesas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>Despesas</h1>
                <p className="text-gray-400 text-sm mt-1">Controle suas despesas profissionais e pessoais</p>
              </div>
              <button
                onClick={() => {
                  setType('expense');
                  setShowAddModal(true);
                }}
                className={cn(
                  "px-4 py-2 border rounded-lg font-bold text-sm transition-colors flex items-center gap-2",
                  darkMode ? "border-red-500 text-red-500 hover:bg-red-500/10" : "border-red-500 text-red-500 hover:bg-red-50"
                )}
              >
                <Plus size={18} /> Nova Despesa
              </button>
            </div>

            {/* Filtros e Período Refinado (Despesas) */}
            <div className={cn(
              "flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm transition-colors duration-300",
              darkMode ? "bg-[#1e293b] border-white/5" : "bg-white border-gray-100"
            )}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <Search size={18} />
                  <span>Filtrar por Período:</span>
                </div>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={cn(
                      "appearance-none border rounded-xl px-4 py-2.5 pr-10 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                      darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-800"
                    )}
                  >
                    <option value="today" className={darkMode ? "bg-[#0f172a]" : ""}>Hoje</option>
                    <option value="yesterday" className={darkMode ? "bg-[#0f172a]" : ""}>Ontem</option>
                    <option value="7days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 7 Dias</option>
                    <option value="30days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 30 Dias</option>
                    <option value="all" className={darkMode ? "bg-[#0f172a]" : ""}>Todo o Período</option>
                    <option value="custom" className={darkMode ? "bg-[#0f172a]" : ""}>Personalizado (Calendário)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {dateFilter === 'custom' && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                    <span className="text-gray-300 font-bold">até</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")}
                    />
                  </div>
                )}
              </div>
              <div className={cn("flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors duration-300", darkMode ? "bg-[#0f172a] border-white/10" : "bg-gray-50 border-gray-100")}>
                <Calendar size={12} />
                {dateFilter === 'today' ? 'Hoje' : dateFilter === 'yesterday' ? 'Ontem' : dateFilter === '7days' ? 'Últimos 7 dias' : dateFilter === '30days' ? 'Últimos 30 dias' : dateFilter === 'custom' ? 'Período Customizado' : 'Todo o período'}
              </div>
            </div>

            {/* Summary Cards Despesas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                )}>
                  <Briefcase size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Despesas Profissionais</p>
                  <h3 className="text-2xl font-bold text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'professional').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'professional').length} registro(s)</p>
                </div>
              </Card>
              <Card className="p-6 flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-500"
                )}>
                  <Home size={28} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Despesas Pessoais</p>
                  <h3 className="text-2xl font-bold text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'personal').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                  <p className="text-[10px] font-bold text-gray-400">{filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'personal').length} registro(s)</p>
                </div>
              </Card>
            </div>

            {/* Tabs Sub-Categorias */}
            <div className={cn("flex border-b transition-colors duration-300", darkMode ? "border-white/5" : "border-gray-100")}>
              <button
                onClick={() => setExpenseSubTab('professional')}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all border-b-2",
                  expenseSubTab === 'professional'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <Briefcase size={18} /> Profissionais
              </button>
              <button
                onClick={() => setExpenseSubTab('personal')}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all border-b-2",
                  expenseSubTab === 'personal'
                    ? "border-[#00d26a] text-[#00d26a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <Home size={18} /> Pessoais
              </button>
            </div>

            {/* Total Banner */}
            <div className={cn(
              "border rounded-xl p-6 flex justify-between items-center transition-colors duration-300",
              darkMode ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-100"
            )}>
              <div>
                <p className={cn("text-xs font-bold uppercase mb-1", darkMode ? "text-red-400/80" : "text-red-400")}>Total {expenseSubTab === 'professional' ? 'Profissional' : 'Pessoal'} no Período</p>
                <h3 className="text-2xl font-bold text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === expenseSubTab).reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                <p className={cn("text-[10px] font-bold mt-1", darkMode ? "text-red-400/60" : "text-red-400")}>Filtro ativo: {dateFilter}</p>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold", darkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600")}>
                {filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === expenseSubTab).length} registro(s)
              </div>
            </div>

            {/* Tabela de Despesas */}
            <Card noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={cn(
                      "text-[10px] uppercase tracking-wider font-bold text-gray-400 border-b transition-colors duration-300",
                      darkMode ? "border-white/5" : "border-gray-50"
                    )}>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y transition-colors duration-300", darkMode ? "divide-white/5" : "divide-gray-50")}>
                    {filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === expenseSubTab).map((t) => (
                      <tr key={t.id} className={cn(
                        "transition-colors",
                        darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                      )}>
                        <td className="px-6 py-4 text-xs text-gray-500 font-bold">{t.date}</td>
                        <td className={cn("px-6 py-4 text-sm font-bold", darkMode ? "text-gray-200" : "text-gray-700")}>{t.desc}</td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">{t.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-right text-red-500">
                          - {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            <button className="hover:text-gray-600 transition-colors cursor-pointer"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteTransaction(t.id)} className="hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )
        }

        {
          activeTab === 'contas' && (
            <div className="space-y-8">
              {/* Header Contas */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>Contas</h1>
                  <p className="text-gray-400 text-sm mt-1">Gerencie suas contas fixas e variáveis</p>
                </div>
              </div>

              {/* Filtros de Contas */}
              <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 rounded-2xl border shadow-sm transition-colors duration-300",
                darkMode ? "bg-[#1e293b] border-white/5" : "bg-white border-gray-100"
              )}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                    <Filter size={18} />
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold ml-2">
                      <Calendar size={18} />
                      <span>Período:</span>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={cn(
                        "appearance-none border rounded-xl px-4 py-2.5 pr-10 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-800"
                      )}
                    >
                      <option value="today" className={darkMode ? "bg-[#0f172a]" : ""}>Hoje</option>
                      <option value="yesterday" className={darkMode ? "bg-[#0f172a]" : ""}>Ontem</option>
                      <option value="7days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 7 Dias</option>
                      <option value="30days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 30 Dias</option>
                      <option value="90days" className={darkMode ? "bg-[#0f172a]" : ""}>Últimos 90 Dias</option>
                      <option value="all" className={darkMode ? "bg-[#0f172a]" : ""}>Todo o Período</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center lg:justify-end gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className={cn("px-3 py-1.5 rounded-lg border transition-colors duration-300", darkMode ? "bg-[#0f172a] border-white/10" : "bg-gray-50 border-gray-100")}>
                    {dateFilter === '90days' ? 'Últimos 90 dias (27/11 a 25/02)' : 'Fevereiro (01/02 a 28/02/2026)'}
                  </div>
                </div>
              </div>

              {/* Sub-tabs Fixas vs Variáveis */}
              <div className={cn(
                "flex p-1 rounded-2xl border shadow-sm relative overflow-hidden transition-colors duration-300",
                darkMode ? "bg-[#1e293b] border-white/5" : "bg-white border-gray-100"
              )}>
                <button
                  onClick={() => setActiveAccountTab('fixas')}
                  className={cn(
                    "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all z-10",
                    activeAccountTab === 'fixas' ? "text-[#00d26a]" : "text-gray-400"
                  )}
                >
                  <RefreshCw size={18} />
                  Contas Fixas
                </button>
                <button
                  onClick={() => setActiveAccountTab('variaveis')}
                  className={cn(
                    "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all z-10",
                    activeAccountTab === 'variaveis' ? "text-[#00d26a]" : "text-gray-400"
                  )}
                >
                  <Zap size={18} />
                  Contas Variáveis
                </button>
                <div
                  className={cn(
                    "absolute bottom-0 h-1 bg-[#00d26a] transition-all duration-300 rounded-full",
                    activeAccountTab === 'fixas' ? "left-0 w-1/2" : "left-1/2 w-1/2"
                  )}
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button onClick={() => { resetAccountForm(); setShowAccountModal(true); }}>
                  <Plus size={18} /> Nova Conta {activeAccountTab === 'fixas' ? 'Fixa' : 'Variável'}
                </Button>
              </div>

              {/* Summary Cards for Accounts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                  )}>
                    {activeAccountTab === 'fixas' ? <FileText size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total de Contas</p>
                    <h3 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-800")}>{accounts.filter(a => a.type === (activeAccountTab === 'fixas' ? 'fixa' : 'variavel')).length}</h3>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-500"
                  )}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Pendentes</p>
                    <h3 className="text-2xl font-bold text-orange-500">
                      {formatCurrency(accounts.filter(a => a.type === (activeAccountTab === 'fixas' ? 'fixa' : 'variavel') && a.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                  )}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Pagas</p>
                    <h3 className={cn("text-2xl font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>
                      {formatCurrency(accounts.filter(a => a.type === (activeAccountTab === 'fixas' ? 'fixa' : 'variavel') && a.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                  </div>
                </Card>
              </div>

              {/* Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.filter(a => a.type === (activeAccountTab === 'fixas' ? 'fixa' : 'variavel')).map((account) => (
                  <div key={account.id}>
                    <Card className="p-6 space-y-4 relative overflow-hidden h-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-gray-800")}>{account.name}</h3>
                          <p className="text-xs text-gray-400 font-medium">{account.category}</p>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1",
                          account.status === 'paid'
                            ? (darkMode ? "bg-green-500/10 text-[#00d26a]" : "bg-green-50 text-[#00d26a]")
                            : (darkMode ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-500")
                        )}>
                          <Clock size={12} />
                          {account.status === 'paid' ? 'Paga' : 'Pendente'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Valor</span>
                          <span className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>{formatCurrency(account.amount)}</span>
                        </div>
                        {account.type === 'variavel' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-medium">Tipo</span>
                            <span className={cn("font-bold", darkMode ? "text-gray-200" : "text-gray-800")}>{account.variableType === 'unica' ? 'Única' : 'Recorrente'}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Vencimento</span>
                          <span className={cn("font-bold", darkMode ? "text-gray-200" : "text-gray-800")}>Dia {account.dueDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 font-medium">Período</span>
                          <span className={cn("font-bold", darkMode ? "text-gray-200" : "text-gray-800")}>{account.referenceMonth}</span>
                        </div>
                        {account.status === 'paid' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-medium">Pago em</span>
                            <span className="font-bold text-[#00d26a]">{account.paidAt}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {account.status === 'pending' ? (
                          <Button onClick={() => handlePayAccount(account.id)} className="flex-1 text-xs">
                            <CheckCircle2 size={16} /> Pagar
                          </Button>
                        ) : (
                          <div className={cn(
                            "flex-1 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-2",
                            darkMode ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-400"
                          )}>
                            <CheckCircle2 size={16} /> Pago
                          </div>
                        )}
                        <button
                          onClick={() => { setEditingAccount(account); setAccName(account.name); setAccAmount(account.amount.toString()); setAccDueDate(account.dueDate.toString()); setAccMonth(account.referenceMonth); setAccCategory(account.category); setAccObs(account.observation || ''); if (account.type === 'variavel') setAccType(account.variableType); setShowAccountModal(true); }}
                          className={cn(
                            "p-2 rounded-lg transition-colors border",
                            darkMode ? "bg-white/5 text-gray-400 hover:text-[#00d26a] border-white/5" : "bg-gray-50 text-gray-400 hover:text-[#00d26a] border-gray-100"
                          )}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className={cn(
                            "p-2 rounded-lg transition-colors border",
                            darkMode ? "bg-white/5 text-gray-400 hover:text-red-500 border-white/5" : "bg-gray-50 text-gray-400 hover:text-red-500 border-gray-100"
                          )}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {
          activeTab === 'fechamentos' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className={cn("text-2xl font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-900")}>Fechamentos</h1>
                  <p className="text-gray-400 dark:text-gray-300 text-sm mt-1">Gerencie os fechamentos de caixa diários</p>
                </div>
                <Button onClick={() => { resetClosingForm(); setEditingClosing(null); setShowClosingModal(true); }}>
                  <Plus size={20} /> Novo Fechamento
                </Button>
              </div>

              {/* Filters */}
              <Card className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase">Início</label>
                    <input
                      type="date"
                      value={closingFilters.startDate}
                      onChange={(e) => setClosingFilters({ ...closingFilters, startDate: e.target.value })}
                      className={cn(
                        "w-full p-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00d26a]/20",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase">Fim</label>
                    <input
                      type="date"
                      value={closingFilters.endDate}
                      onChange={(e) => setClosingFilters({ ...closingFilters, endDate: e.target.value })}
                      className={cn(
                        "w-full p-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00d26a]/20",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                    <select
                      value={closingFilters.status}
                      onChange={(e) => setClosingFilters({ ...closingFilters, status: e.target.value })}
                      className={cn(
                        "w-full p-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00d26a]/20",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <option value="all">Todos</option>
                      <option value="open">Aberto</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Responsável</label>
                    <select
                      value={closingFilters.userId}
                      onChange={(e) => setClosingFilters({ ...closingFilters, userId: e.target.value })}
                      className={cn(
                        "w-full p-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00d26a]/20",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <option value="all">Todos</option>
                      {USERS.filter(u => u.active).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Table / Cards */}
              <div className="space-y-4">
                {/* Desktop/Tablet Table Layout */}
                <div className="hidden md:block">
                  <Card noPadding className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={cn(
                            "border-b transition-colors duration-300",
                            darkMode ? "bg-[#0f172a] border-white/5" : "bg-gray-50 border-gray-100"
                          )}>
                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Data</th>
                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Responsável</th>
                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Total</th>
                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Status</th>
                            <th className="hidden lg:table-cell px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Notas</th>
                            <th className="px-4 lg:px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {filteredClosings.length > 0 ? (
                            filteredClosings.map((closing) => (
                              <tr key={closing.id} className={cn(
                                "group transition-colors duration-200",
                                darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                              )}>
                                <td className="px-4 lg:px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className={cn("text-sm font-bold", darkMode ? "text-white" : "text-gray-800")}>
                                      {new Date(closing.date).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="text-[10px] text-gray-400">ID: {closing.id}</span>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <span className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-600")}>
                                    {USERS.find(u => u.id === closing.user_id)?.name || 'Desconhecido'}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <span className={cn("text-sm font-black", darkMode ? "text-white" : "text-gray-900")}>
                                    {formatCurrency(closing.total_amount)}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                  <span className={cn(
                                    "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                    closing.status === 'closed'
                                      ? (darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600")
                                      : (darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600")
                                  )}>
                                    {closing.status === 'closed' ? 'Fechado' : 'Aberto'}
                                  </span>
                                </td>
                                <td className="hidden lg:table-cell px-6 py-4">
                                  <p className="text-xs text-gray-400 truncate max-w-[200px]" title={closing.notes}>
                                    {closing.notes || '-'}
                                  </p>
                                </td>
                                <td className="px-4 lg:px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditClosing(closing)}
                                      className="p-2 text-gray-400 dark:text-gray-300 hover:text-[#00d26a] transition-colors cursor-pointer"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClosing(closing.id)}
                                      className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                  <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    darkMode ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-400"
                                  )}>
                                    <Calendar size={32} />
                                  </div>
                                  <div>
                                    <p className={cn("text-lg font-bold", darkMode ? "text-white" : "text-gray-800")}>Nenhum fechamento encontrado</p>
                                    <p className="text-sm text-gray-400">Comece criando o seu primeiro fechamento de caixa.</p>
                                  </div>
                                  <Button onClick={() => { resetClosingForm(); setEditingClosing(null); setShowClosingModal(true); }}>
                                    Criar primeiro fechamento
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {filteredClosings.length > 0 ? (
                    filteredClosings.map((closing) => (
                      <Card key={closing.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data do Fechamento</span>
                            <span className={cn("text-sm font-bold", darkMode ? "text-white" : "text-gray-800")}>
                              {new Date(closing.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            closing.status === 'closed'
                              ? (darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600")
                              : (darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600")
                          )}>
                            {closing.status === 'closed' ? 'Fechado' : 'Aberto'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável</span>
                            <span className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-600")}>
                              {USERS.find(u => u.id === closing.user_id)?.name || 'Desconhecido'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Geral</span>
                            <span className={cn("text-lg font-black", darkMode ? "text-[#00d26a]" : "text-[#00d26a]")}>
                              {formatCurrency(closing.total_amount)}
                            </span>
                          </div>
                        </div>

                        {closing.notes && (
                          <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Notas</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                              "{closing.notes}"
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                          <Button
                            variant="outline"
                            onClick={() => handleEditClosing(closing)}
                            className="flex-1 py-2 text-xs"
                          >
                            <Pencil size={14} /> Editar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteClosing(closing.id)}
                            className="flex-1 py-2 text-xs"
                          >
                            <Trash2 size={14} /> Excluir
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-10 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          darkMode ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-400"
                        )}>
                          <Calendar size={24} />
                        </div>
                        <p className={cn("text-sm font-bold", darkMode ? "text-white" : "text-gray-800")}>Nenhum fechamento encontrado</p>
                        <Button onClick={() => { resetClosingForm(); setEditingClosing(null); setShowClosingModal(true); }} className="w-full text-xs">
                          Criar primeiro fechamento
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {
          activeTab === 'relatorios' && (
            <div className="space-y-8">
              {/* Header Relatórios */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className={cn("text-2xl font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-900")}>Relatórios</h1>
                  <p className="text-gray-400 text-sm mt-1">Análise financeira do seu trabalho</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportToCSV} className="text-xs">
                    <FileText size={16} /> Exportar CSV
                  </Button>
                  <Button onClick={exportToPDF} className="text-xs">
                    <ArrowDownRight size={16} /> Exportar PDF
                  </Button>
                </div>
              </div>

              {/* Filtros de Relatório */}
              <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 rounded-2xl border shadow-sm transition-colors duration-300",
                darkMode ? "bg-[#1e293b] border-white/5" : "bg-white border-gray-100"
              )}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                    <Calendar size={18} />
                    <span>Período:</span>
                  </div>
                  <div className="relative">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={cn(
                        "appearance-none border rounded-xl px-4 py-2.5 pr-10 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-800"
                      )}
                    >
                      <option value="today">Hoje</option>
                      <option value="yesterday">Ontem</option>
                      <option value="7days">Últimos 7 Dias</option>
                      <option value="30days">Últimos 30 Dias</option>
                      <option value="all">Todo o Período</option>
                      <option value="custom">Personalizado</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {dateFilter === 'custom' && (
                    <div className="flex items-center gap-2">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} />
                      <span className="text-gray-300">até</span>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={cn("border rounded-xl px-3 py-2 text-xs font-bold outline-none", darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200")} />
                    </div>
                  )}
                </div>
                <div className="flex items-center lg:justify-end gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className={cn("px-3 py-1.5 rounded-lg border", darkMode ? "bg-[#0f172a] border-white/10" : "bg-gray-50 border-gray-100")}>
                    {dateFilter === 'all' ? 'Todo o período' :
                      dateFilter === 'today' ? 'Hoje' :
                        dateFilter === 'yesterday' ? 'Ontem' :
                          dateFilter === '7days' ? 'Últimos 7 dias' :
                            dateFilter === '30days' ? 'Últimos 30 dias' :
                              `${startDate.split('-').reverse().join('/')} a ${endDate.split('-').reverse().join('/')}`}
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={cn("p-6 flex items-center gap-4 border-l-4", darkMode ? "border-l-[#00d26a]/50" : "border-l-[#00d26a]")}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-green-500/10 text-green-500" : "bg-green-50 text-[#00d26a]"
                  )}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Receitas</p>
                    <h3 className={cn("text-xl font-bold", darkMode ? "text-green-400" : "text-[#00d26a]")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                  </div>
                </Card>
                <Card className={cn("p-6 flex items-center gap-4 border-l-4", darkMode ? "border-l-red-500/50" : "border-l-red-500")}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-500"
                  )}>
                    <TrendingDown size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Despesas</p>
                    <h3 className="text-xl font-bold text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0))}</h3>
                  </div>
                </Card>
                <Card className={cn("p-6 flex items-center gap-4 border-l-4", darkMode ? "border-l-blue-500/50" : "border-l-blue-500")}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    darkMode ? "bg-blue-500/10 text-blue-500" : "bg-blue-50 text-blue-500"
                  )}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Lucro</p>
                    <h3 className={cn("text-xl font-bold", darkMode ? "text-blue-400" : "text-blue-600")}>
                      {formatCurrency(
                        filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) -
                        filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
                      )}
                    </h3>
                  </div>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>Fluxo de Caixa</h3>
                    <div className={cn("flex p-1 rounded-lg", darkMode ? "bg-[#0f172a]" : "bg-gray-100")}>
                      <button
                        onClick={() => setReportChartType('line')}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                          reportChartType === 'line'
                            ? (darkMode ? "bg-[#1e293b] text-white shadow-sm" : "bg-white shadow-sm text-gray-800")
                            : "text-gray-400"
                        )}
                      >
                        Linha
                      </button>
                      <button
                        onClick={() => setReportChartType('bar')}
                        className={cn(
                          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                          reportChartType === 'bar'
                            ? (darkMode ? "bg-[#1e293b] text-white shadow-sm" : "bg-white shadow-sm text-gray-800")
                            : "text-gray-400"
                        )}
                      >
                        Barras
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {reportChartType === 'line' ? (
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorIncomeReport" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00d26a" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#00d26a" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenseReport" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              color: darkMode ? '#ffffff' : '#000000'
                            }}
                          />
                          <Area type="monotone" dataKey="receita" stroke="#00d26a" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomeReport)" />
                          <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseReport)" />
                        </AreaChart>
                      ) : (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              color: darkMode ? '#ffffff' : '#000000'
                            }}
                          />
                          <Legend iconType="circle" />
                          <Line type="monotone" dataKey="receita" stroke="#00d26a" strokeWidth={3} dot={{ r: 4, fill: '#00d26a' }} />
                          <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className={cn("font-bold mb-6", darkMode ? "text-white" : "text-gray-800")}>Despesas por Categoria</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-1/2 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              color: darkMode ? '#ffffff' : '#000000'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-3">
                      {categoryData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-gray-500 truncate max-w-[100px]">{item.name}</span>
                          </div>
                          <span className={cn("text-[10px] font-black", darkMode ? "text-gray-200" : "text-gray-800")}>{((item.value / categoryData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Breakdown Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingDown size={20} className="text-red-500" />
                    <h3 className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>Despesas por Categoria</h3>
                  </div>
                  <div className="space-y-6">
                    {categoryData.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-600">{item.name}</span>
                          <div className="flex gap-2">
                            <span className="text-gray-400">{((item.value / categoryData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%</span>
                            <span className={cn(darkMode ? "text-gray-200" : "text-gray-800")}>{formatCurrency(item.value)}</span>
                          </div>
                        </div>
                        <div className={cn("w-full h-2 rounded-full overflow-hidden", darkMode ? "bg-white/5" : "bg-gray-100")}>
                          <div className="h-full rounded-full" style={{ width: `${(item.value / categoryData.reduce((a, b) => a + b.value, 0)) * 100}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="space-y-8">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard size={20} className="text-blue-500" />
                      <h3 className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>Contas Fixas</h3>
                    </div>
                    <div className="space-y-3">
                      <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        darkMode ? "bg-green-500/5 border-green-500/10" : "bg-green-50 border-green-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#00d26a] rounded-full" />
                          <span className={cn("text-sm font-bold", darkMode ? "text-green-400/80" : "text-green-700")}>Pagas no período (0)</span>
                        </div>
                        <span className={cn("text-sm font-black", darkMode ? "text-green-400" : "text-[#00d26a]")}>R$ 0,00</span>
                      </div>
                      <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        darkMode ? "bg-orange-500/5 border-orange-500/10" : "bg-orange-50 border-orange-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full" />
                          <span className={cn("text-sm font-bold", darkMode ? "text-orange-400/80" : "text-orange-700")}>Pendentes (2)</span>
                        </div>
                        <span className={cn("text-sm font-black", darkMode ? "text-orange-500" : "text-orange-500")}>R$ 1.100,00</span>
                      </div>
                      <div className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        darkMode ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className={cn("text-sm font-bold", darkMode ? "text-red-400/80" : "text-red-700")}>Atrasadas (0)</span>
                        </div>
                        <span className={cn("text-sm font-black", darkMode ? "text-red-500" : "text-red-500")}>R$ 0,00</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <PieChartIcon size={20} className="text-[#00d26a]" />
                      <h3 className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>Distribuição de Despesas</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-[#00d26a] rounded-full" />
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Despesas Fixas</span>
                        </div>
                        <span className={cn("text-sm font-black", darkMode ? "text-gray-200" : "text-gray-800")}>R$ 0,00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-400 rounded-full" />
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Despesas Variáveis</span>
                        </div>
                        <span className={cn("text-sm font-black", darkMode ? "text-gray-200" : "text-gray-800")}>{formatCurrency(filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0))}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Professional vs Personal Row */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 size={20} className="text-[#00d26a]" />
                  <h3 className={cn("font-bold", darkMode ? "text-white" : "text-gray-800")}>Separação Profissional vs Pessoal</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className={cn(
                      "flex justify-between items-center p-4 rounded-xl border",
                      darkMode ? "bg-green-500/5 border-green-500/10" : "bg-green-50/50 border-green-100"
                    )}>
                      <span className={cn("text-sm font-bold", darkMode ? "text-green-400/80" : "text-green-800")}>Despesas Profissionais</span>
                      <span className="text-sm font-black text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'professional').reduce((acc, curr) => acc + curr.amount, 0))}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 px-1">20.0% da receita</p>
                    <div className="space-y-3 px-1">
                      {filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'professional').slice(0, 3).map((t, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{t.desc}</span>
                          <span className={cn("font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                      <button className="text-[10px] font-bold text-[#00d26a] hover:underline cursor-pointer">ver todas</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className={cn(
                      "flex justify-between items-center p-4 rounded-xl border",
                      darkMode ? "bg-orange-500/5 border-orange-500/10" : "bg-orange-50/50 border-orange-100"
                    )}>
                      <span className={cn("text-sm font-bold", darkMode ? "text-orange-400/80" : "text-orange-800")}>Despesas Pessoais</span>
                      <span className="text-sm font-black text-red-500">{formatCurrency(filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'personal').reduce((acc, curr) => acc + curr.amount, 0))}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 px-1">12.6% da receita</p>
                    <div className="space-y-3 px-1">
                      {filteredTransactions.filter(t => t.type === 'expense' && t.expenseType === 'personal').slice(0, 3).map((t, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">{t.desc}</span>
                          <span className={cn("font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                      <button className="text-[10px] font-bold text-[#00d26a] hover:underline cursor-pointer">ver todas</button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )
        }

        {
          activeTab === 'analise' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-500"
              )}>
                <FileText size={40} />
              </div>
              <h2 className={cn("text-xl font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-800")}>Análise de Desempenho</h2>
              <p className="text-gray-400 max-w-md mt-2">Insights inteligentes sobre seu negócio baseados em IA. Em breve!</p>
            </div>
          )
        }

        {
          activeTab === 'config' && (
            <div className="space-y-8 max-w-4xl pb-20">
              <div>
                <h1 className={cn("text-2xl font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-900")}>Configurações</h1>
                <p className="text-gray-400 text-sm mt-1">Gerencie sua conta e preferências do sistema</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <h3 className={cn("font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-800")}>Perfil</h3>
                  <p className="text-xs text-gray-400">Suas informações pessoais básicas.</p>
                </div>
                <Card className="md:col-span-2 p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={cn(
                          "w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                          darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className={cn(
                          "w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                          darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => alert('Perfil atualizado com sucesso!')} className="w-fit">Salvar Alterações</Button>
                  </div>
                </Card>

                <div className={cn("space-y-1 pt-4 border-t md:border-none", darkMode ? "border-white/5" : "border-gray-100")}>
                  <h3 className={cn("font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-800")}>Barbearia</h3>
                  <p className="text-xs text-gray-400">Dados do seu estabelecimento.</p>
                </div>
                <Card className="md:col-span-2 p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome da Barbearia</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={cn(
                        "w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20 transition-all",
                        darkMode ? "bg-[#0f172a] border-white/10 text-white" : "bg-gray-50 border-gray-200"
                      )}
                    />
                  </div>
                  <div className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border border-dashed transition-all",
                    darkMode ? "bg-[#0f172a] border-white/10" : "bg-gray-50 border-gray-200"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-lg border flex items-center justify-center text-gray-400 overflow-hidden",
                      darkMode ? "bg-[#1e293b] border-white/10" : "bg-white border-gray-200"
                    )}>
                      {businessLogo ? (
                        <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Scissors size={20} />
                      )}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold", darkMode ? "text-gray-300" : "text-gray-700")}>Logo da Empresa</p>
                      <div className="flex gap-3 mt-1">
                        <label className="text-[10px] font-bold text-[#00d26a] uppercase hover:underline cursor-pointer">
                          Alterar Logo
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                        </label>
                        {businessLogo && (
                          <button onClick={() => setBusinessLogo(null)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Remover</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => alert('Dados da barbearia atualizados!')} className="w-fit">Atualizar Dados</Button>
                  </div>
                </Card>

                <div className={cn("space-y-1 pt-4 border-t md:border-none", darkMode ? "border-white/5" : "border-gray-100")}>
                  <h3 className={cn("font-bold transition-colors duration-300", darkMode ? "text-white" : "text-gray-800")}>Preferências</h3>
                  <p className="text-xs text-gray-400">Personalize sua experiência.</p>
                </div>
                <Card className="md:col-span-2 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm font-bold transition-colors duration-300", darkMode ? "text-gray-50" : "text-gray-700")}>Modo Escuro</p>
                      <p className={cn("text-xs transition-colors duration-300", darkMode ? "text-gray-300" : "text-gray-400")}>Ativar tema escuro em todo o sistema.</p>
                    </div>
                    <div
                      onClick={() => setDarkMode(!darkMode)}
                      className={cn(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                        darkMode ? "bg-[#00d26a]" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                        darkMode ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm font-bold transition-colors duration-300", darkMode ? "text-gray-50" : "text-gray-700")}>Notificações por E-mail</p>
                      <p className={cn("text-xs transition-colors duration-300", darkMode ? "text-gray-300" : "text-gray-400")}>Receber resumos semanais de desempenho.</p>
                    </div>
                    <div
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={cn(
                        "w-12 h-6 rounded-full relative cursor-pointer transition-colors",
                        emailNotifications ? "bg-[#00d26a]" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                        emailNotifications ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
                </Card>

                <div className={cn("space-y-1 pt-4 border-t md:border-none", darkMode ? "border-white/5" : "border-gray-100")}>
                  <h3 className="font-bold text-red-600">Dados e Segurança</h3>
                  <p className="text-xs text-gray-400">Ações críticas do sistema.</p>
                </div>
                <Card className={cn("md:col-span-2 p-6 space-y-4 border-red-100", darkMode ? "border-red-500/20" : "")}>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportToCSV}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        darkMode ? "bg-[#0f172a] text-gray-300 hover:bg-[#1e293b]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      Exportar Dados (CSV)
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Isso apagará todos os seus dados. Deseja continuar?')) {
                          localStorage.removeItem('pentefino_data');
                          localStorage.removeItem('pentefino_accounts');
                          localStorage.removeItem('pentefino_settings');
                          localStorage.removeItem('pentefino_lgpd');
                          window.location.reload();
                        }
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                        darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                    >
                      Resetar Sistema
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )
        }
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#00d26a] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-40"
      >
        <Plus size={28} />
      </button>

      {/* MODAL DE FECHAMENTO */}
      <Modal
        isOpen={showClosingModal}
        onClose={() => setShowClosingModal(false)}
        title={`${editingClosing ? 'Editar' : 'Novo'} Fechamento`}
        darkMode={darkMode}
        onSubmit={handleAddClosing}
        footer={
          <Button type="submit" className="w-full py-3 md:py-3.5 text-sm md:text-base">
            {editingClosing ? 'Salvar Alterações' : 'Confirmar Fechamento'}
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Data</label>
            <input
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className={cn(
                "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
              )}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Responsável</label>
            <div className="relative">
              <select
                value={closingUserId}
                onChange={(e) => setClosingUserId(e.target.value)}
                className={cn(
                  "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium appearance-none pr-10 text-sm md:text-base",
                  darkMode
                    ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                    : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
                )}
                required
              >
                <option value="" className={darkMode ? "bg-[#0f172a]" : ""}>Selecione</option>
                {USERS.filter(u => u.active).map(u => (
                  <option key={u.id} value={u.id} className={darkMode ? "bg-[#0f172a]" : ""}>{u.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              placeholder="0,00"
              className={cn(
                "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-bold text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
              )}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
            <div className="relative">
              <select
                value={closingStatus}
                onChange={(e) => setClosingStatus(e.target.value as 'open' | 'closed')}
                className={cn(
                  "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium appearance-none pr-10 text-sm md:text-base",
                  darkMode
                    ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                    : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
                )}
              >
                <option value="open" className={darkMode ? "bg-[#0f172a]" : ""}>Aberto</option>
                <option value="closed" className={darkMode ? "bg-[#0f172a]" : ""}>Fechado</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Notas (opcional)</label>
          <textarea
            value={closingNotes}
            onChange={(e) => setClosingNotes(e.target.value)}
            placeholder="Observações sobre o fechamento..."
            rows={2}
            className={cn(
              "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium resize-none text-sm md:text-base",
              "max-h-[80px] md:max-h-none",
              darkMode
                ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
            )}
          />
        </div>
      </Modal>

      {/* MODAL DE CONTA (FIXA/VARIÁVEL) */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title={`${editingAccount ? 'Editar' : 'Cadastrar'} Conta ${activeAccountTab === 'fixas' ? 'Fixa' : 'Variável'}`}
        darkMode={darkMode}
        onSubmit={handleAddAccount}
        footer={
          <Button type="submit" className="w-full py-3 md:py-3.5 text-sm md:text-base">
            {editingAccount ? 'Salvar Alterações' : 'Cadastrar Conta'}
          </Button>
        }
      >
        <div className="space-y-1">
          <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Nome da Conta</label>
          <input
            type="text"
            value={accName}
            onChange={(e) => setAccName(e.target.value)}
            placeholder="Ex: Aluguel, Internet, Parcelamento..."
            className={cn(
              "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium text-sm md:text-base",
              darkMode
                ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
            )}
            required
          />
        </div>

        {activeAccountTab === 'variaveis' && (
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de Conta</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="accType"
                  checked={accType === 'unica'}
                  onChange={() => setAccType('unica')}
                  className="w-4 h-4 text-[#00d26a] focus:ring-[#00d26a]"
                />
                <span className={cn("text-xs md:text-sm font-medium transition-colors", darkMode ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-gray-800")}>Única</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="accType"
                  checked={accType === 'recorrente'}
                  onChange={() => { setAccType('recorrente'); setAccDuration('2'); }}
                  className="w-4 h-4 text-[#00d26a] focus:ring-[#00d26a]"
                />
                <span className={cn("text-xs md:text-sm font-medium transition-colors", darkMode ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-gray-800")}>Recorrente</span>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={accAmount}
              onChange={(e) => setAccAmount(e.target.value)}
              placeholder="0,00"
              className={cn(
                "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-bold text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
              )}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Dia Vencimento</label>
            <input
              type="number"
              min="1"
              max="31"
              value={accDueDate}
              onChange={(e) => setAccDueDate(e.target.value)}
              className={cn(
                "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-bold text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
              )}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Mês Referência</label>
            <div className="relative">
              <select
                value={accMonth}
                onChange={(e) => setAccMonth(e.target.value)}
                className={cn(
                  "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium appearance-none pr-10 text-sm md:text-base",
                  darkMode
                    ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                    : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
                )}
              >
                {referenceMonthOptions.map(opt => (
                  <option key={opt} value={opt} className={darkMode ? "bg-[#0f172a]" : ""}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Categoria</label>
            <div className="relative">
              <select
                value={accCategory}
                onChange={(e) => setAccCategory(e.target.value)}
                className={cn(
                  "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium appearance-none pr-10 text-sm md:text-base",
                  darkMode
                    ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                    : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
                )}
              >
                <option value="Aluguel" className={darkMode ? "bg-[#0f172a]" : ""}>Aluguel</option>
                <option value="Internet / Telefone" className={darkMode ? "bg-[#0f172a]" : ""}>Internet / Telefone</option>
                <option value="Energia" className={darkMode ? "bg-[#0f172a]" : ""}>Energia</option>
                <option value="Água" className={darkMode ? "bg-[#0f172a]" : ""}>Água</option>
                <option value="Manutenção" className={darkMode ? "bg-[#0f172a]" : ""}>Manutenção</option>
                <option value="Outras Despesas" className={darkMode ? "bg-[#0f172a]" : ""}>Outras Despesas</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {accType === 'recorrente' && activeAccountTab === 'variaveis' && (
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Duração (meses)</label>
            <input
              type="number"
              min="2"
              value={accDuration}
              onChange={(e) => setAccDuration(e.target.value)}
              className={cn(
                "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-bold text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
              )}
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide">Observação (opcional)</label>
          <textarea
            value={accObs}
            onChange={(e) => setAccObs(e.target.value)}
            placeholder="Detalhes adicionais..."
            rows={2}
            className={cn(
              "w-full border rounded-xl px-3 py-2 md:px-4 md:py-2.5 outline-none transition-all font-medium resize-none text-sm md:text-base",
              "max-h-[80px] md:max-h-none",
              darkMode
                ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00d26a]/20"
            )}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Novo Lançamento"
        darkMode={darkMode}
        onSubmit={handleAddTransaction}
        footer={
          <Button type="submit" className="w-full py-3 md:py-3.5 text-sm md:text-base">
            Registrar Lançamento
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              "p-2.5 md:p-3 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer text-sm md:text-base",
              type === 'income'
                ? "border-[#00d26a] bg-[#00d26a]/10 text-[#00d26a]"
                : (darkMode ? "border-white/5 text-gray-500 hover:border-white/10" : "border-gray-100 text-gray-400")
            )}
          >
            <TrendingUp size={18} /> Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              "p-2.5 md:p-3 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer text-sm md:text-base",
              type === 'expense'
                ? "border-red-500 bg-red-500/10 text-red-500"
                : (darkMode ? "border-white/5 text-gray-500 hover:border-white/10" : "border-gray-100 text-gray-400")
            )}
          >
            <TrendingDown size={18} /> Saída
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className={cn("block text-[10px] md:text-xs font-bold uppercase tracking-wide", darkMode ? "text-gray-400" : "text-gray-500")}>Valor (R$)</label>
            <input
              type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={cn(
                "w-full p-2.5 md:p-3 border rounded-xl outline-none transition-all text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-[#00d26a] focus:border-[#00d26a]"
              )}
            />
          </div>

          <div className="space-y-1">
            <label className={cn("block text-[10px] md:text-xs font-bold uppercase tracking-wide", darkMode ? "text-gray-400" : "text-gray-500")}>Data</label>
            <input
              type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full p-2.5 md:p-3 border rounded-xl outline-none transition-all text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-[#00d26a] focus:border-[#00d26a]"
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {type === 'expense' && (
            <div className="space-y-1">
              <label className={cn("block text-[10px] md:text-xs font-bold uppercase tracking-wide", darkMode ? "text-gray-400" : "text-gray-500")}>Tipo de Despesa</label>
              <select
                value={expenseType} onChange={(e) => setExpenseType(e.target.value as any)}
                className={cn(
                  "w-full p-2.5 md:p-3 border rounded-xl outline-none transition-all text-sm md:text-base",
                  darkMode
                    ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                    : "bg-white border-gray-200 focus:ring-2 focus:ring-[#00d26a]"
                )}
              >
                <option value="professional" className={darkMode ? "bg-[#0f172a]" : ""}>Profissional</option>
                <option value="personal" className={darkMode ? "bg-[#0f172a]" : ""}>Pessoal</option>
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className={cn("block text-[10px] md:text-xs font-bold uppercase tracking-wide", darkMode ? "text-gray-400" : "text-gray-500")}>Categoria</label>
            <select
              value={category} onChange={(e) => setCategory(e.target.value)}
              className={cn(
                "w-full p-2.5 md:p-3 border rounded-xl outline-none transition-all font-medium text-sm md:text-base",
                darkMode
                  ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                  : "bg-white border-gray-200 focus:ring-2 focus:ring-[#00d26a]"
              )}
            >
              <option value="" className={darkMode ? "bg-[#0f172a]" : ""}>Selecione</option>
              {type === 'income' ? (
                <>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Corte</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Barba</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Combo</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Venda de Produto</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Cursos</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Outros</option>
                </>
              ) : (
                <>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Produtos (pomadas, gel, lâminas, toalhas descartáveis, álcool, etc.)</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>DAS (MEI)</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Plano de Celular</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Internet</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Moradia</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Alimentação</option>
                  <option className={darkMode ? "bg-[#0f172a]" : ""}>Outros</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className={cn("block text-[10px] md:text-xs font-bold uppercase tracking-wide", darkMode ? "text-gray-400" : "text-gray-500")}>Descrição (opcional)</label>
          <textarea
            value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Detalhes do lançamento..."
            rows={2}
            className={cn(
              "w-full p-2.5 md:p-3 border rounded-xl outline-none transition-all text-sm md:text-base resize-none",
              "max-h-[80px] md:max-h-none",
              darkMode
                ? "bg-[#0f172a] border-white/10 text-white focus:ring-2 focus:ring-[#00d26a]/20"
                : "bg-white border-gray-200 focus:ring-2 focus:ring-[#00d26a] focus:border-[#00d26a]"
            )}
          />
        </div>
      </Modal>

      {/* BANNER DE CONSENTIMENTO LGPD */}
      <AnimatePresence>
        {!isLgpdAccepted && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-50"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-[#00d26a] shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-bold text-sm">Privacidade e Termos de Uso (LGPD)</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Para garantir a sua segurança e cumprir com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
                    informamos que seus dados financeiros inseridos neste painel são armazenados localmente. Não compartilhamos suas métricas com terceiros.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <button className="px-4 py-2 rounded-lg font-medium border border-gray-600 text-white hover:bg-gray-800 transition-colors cursor-pointer">Ler Termos</button>
                <button onClick={acceptLgpd} className="px-4 py-2 rounded-lg font-medium bg-[#00d26a] hover:bg-[#00b35a] text-white flex items-center gap-2 transition-colors cursor-pointer">
                  <Check size={16} /> Aceitar e Continuar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
