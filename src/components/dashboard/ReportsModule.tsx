import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Button } from '../ui';
import { FileText, Download, PieChart, BarChart } from 'lucide-react';
import { formatCurrency } from '../../utils/financialUtils';

interface ReportsModuleProps {
    stats: any;
    transactions: any[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ stats, transactions }) => {
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date().toLocaleString('pt-BR');

            // Header
            doc.setFontSize(22);
            doc.setTextColor(0, 210, 106); // #00d26a
            doc.text('Pente Fino Barber Shop', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Relatório Gerencial - Gerado em: ${now}`, 14, 28);

            // Summary Section
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Resumo Financeiro', 14, 45);

            autoTable(doc, {
                startY: 50,
                head: [['Descrição', 'Valor']],
                body: [
                    ['Receita Bruta', formatCurrency(stats.totalIncome)],
                    ['Despesas Totais', formatCurrency(stats.totalExpense)],
                    ['Comissões Profissionais', formatCurrency(stats.totalCommissions)],
                    ['Saldo em Caixa', formatCurrency(stats.balance)],
                    ['LUCRO LÍQUIDO', formatCurrency(stats.netProfit)],
                ],
                theme: 'grid',
                headStyles: { fillColor: [0, 210, 106] },
                columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
            });

            // Recent Transactions Section
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(16);
            doc.text('Últimos Lançamentos', 14, finalY);

            const tableData = transactions.slice(0, 50).map(t => [
                t.date,
                t.desc,
                t.type === 'income' ? 'Entrada' : 'Saída',
                t.category || '-',
                formatCurrency(t.amount)
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [50, 50, 50] },
                columnStyles: { 4: { halign: 'right' } }
            });

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Pente Fino - Software de Gestão | Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
            }

            doc.save(`Relatorio_PenteFino_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Error:', error);
            alert("Erro ao gerar PDF. Verifique os dados e tente novamente.");
        }
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
