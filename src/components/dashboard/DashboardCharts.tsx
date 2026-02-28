import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../ui';
import { cn } from '../../utils';
import { BRAND_COLORS, REVENUE_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../constants/config';
import { sumAmounts } from '../../utils/financialUtils';

interface DashboardChartsProps {
    transactions: any[];
    darkMode: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions = [], darkMode }) => {
    // Process chart data (Flow)
    const chartData = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('pt-BR');
        });

        return last7Days.map(date => {
            const dayTransactions = (transactions || []).filter(t => t.date === date);
            const receita = sumAmounts(dayTransactions
                .filter(t => t.type === 'income')
                .map(t => t.amount));
            const despesa = sumAmounts(dayTransactions
                .filter(t => t.type === 'expense')
                .map(t => t.amount));

            return {
                name: date.split('/')[0] + '/' + date.split('/')[1],
                receita,
                despesa
            };
        });
    }, [transactions]);

    // Process category distribution
    const categoryData = React.useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const categories = [...new Set(transactions.map(t => t.category))];
        return categories.map(cat => {
            const value = sumAmounts(transactions
                .filter(t => t.category === cat)
                .map(t => t.amount));

            // Find color from payment methods or defaults
            const method = PAYMENT_METHODS.find(m => m.label === cat);

            return {
                name: cat,
                value,
                color: method?.color || BRAND_COLORS.primary
            };
        }).filter(c => c.value > 0);
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Fluxo de Caixa</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={BRAND_COLORS.primary} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={BRAND_COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#333" : "#f0f0f0"} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
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
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border-none shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Distribuição por Categoria</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || BRAND_COLORS.primary} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: darkMode ? '#1E1E1E' : '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};
