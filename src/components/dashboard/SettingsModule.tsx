import React from 'react';
import { Card, Button } from '../ui';
import { Shield, Database, Moon, Sun, Trash2, Smartphone, Download, Upload, Percent } from 'lucide-react';

interface SettingsModuleProps {
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    commissionRate: number;
    setCommissionRate: (val: number) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
    darkMode, setDarkMode, commissionRate, setCommissionRate
}) => {
    const handleClearLocalStorage = () => {
        if (window.confirm("Isso apagará todos os seus lançamentos e contas locais. Tem certeza?")) {
            localStorage.removeItem('pentefino_data');
            localStorage.removeItem('pentefino_accounts');
            localStorage.removeItem('pentefino_closings');
            window.location.reload();
        }
    };

    const handleExportBackup = () => {
        const data = {
            transactions: localStorage.getItem('pentefino_data'),
            accounts: localStorage.getItem('pentefino_accounts'),
            closings: localStorage.getItem('pentefino_closings'),
            settings: { commissionRate, darkMode }
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
                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Moon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Aparência</h3>
                            <p className="text-xs text-gray-400">Personalize o visual do sistema</p>
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
                            <p className="text-xs text-gray-400">Regras de cálculo e comissões</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Comissão Padrão do Barbeiro (%)</label>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00d26a]/20"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#00d26a]/10 rounded-2xl text-[#00d26a]">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Backup e Dados</h3>
                            <p className="text-xs text-gray-400">Proteja seus dados locais</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button onClick={handleExportBackup} className="w-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border-none shadow-none gap-2">
                            <Download size={18} /> Exportar Backup
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleImportBackup}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".json"
                            />
                            <Button className="w-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border-none shadow-none gap-2">
                                <Upload size={18} /> Importar Backup
                            </Button>
                        </div>
                        <Button onClick={handleClearLocalStorage} className="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-none shadow-none gap-2 mt-4 text-xs">
                            <Trash2 size={16} /> Limpar Tudo
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Sistema</h3>
                            <p className="text-xs text-gray-400">Informações da plataforma</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className="font-bold text-[#00d26a]">Ativo (Premium)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Versão</span>
                            <span className="text-gray-400">1.0.8-stable</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 text-center">
                            Pente Fino SaaS v1.0 <br /> Desenvolvido para Gestão de Barbearias
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
