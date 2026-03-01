import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Key, Mail, ArrowRight } from 'lucide-react';

const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-auto">
                <div className="bg-[#00d26a] p-4 sm:p-8 flex flex-col items-center text-white relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3 sm:mb-6 z-10">
                        <img src="/logo-v5.png" alt="Logo Pente Fino" className="w-10 h-10 sm:w-16 sm:h-16 object-contain p-1" />
                    </div>

                    <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-center leading-tight mb-1 sm:mb-2">
                        Pagamento Aprovado!
                    </h1>
                    <p className="text-white/90 text-[10px] sm:text-sm font-medium text-center bg-black/10 px-3 py-0.5 rounded-full">
                        Seu acesso ao Pente Fino está pronto.
                    </p>
                </div>

                <div className="p-4 sm:p-8">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-[#00d26a]/30 group">
                                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00d26a]">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Login</p>
                                    <p className="text-gray-900 font-bold text-xs sm:text-base">Seu e-mail de compra</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-[#00d26a]/30 group">
                                <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00d26a]">
                                    <Key size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Senha</p>
                                    <p className="text-xl font-black text-gray-900 tracking-widest">1234</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <p className="text-amber-800 text-[9px] sm:text-[11px] font-semibold leading-tight">
                                ✨ Dica: Altere sua senha após o primeiro acesso no seu perfil.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.href = 'https://pentefino.vercel.app'}
                            className="w-full bg-[#00d26a] hover:bg-[#00b55c] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-base tracking-widest transition-all shadow-lg shadow-[#00d26a]/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            Acessar Agora
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <p className="mt-4 text-gray-400 text-[8px] font-bold uppercase tracking-[0.2em]">
                Pente Fino Barber Shop
            </p>
        </div>
    );
};

export default Welcome;
