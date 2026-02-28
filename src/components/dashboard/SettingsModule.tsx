import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { Shield, Database, Moon, Sun, Trash2, Smartphone, Download, Upload, Percent, User, Mail, Lock, LogOut, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModuleProps {
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    commissionRate: number;
    setCommissionRate: (val: number) => void;
    onLogout: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
    darkMode, setDarkMode, commissionRate, setCommissionRate, onLogout
}) => {
    const [userName, setUserName] = useState(localStorage.getItem('pentefino_user_name') || 'Usuário');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('pentefino_user_email') || 'usuario@email.com');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSaveProfile = () => {
        localStorage.setItem('pentefino_user_name', userName);
        localStorage.setItem('pentefino_user_email', userEmail);
        alert("Perfil atualizado localmente!");
    };

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword) {
            alert("Preencha todos os campos de senha.");
            return;
        }
        // In a real app, this would be an API call
        alert("Senha alterada com sucesso! (Simulação)");
        setCurrentPassword('');
        setNewPassword('');
        setShowPasswordFields(false);
    };

    const handleClearLocalStorage = () => {
        if (window.confirm("Isso apagará todos os seus lançamentos e contas locais. Tem certeza?")) {
            localStorage.removeItem('pentefino_data');
            localStorage.removeItem('pentefino_accounts');
            localStorage.removeItem('pentefino_closings');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.reload();
        }
    };

    const handleExportBackup = () => {
        const data = {
            transactions: localStorage.getItem('pentefino_data'),
            accounts: localStorage.getItem('pentefino_accounts'),
            closings: localStorage.getItem('pentefino_closings'),
            settings: { commissionRate, darkMode, userName, userEmail }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pentefino_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.transactions) localStorage.setItem('pentefino_data', data.transactions);
                if (data.accounts) localStorage.setItem('pentefino_accounts', data.accounts);
                if (data.closings) localStorage.setItem('pentefino_closings', data.closings);
                if (data.settings?.commissionRate) setCommissionRate(data.settings.commissionRate);
                if (data.settings?.userName) localStorage.setItem('pentefino_user_name', data.settings.userName);
                if (data.settings?.userEmail) localStorage.setItem('pentefino_user_email', data.settings.userEmail);
                alert("Backup restaurado com sucesso! Recarregando...");
                window.location.reload();
            } catch (err) {
                alert("Erro ao importar backup. Arquivo inválido.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Section */}
                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm md:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#00d26a]/10 rounded-2xl text-[#00d26a]">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Meu Perfil</h3>
                            <p className="text-xs text-gray-400">Informações básicas da conta</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome Completo</label>
                            <input
                                type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">E-mail de Acesso</label>
                            <input
                                type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20"
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveProfile} className="bg-[#00d26a] hover:bg-[#00b85c] text-white px-8">Salvar Perfil</Button>
                </Card>

                {/* Security Section */}
                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white">Segurança</h3>
                                <p className="text-xs text-gray-400">Proteja seu acesso ao sistema</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                            className="text-sm text-[#00d26a]"
                        >
                            {showPasswordFields ? 'Cancelar' : 'Mudar Senha'}
                        </Button>
                    </div>

                    {showPasswordFields && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Senha Atual</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none"
                                        />
                                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nova Senha</label>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleChangePassword} className="bg-gray-800 text-white hover:bg-black px-8">Atualizar Senha</Button>
                        </motion.div>
                    )}
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Moon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Aparência</h3>
                            <p className="text-xs text-gray-400">Personalizar cores do sistema</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <span className="text-sm font-medium">Modo Escuro</span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-[#00d26a]' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                            <Percent size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Financeiro</h3>
                            <p className="text-xs text-gray-400">Comissões e taxas padrão</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Comissão Padrão (%)</label>
                        <input
                            type="number"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none"
                        />
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#00d26a]/10 rounded-2xl text-[#00d26a]">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Backup e Dados</h3>
                            <p className="text-xs text-gray-400">Proteja seus dados</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button variant="ghost" onClick={handleExportBackup} className="w-full justify-start bg-gray-50 dark:bg-white/5 border-none gap-2 text-sm">
                            <Download size={18} /> Exportar Backup JSON
                        </Button>
                        <div className="relative">
                            <input type="file" onChange={handleImportBackup} className="absolute inset-0 opacity-0 cursor-pointer" accept=".json" />
                            <Button variant="ghost" className="w-full justify-start bg-gray-50 dark:bg-white/5 border-none gap-2 text-sm">
                                <Upload size={18} /> Restaurar Backup
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={handleClearLocalStorage} className="w-full justify-start text-red-500 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-500 hover:text-white border-none gap-2 text-xs">
                            <Trash2 size={16} /> Apagar Todos os Dados Locais
                        </Button>
                    </div>
                </Card>

                {/* Session Summary Card with Logout */}
                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Sessão</h3>
                            <p className="text-xs text-gray-400">Dispositivo {window.innerWidth < 768 ? 'Mobile' : 'Desktop'}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-400">Versão: 1.0.12</span>
                            <span className="text-[#00d26a] font-bold">Ativo</span>
                        </div>
                        <Button
                            onClick={() => { if (window.confirm("Deseja realmente sair?")) onLogout(); }}
                            className="w-full bg-red-500 hover:bg-red-600 text-white gap-2 py-6 rounded-2xl shadow-lg shadow-red-500/20"
                        >
                            <LogOut size={20} /> Sair do Sistema
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
