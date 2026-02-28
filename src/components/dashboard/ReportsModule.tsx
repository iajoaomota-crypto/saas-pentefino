import React from 'react';
import { Card, Button } from '../ui';
import { FileText, Download, PieChart, BarChart } from 'lucide-react';
import { formatCurrency } from '../../utils/financialUtils';

interface ReportsModuleProps {
    stats: any;
    transactions: any[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ stats, transactions }) => {
    const handleExportPDF = () => {
        alert("Função de exportação PDF está sendo preparada para o ambiente de produção. Por enquanto, use o Backup em Configurações.");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-bold dark:text-white text-gray-800">Relatórios Gerenciais</h2>
                    <p className="text-xs text-gray-400">Resumo detalhado da performance do seu negócio</p>
                </div>
                <Button onClick={handleExportPDF} className="bg-[#00d26a] hover:bg-[#00b85c] text-white gap-2">
                    <Download size={18} /> Exportar como PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart className="text-[#00d26a]" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase">Resumo Financeiro</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                            <span className="text-sm text-gray-500">Receita Total</span>
                            <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(stats.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                            <span className="text-sm text-gray-500">Despesas Totais</span>
                            <span className="font-bold text-red-500">{formatCurrency(stats.totalExpense)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5">
                            <span className="text-sm text-gray-500">Comissões Pagas</span>
                            <span className="font-bold text-blue-500">{formatCurrency(stats.totalCommissions)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 pt-4">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Lucro Real</span>
                            <span className="text-lg font-bold text-[#00d26a]">{formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart className="text-[#00d26a]" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase">Atividade Recente</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <p className="text-xs text-gray-400 mb-1">Total de Operações</p>
                            <p className="text-lg font-bold">{stats.transactionCount} Lançamentos</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <p className="text-xs text-gray-400 mb-1">Média por Lançamento</p>
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                                {formatCurrency(stats.totalIncome / (stats.transactionCount || 1))}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-[#00d26a]" size={20} />
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase">Maiores Receitas por Profissional</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic">Análise detalhada por barbeiro disponível na versão Premium.</p>
                </div>
            </Card>
        </div>
    );
};
