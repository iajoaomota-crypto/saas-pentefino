import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../ui';
import { cn } from '../../utils';
import { BRAND_COLORS, REVENUE_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/config';
import { sumAmounts, formatCurrency } from '../../utils/financialUtils';

interface DashboardChartsProps {
    transactions: any[];
    darkMode: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions = [], darkMode }) => {
    // Helper to format date consistent with transactions (DD/MM/YYYY)
    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    // Process Area Chart data (Flow)
    const chartData = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(dObj => {
            const dateStr = formatDate(dObj);
            const dayTransactions = (transactions || []).filter(t => t.date === dateStr);
            const receita = sumAmounts(dayTransactions
                .filter(t => t.type === 'income')
                .map(t => t.amount));
            const despesa = sumAmounts(dayTransactions
                .filter(t => t.type === 'expense')
                .map(t => t.amount));

            return {
                name: dateStr.split('/')[0] + '/' + dateStr.split('/')[1],
                receita,
                despesa
            };
        });
    }, [transactions]);

    // 1. Overall Balance (Income vs Expense)
    const overallData = React.useMemo(() => {
        const income = sumAmounts(transactions.filter(t => t.type === 'income').map(t => t.amount));
        const expense = sumAmounts(transactions.filter(t => t.type === 'expense').map(t => t.amount));

        if (income === 0 && expense === 0) return [];

        return [
            { name: 'Receitas', value: income, color: BRAND_COLORS.primary },
            { name: 'Despesas', value: expense, color: BRAND_COLORS.danger }
        ].filter(d => d.value > 0);
    }, [transactions]);

    // 2. Revenue Distribution (Services vs Products vs Others)
    const revenueTypeData = React.useMemo(() => {
        const incomes = transactions.filter(t => t.type === 'income');
        if (incomes.length === 0) return [];

        const data: Record<string, number> = {};
        incomes.forEach(t => {
            const label = REVENUE_CATEGORIES.find(c => c.id === t.revenueType)?.label || 'Outros';
            const val = typeof t.amount === 'string' ? parseFloat(t.amount.replace(',', '.')) : (t.amount || 0);
            data[label] = (data[label] || 0) + (isNaN(val) ? 0 : val);
        });

        const colors = [BRAND_COLORS.primary, '#3b82f6', '#8b5cf6', '#f59e0b'];
        return Object.entries(data).map(([name, value], i) => ({
            name,
            value,
            color: colors[i % colors.length]
        }));
    }, [transactions]);

    // 3. Expense Distribution (Professional vs Personal)
    const expenseTypeData = React.useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return [];

        const data: Record<string, number> = {};
        expenses.forEach(t => {
            const type = t.expenseType || 'Empresa';
            const label = (type.toLowerCase() === 'professional' || type === 'Empresa') ? 'Empresa' : 'Pessoal';
            const val = typeof t.amount === 'string' ? parseFloat(t.amount.replace(',', '.')) : (t.amount || 0);
            data[label] = (data[label] || 0) + (isNaN(val) ? 0 : val);
        });

        return [
            { name: 'Empresa', value: data['Empresa'] || 0, color: BRAND_COLORS.danger },
            { name: 'Pessoal', value: data['Pessoal'] || 0, color: '#3b82f6' }
        ].filter(d => d.value > 0);
    }, [transactions]);

    // 4. Payment Methods Distribution
    const paymentMethodData = React.useMemo(() => {
        const incomes = transactions.filter(t => t.type === 'income');
        if (incomes.length === 0) return [];

        const data: Record<string, number> = {};
        incomes.forEach(t => {
            const label = t.category || 'PIX';
            const val = typeof t.amount === 'string' ? parseFloat(t.amount.replace(',', '.')) : (t.amount || 0);
            data[label] = (data[label] || 0) + (isNaN(val) ? 0 : val);
        });

        return Object.entries(data).map(([name, value]) => {
            const method = PAYMENT_METHODS.find(m => m.label.toLowerCase() === name.toLowerCase());
            return {
                name,
                value,
                color: method?.color || '#94a3b8'
            };
        }).filter(d => d.value > 0);
    }, [transactions]);

    // 5. Professional Performance (Top Barbers)
    const barberPerformanceData = React.useMemo(() => {
        const incomes = transactions.filter(t => t.type === 'income' && t.barber);
        if (incomes.length === 0) return [];

        const data: Record<string, number> = {};
        incomes.forEach(t => {
            const label = t.barber!;
            const val = typeof t.amount === 'string' ? parseFloat(t.amount.replace(',', '.')) : (t.amount || 0);
            data[label] = (data[label] || 0) + (isNaN(val) ? 0 : val);
        });

        return Object.entries(data)
            .map(([name, value]) => ({ name, value, color: BRAND_COLORS.primary }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .filter(d => d.value > 0);
    }, [transactions]);

    const renderPieChart = (title: string, data: any[]) => {
        const total = data.reduce((acc, item) => acc + (item.value || 0), 0);

        return (
            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">{title}</h3>
                <div className="h-[280px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    isAnimationActive={true}
                                    stroke="none"
                                    // Disable expanding segment on click/hover
                                    activeShape={undefined}
                                    activeIndex={-1}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{ outline: 'none' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#1E1E1E' : '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    layout="horizontal"
                                    formatter={(value, entry: any) => {
                                        const payload = entry.payload;
                                        const percent = total > 0 ? ((payload.value / total) * 100).toFixed(0) : 0;
                                        return (
                                            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                                                {value}: <span className="text-gray-900 dark:text-white">{formatCurrency(payload.value)}</span> ({percent}%)
                                            </span>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Sem dados suficientes</div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Fluxo de Caixa (Últimos 7 dias)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={BRAND_COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BRAND_COLORS.danger} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={BRAND_COLORS.danger} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#333" : "#f0f0f0"} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                                dy={0}
                                tickFormatter={(value) => `R$ ${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: darkMode ? '#1E1E1E' : '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="receita"
                                stroke={BRAND_COLORS.primary}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                            />
                            <Area
                                type="monotone"
                                dataKey="despesa"
                                stroke={BRAND_COLORS.danger}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPieChart("Balanço Geral", overallData)}
                {renderPieChart("Receitas (Serviços/Produtos)", revenueTypeData)}
                {renderPieChart("Despesas (Pro/Pessoal)", expenseTypeData)}
                {renderPieChart("Meios de Pagamento", paymentMethodData)}
                {renderPieChart("Top Profissionais", barberPerformanceData)}
            </div>
        </div>
    );
};
