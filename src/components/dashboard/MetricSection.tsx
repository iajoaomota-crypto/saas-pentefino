import React from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Scissors, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui';
import { cn } from '../../utils';
import { formatCurrency } from '../../utils/financialUtils';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    icon: any;
    color?: 'green' | 'red' | 'blue' | 'amber';
}

const MetricCard = ({ title, value, trend, icon: Icon, color = 'green' }: MetricCardProps) => {
    const colorClasses = {
        green: { text: 'text-[#00d26a]', bg: 'bg-[#00d26a]/10', icon: 'text-[#00d26a]' },
        red: { text: 'text-red-500', bg: 'bg-red-500/10', icon: 'text-red-500' },
        blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', icon: 'text-blue-500' },
        amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', icon: 'text-amber-500' }
    };

    const formattedValue = typeof value === 'number' ? formatCurrency(value) : value;

    return (
        <Card className="flex flex-col justify-between h-full transition-all duration-300 bg-white dark:bg-[#1E1E1E] border-none shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                <div className={cn("p-2 rounded-xl", colorClasses[color].bg)}>
                    <Icon size={18} className={colorClasses[color].icon} />
                </div>
            </div>
            <div>
                <h3 className={cn("text-xl font-bold mb-1", colorClasses[color].text)}>{formattedValue}</h3>
                {trend && (
                    <div className="flex items-center gap-1">
                        {trend.startsWith('+') ? <TrendingUp size={12} className="text-[#00d26a]" /> : <TrendingDown size={12} className="text-red-500" />}
                        <span className={cn("text-[10px] font-bold", trend.startsWith('+') ? "text-[#00d26a]" : "text-red-500")}>
                            {trend}
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
        totalCommissions: number;
        netProfit: number;
        comparison?: {
            incomeTrend?: string;
            expenseTrend?: string;
            profitTrend?: string;
        };
    };
    darkMode: boolean;
}

export const MetricSection: React.FC<MetricSectionProps> = ({ stats, darkMode }) => {
    const isNegative = stats.balance < 0;

    return (
        <div className="space-y-6">
            <Card className={cn(
                "p-8 relative overflow-hidden border-none shadow-2xl transition-all duration-700",
                isNegative
                    ? "bg-gradient-to-br from-red-600 via-red-500 to-black text-white"
                    : darkMode
                        ? "bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A]"
                        : "bg-gradient-to-br from-[#00d26a] via-[#00b85c] to-blue-600"
            )}>
                {/* Visual Flair */}
                {!isNegative && (
                    <>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-3xl pointer-events-none" />
                    </>
                )}
                {isNegative && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-red-900/20 pointer-events-none"
                    />
                )}

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.3em] mb-3",
                                isNegative ? "text-white/80" : "text-white/60"
                            )}>
                                {isNegative ? "Saldo Insuficiente" : "Saldo Disponível"}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight flex items-baseline gap-2 text-white">
                                <span className="text-2xl font-light text-white/50">R$</span>
                                {Math.abs(stats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {isNegative && <AlertCircle size={24} className="text-white ml-2 animate-bounce" />}
                            </h2>
                        </div>
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-xl border shadow-2xl transition-all duration-300",
                            isNegative ? "bg-white/20 border-white/40" : "bg-white/10 border-white/20"
                        )}>
                            <Wallet size={32} className="text-white" />
                        </div>
                    </div>

                    <div className={cn(
                        "grid grid-cols-2 gap-4 md:gap-8 pt-8 border-t",
                        isNegative ? "border-white/20" : "border-white/10"
                    )}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={cn(
                                    "w-6 h-6 rounded-md flex items-center justify-center",
                                    isNegative ? "bg-white/10 text-white" : "bg-[#00d26a]/20 text-[#00d26a]"
                                )}>
                                    <ArrowUpCircle size={14} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    isNegative ? "text-white/80" : "text-white/60"
                                )}>Entradas</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-white">{formatCurrency(stats.totalIncome)}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={cn(
                                    "w-6 h-6 rounded-md flex items-center justify-center",
                                    isNegative ? "bg-white/10 text-white" : "bg-red-400/20 text-red-300"
                                )}>
                                    <ArrowDownCircle size={14} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest",
                                    isNegative ? "text-white/80" : "text-white/60"
                                )}>Saídas</span>
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-white">{formatCurrency(stats.totalExpense)}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Receita Bruta"
                    value={stats.totalIncome}
                    trend={stats.comparison?.incomeTrend}
                    icon={ArrowUpCircle}
                    color="green"
                />
                <MetricCard
                    title="Despesas Totais"
                    value={stats.totalExpense}
                    trend={stats.comparison?.expenseTrend}
                    icon={ArrowDownCircle}
                    color="red"
                />
                <MetricCard
                    title="Comissões"
                    value={stats.totalCommissions}
                    icon={Scissors}
                    color="blue"
                />
                <MetricCard
                    title="Lucro Líquido"
                    value={stats.netProfit}
                    trend={stats.comparison?.profitTrend}
                    icon={TrendingUp}
                    color="amber"
                />
            </div>
        </div>
    );
};
