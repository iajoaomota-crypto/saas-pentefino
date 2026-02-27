import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, FileText, Settings, Menu, X, Scissors, Wifi, WifiOff, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { useDashboardData } from '../hooks/useDashboardData';
import { MetricSection } from '../components/dashboard/MetricSection';
import { TransactionsModule } from '../components/dashboard/TransactionsModule';
import { AccountsModule } from '../components/dashboard/AccountsModule';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { TransactionModal, AccountModal, ClosingModal } from '../components/dashboard/DashboardModals';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const {
    transactions, accounts, closings, isOnline,
    dateFilter, setDateFilter, startDate, setStartDate, endDate, setEndDate,
    filteredTransactions, stats,
    handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
    handleAddAccount, handleUpdateAccount, handleDeleteAccount, handleToggleAccountStatus
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editingClosing, setEditingClosing] = useState<any>(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'contas', label: 'Contas', icon: DollarSign },
    { id: 'fechamentos', label: 'Fechamentos', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'analise', label: 'Análise', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <MetricSection stats={stats} darkMode={darkMode} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DashboardCharts transactions={filteredTransactions} darkMode={darkMode} />
              <TransactionsModule
                transactions={filteredTransactions.slice(0, 5)}
                darkMode={darkMode}
                onDelete={handleDeleteTransaction}
                onEdit={(t) => { setEditingTransaction(t); setShowAddModal(true); }}
              />
            </div>
          </div>
        );
      case 'receitas':
      case 'despesas':
        return (
          <TransactionsModule
            transactions={filteredTransactions.filter(t => t.type === (activeTab === 'receitas' ? 'income' : 'expense'))}
            darkMode={darkMode}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setShowAddModal(true); }}
          />
        );
      case 'contas':
        return (
          <AccountsModule
            accounts={accounts}
            darkMode={darkMode}
            onDelete={handleDeleteAccount}
            onToggleStatus={handleToggleAccountStatus}
            onEdit={(acc) => { setEditingAccount(acc); setShowAccountModal(true); }}
          />
        );
      default:
        return <div className="p-20 text-center text-gray-400">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300", darkMode ? "dark bg-[#121212] text-gray-100" : "bg-[#f8fafc] text-gray-800")}>

      {/* Sidebar and Mobile Menu logic here (omitted for brevity in this step, but I'll include full logic) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 flex flex-col h-screen overflow-y-auto transition-all duration-500 z-50 md:sticky md:top-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        darkMode ? "bg-[#1E1E1E] text-white border-r border-white/5" : "bg-white text-gray-900 border-r border-gray-100 shadow-xl"
      )}>
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00d26a] rounded-lg flex items-center justify-center text-white"><Scissors size={24} /></div>
          <div><span className="text-sm font-bold">Pente Fino</span></div>
        </div>
        <nav className="px-4 flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", activeTab === item.id ? "bg-[#00d26a] text-white shadow-lg" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5")}>
              <item.icon size={18} /> <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-white/5">
          <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
            <Settings size={18} /> <span className="text-sm">Configurações</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              {isOnline ? <><Wifi size={12} className="text-green-500" /> Online</> : <><WifiOff size={12} className="text-red-500" /> Offline</>}
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowAddModal(true)} className="bg-[#00d26a] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={18} /> Novo Lançamento</button>
          </div>
        </header>

        {renderContent()}

        {/* Modals */}
        <TransactionModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setEditingTransaction(null); }}
          onSubmit={editingTransaction ? (t) => handleUpdateTransaction(editingTransaction.id, t) : handleAddTransaction}
          darkMode={darkMode}
          editingTransaction={editingTransaction}
        />
        <AccountModal
          isOpen={showAccountModal}
          onClose={() => { setShowAccountModal(false); setEditingAccount(null); }}
          onSubmit={editingAccount ? (acc) => handleUpdateAccount(editingAccount.id, acc) : handleAddAccount}
          darkMode={darkMode}
          activeTab="fixas" // Default for now
          editingAccount={editingAccount}
        />
      </main>
    </div>
  );
}
