import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../utils';
import { formatCurrency } from '../../utils/financialUtils';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    icon: any;
    color?: 'green' | 'red' | 'blue';
}

const MetricCard = ({ title, value, trend, icon: Icon, color = 'green' }: MetricCardProps) => {
    const colorClasses = {
        green: { text: 'text-[#00d26a]', bg: 'bg-[#00d26a]/10', icon: 'text-[#00d26a]' },
        red: { text: 'text-red-500', bg: 'bg-red-500/10', icon: 'text-red-500' },
        blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', icon: 'text-blue-500' }
    };

    const formattedValue = typeof value === 'number' ? formatCurrency(value) : value;

    return (
        <Card className="flex flex-col justify-between h-full transition-colors duration-300 bg-white dark:bg-[#1E1E1E]">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</span>
                <div className={cn("p-2 rounded-lg", colorClasses[color].bg)}>
                    <Icon size={20} className={colorClasses[color].icon} />
                </div>
            </div>
            <div>
                <h3 className={cn("text-2xl font-bold mb-1", colorClasses[color].text)}>{formattedValue}</h3>
                {trend && (
                    <div className="flex items-center gap-1">
                        {trend.startsWith('+') ? <TrendingUp size={14} className="text-[#00d26a]" /> : <TrendingDown size={14} className="text-red-500" />}
                        <span className={cn("text-xs font-medium", trend.startsWith('+') ? "text-[#00d26a]" : "text-red-500")}>
                            {trend} vs mês anterior
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};

interface MetricSectionProps {
    stats: {
        totalIncome: number;
        totalExpense: number;
        balance: number;
    };
    darkMode: boolean;
}

export const MetricSection: React.FC<MetricSectionProps> = ({ stats, darkMode }) => {
    return (
        <div className="space-y-6">
            <Card className={cn(
                "p-8 relative overflow-hidden border-none shadow-xl transition-all duration-300",
                darkMode ? "bg-[#0A0A0A] text-white" : "bg-gradient-to-br from-[#00d26a] to-blue-500 text-white"
            )}>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mb-2">Saldo Total Disponível</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-2">
                                <span className="text-2xl font-medium text-white/60">R$</span>
                                {Math.abs(stats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {stats.balance < 0 && <span className="text-white text-xl ml-2">(-)</span>}
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
                                <span className="text-xl font-bold text-white">{formatCurrency(stats.totalIncome)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <ArrowDownRight size={24} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block mb-0.5">Saídas</span>
                                <span className="text-xl font-bold text-white">{formatCurrency(stats.totalExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Receita Bruta" value={stats.totalIncome} trend="+12.5%" icon={DollarSign} color="green" />
                <MetricCard title="Despesas Totais" value={stats.totalExpense} trend="-2.4%" icon={TrendingDown} color="red" />
                <MetricCard title="Lucro Líquido" value={stats.balance} trend="+18.2%" icon={TrendingUp} color="blue" />
            </div>
        </div>
    );
};
