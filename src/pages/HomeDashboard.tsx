import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar, BarChart3, FileText, Settings, Menu, X, Scissors, Wifi, WifiOff, Plus, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { useDashboardData } from '../hooks/useDashboardData';
import { MetricSection } from '../components/dashboard/MetricSection';
import { TransactionsModule } from '../components/dashboard/TransactionsModule';
import { AccountsModule } from '../components/dashboard/AccountsModule';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { Card, Button } from '../components/ui';
import { TransactionModal, AccountModal, ClosingModal } from '../components/dashboard/DashboardModals';
import { SettingsModule } from '../components/dashboard/SettingsModule';
import { ReportsModule } from '../components/dashboard/ReportsModule';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const {
    transactions, accounts, closings, isOnline,
    dateFilter, setDateFilter, startDate, setStartDate, endDate, setEndDate,
    searchTerm, setSearchTerm, subTab, setSubTab, accountsTab, setAccountsTab,
    commissionRate, setCommissionRate,
    filteredTransactions, stats, loading,
    handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction,
    handleAddAccount, handleUpdateAccount, handleDeleteAccount, handleToggleAccountStatus,
    handleAddClosing
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pentefino_data');
    localStorage.removeItem('pentefino_accounts');
    localStorage.removeItem('pentefino_closings');
    navigate('/login');
  };

  const hasData = transactions.length > 0 || accounts.length > 0;

  if (loading && !hasData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00d26a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 animate-pulse">Sincronizando seus dados...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receitas', label: 'Receitas', icon: ArrowUpCircle },
    { id: 'despesas', label: 'Despesas', icon: ArrowDownCircle },
    { id: 'contas', label: 'Contas', icon: DollarSign },
    { id: 'fechamentos', label: 'Fechamentos', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'analise', label: 'Análise', icon: FileText },
    { id: 'configuracao', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 pb-12">
            <MetricSection stats={stats} darkMode={darkMode} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DashboardCharts transactions={filteredTransactions} darkMode={darkMode} />
              </div>
              <div className="space-y-8">
                {/* Pending Accounts Section */}
                <Card className="p-6 transition-all duration-300 bg-white dark:bg-[#1E1E1E] border-none shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Contas Pendentes</h3>
                    <button onClick={() => setActiveTab('contas')} className="text-[10px] font-bold text-[#00d26a] hover:underline uppercase">Ver todas</button>
                  </div>
                  <div className="space-y-4">
                    {(stats as any).pendingAccountsList && (stats as any).pendingAccountsList.length > 0 ? (
                      (stats as any).pendingAccountsList.map((acc: any) => (
                        <div key={acc.id} className="flex justify-between items-center group">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#00d26a] transition-colors">{acc.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Vence dia {acc.dueDate}</span>
                          </div>
                          <span className="text-sm font-black text-red-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 text-xs italic">Nenhuma conta pendente. 🎉</div>
                    )}
                  </div>
                  {(stats as any).totalPendingAccounts > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pendente</span>
                      <span className="text-lg font-black text-red-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((stats as any).totalPendingAccounts)}</span>
                    </div>
                  )}
                </Card>

                <TransactionsModule
                  transactions={filteredTransactions.slice(0, 5)}
                  darkMode={darkMode}
                  onDelete={handleDeleteTransaction}
                  onEdit={(t) => { setEditingTransaction(t); setShowAddModal(true); }}
                />
              </div>
            </div>
          </div>
        );
      case 'receitas':
      case 'despesas':
        return (
          <TransactionsModule
            transactions={filteredTransactions.filter(t => t.type === (activeTab === 'receitas' ? 'income' : 'expense'))}
            type={activeTab === 'receitas' ? 'income' : 'expense'}
            darkMode={darkMode}
            onDelete={handleDeleteTransaction}
            onEdit={(t) => { setEditingTransaction(t); setShowAddModal(true); }}
            subTab={subTab}
            setSubTab={setSubTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        );
      case 'contas':
        return (
          <AccountsModule
            accounts={accounts}
            activeTab={accountsTab}
            setActiveTab={setAccountsTab}
            onAddAccount={() => setShowAccountModal(true)}
            onEditAccount={(acc) => { setEditingAccount(acc); setShowAccountModal(true); }}
            onDeleteAccount={handleDeleteAccount}
            onToggleStatus={handleToggleAccountStatus}
          />
        );
      case 'fechamentos':
        return (
          <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Histórico de Fechamentos</h2>
              <Button onClick={() => setShowClosingModal(true)} className="bg-[#00d26a] hover:bg-[#00b85c] text-white gap-2">
                <Plus size={18} /> Novo Fechamento
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closings.map(c => (
                <Card key={c.id} className="p-4 bg-white dark:bg-[#1E1E1E]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-bold">{c.date}</span>
                    <span className="text-xs bg-[#00d26a]/10 text-[#00d26a] px-2 py-0.5 rounded-full font-bold">FECHADO</span>
                  </div>
                  <div className="text-lg font-bold mb-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.total_amount)}</div>
                  <p className="text-xs text-gray-500 line-clamp-2">{c.notes || 'Sem observações'}</p>
                </Card>
              ))}
              {closings.length === 0 && <div className="col-span-full py-12 text-center text-gray-400 italic">Nenhum fechamento registrado.</div>}
            </div>
          </div>
        );
      case 'relatorios':
        return <ReportsModule stats={stats} transactions={transactions} />;
      case 'configuracao':
        return <SettingsModule
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          commissionRate={commissionRate}
          setCommissionRate={setCommissionRate}
          onLogout={handleLogout}
        />;
      default:
        return <div className="p-20 text-center text-gray-400">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className={cn("h-screen flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-300", darkMode ? "dark bg-[#121212] text-gray-100" : "bg-[#f8fafc] text-gray-800")}>

      {/* Sidebar for Desktop / Menu for Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 flex flex-col h-screen overflow-y-auto transition-transform duration-300 z-[60] md:sticky md:top-0 md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        darkMode ? "bg-[#1E1E1E] text-white border-r border-white/5" : "bg-white text-gray-900 border-r border-gray-100 shadow-xl"
      )}>
        <div className="p-6 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:scale-105">
              <img src="/logo.png" alt="Logo Pente Fino" className="w-full h-full object-contain p-1.5" />
            </div>
            <div><span className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">Pente Fino</span></div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="px-4 flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left", activeTab === item.id ? "bg-[#00d26a] text-white shadow-lg" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5")}>
              <item.icon size={18} /> <span className="text-sm">{item.label}</span>
            </button>
          ))}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all text-left"
              >
                <Shield size={18} /> <span className="text-sm">Painel Admin</span>
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar relative px-4 md:px-8 lg:px-12 pt-20 md:pt-8">
        {/* Mobile App Bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl">
              <Menu size={24} />
            </button>
            <div className="w-9 h-9 bg-white dark:bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <h1 className="font-bold text-gray-800 dark:text-white uppercase text-[10px] tracking-widest">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
          </div>
          <button onClick={() => setShowAddModal(true)} className="w-10 h-10 bg-[#00d26a] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Plus size={24} />
          </button>
        </div>

        <header className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              {isOnline ? <><Wifi size={12} className="text-green-500" /> Online</> : <><WifiOff size={12} className="text-red-500" /> Offline</>}
              {loading && <span className="ml-2 flex items-center gap-1 text-[#00d26a] animate-pulse"><div className="w-1.5 h-1.5 bg-[#00d26a] rounded-full" /> Sincronizando...</span>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              {[
                { id: 'today', label: 'Hoje' },
                { id: 'yesterday', label: 'Ontem' },
                { id: '7days', label: '7 dias' },
                { id: '14days', label: '14 dias' },
                { id: 'month', label: 'Mensal' },
                { id: 'custom', label: 'Per.' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    dateFilter === f.id ? "bg-white dark:bg-[#2A2A2A] text-[#00d26a] shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(true)} className="bg-[#00d26a] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"><Plus size={18} /> Novo Lançamento</button>
          </div>
        </header>

        {/* Mobile Date Filters (Horizontal Scrollable) */}
        <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar scrollbar-hide">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'yesterday', label: 'Ontem' },
            { id: '7days', label: '7 dias' },
            { id: '14days', label: '14 dias' },
            { id: 'month', label: 'Mensal' },
            { id: 'custom', label: 'Personalizado' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                dateFilter === f.id ? "bg-[#00d26a] text-white shadow-md" : "bg-white dark:bg-[#1E1E1E] text-gray-500 border border-gray-100 dark:border-white/5"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {dateFilter === 'custom' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid grid-cols-2 gap-4 bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Início</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg text-sm font-bold border-none outline-none" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fim</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg text-sm font-bold border-none outline-none" />
            </div>
          </motion.div>
        )}

        <div className="relative">
          {renderContent()}
        </div>

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
          onSubmit={editingAccount ? (acc, months) => handleUpdateAccount(editingAccount.id, acc) : handleAddAccount}
          darkMode={darkMode}
          activeTab={accountsTab}
          editingAccount={editingAccount}
        />
        <ClosingModal
          isOpen={showClosingModal}
          onClose={() => { setShowClosingModal(false); setEditingClosing(null); }}
          onSubmit={editingClosing ? (c) => { } : handleAddClosing}
          darkMode={darkMode}
          editingClosing={editingClosing}
        />
      </main>
    </div>
  );
}
