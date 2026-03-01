import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Key, Mail, ArrowRight } from 'lucide-react';

const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 overflow-y-auto pt-10 pb-10">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="bg-[#00d26a] p-8 flex flex-col items-center text-white relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-xl" />

                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 z-10 transition-transform hover:rotate-3">
                        <img src="/logo-v5.png" alt="Logo Pente Fino" className="w-16 h-16 object-contain p-1" />
                    </div>

                    <div className="bg-white/20 p-2 rounded-full mb-4 animate-bounce">
                        <CheckCircle2 size={32} />
                    </div>

                    <h1 className="text-3xl font-black uppercase tracking-tighter text-center leading-tight mb-2">
                        Pagamento Aprovado!
                    </h1>
                    <p className="text-white/90 text-sm font-medium text-center bg-black/10 px-4 py-1 rounded-full">
                        Seu acesso ao Pente Fino está pronto.
                    </p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                Use as credenciais abaixo para entrar no sistema e começar a gerenciar sua barbearia.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-[#00d26a]/30 group">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00d26a] group-hover:scale-110 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">E-mail de Login</p>
                                    <p className="text-gray-900 font-bold">O e-mail usado na compra</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-[#00d26a]/30 group">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00d26a] group-hover:scale-110 transition-transform">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Senha Padrão</p>
                                    <p className="text-2xl font-black text-gray-900 tracking-widest">1234</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                            <p className="text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                Seguranca: Recomendamos alterar sua senha após o primeiro acesso nas configurações do perfil.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.href = 'https://pentefino.vercel.app'}
                            className="w-full bg-[#00d26a] hover:bg-[#00b55c] text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-[#00d26a]/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
                        >
                            Acessar Sistema Agora
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                Pente Fino Barber Shop • Administration System
            </p>
        </div>
    );
};

export default Welcome;
