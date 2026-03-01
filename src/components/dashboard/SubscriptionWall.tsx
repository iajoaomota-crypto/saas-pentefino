import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, CreditCard, ExternalLink, LogOut } from 'lucide-react';
import { Button, Card } from '../ui';

interface SubscriptionWallProps {
    status: 'CANCELED' | 'REFUNDED' | 'EXPIRED' | string;
    onLogout: () => void;
}

export const SubscriptionWall: React.FC<SubscriptionWallProps> = ({ status, onLogout }) => {
    const isRefunded = status === 'REFUNDED';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-md p-6"
        >
            <Card className="max-w-md w-full p-8 border-none shadow-2xl bg-white dark:bg-[#1E1E1E]">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                        Acesso Interrompido
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {isRefunded
                            ? "Seu acesso foi bloqueado devido a um reembolso. Para continuar usando o Pente Fino, você precisará realizar uma nova assinatura."
                            : "Sua assinatura não está ativa no momento. Regularize seu pagamento para recuperar o acesso aos seus dados financeiros."}
                    </p>

                    <div className="w-full space-y-3">
                        <Button
                            onClick={() => window.open('https://checkout.kirvano.com/pente-fino', '_blank')}
                            className="w-full bg-[#00d26a] hover:bg-[#00b85c] text-white font-bold h-12 gap-2 text-lg shadow-lg shadow-[#00d26a]/20"
                        >
                            <CreditCard size={20} /> Reativar Agora
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onLogout}
                            className="w-full text-gray-400 hover:text-red-500 font-bold gap-2"
                        >
                            <LogOut size={18} /> Sair da Conta
                        </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 w-full">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            Dúvidas? <a href="#" className="underline hover:text-[#00d26a]">Suporte Pente Fino</a> <ExternalLink size={10} />
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
