import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, User, Lock, UserPlus, Download } from 'lucide-react';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        // Detect Device
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIPhone = /iphone|ipad|ipod/.test(userAgent);
        const mobileMatch = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        // PWA check (only show if not already installed/standalone)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

        setIsMobile(mobileMatch && !isStandalone);
        if (isIPhone && !isStandalone) {
            setIsIOS(true);
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const url = isRegister ? '/api/auth/register' : '/api/auth/login';
            const bodyData = isRegister ? { name, email, username, password } : { username, password };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erro de autenticação');
                return;
            }

            if (isRegister) {
                setSuccessMsg('Conta criada com sucesso! Você pode fazer login agora.');
                setIsRegister(false);
                setPassword('');
            } else {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError('Erro de conexão com o servidor');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="mx-auto h-24 w-24 bg-white dark:bg-white/10 rounded-3xl flex items-center justify-center shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden transition-all hover:scale-105">
                        <img src="/logo.png" alt="Logo Pente Fino" className="w-full h-full object-contain p-3" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isRegister ? 'Criar Nova Conta' : 'Acesso ao Sistema'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isRegister ? 'Preencha os dados para se registrar' : 'Entre com suas credenciais para continuar'}
                    </p>
                </motion.div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100"
                >
                    {(deferredPrompt || isMobile || isIOS) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-gradient-to-r from-[#00d26a] to-blue-600 rounded-2xl text-white shadow-lg shadow-[#00d26a]/20"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Download className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-90">App Disponível</p>
                                        <p className="text-sm font-medium">Instalar PenteFino no {isIOS ? 'iPhone' : 'Celular'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstallClick}
                                    className="bg-white text-[#00d26a] px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform whitespace-nowrap"
                                >
                                    {isIOS ? 'VER COMO' : 'BAIXAR'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {showIOSInstructions && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl relative"
                            >
                                <button
                                    onClick={() => setShowIOSInstructions(false)}
                                    className="absolute top-4 right-4 text-gray-400 p-1"
                                >
                                    ✕
                                </button>
                                <div className="text-center">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                        <Download className="w-6 h-6 text-[#00d26a]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Instalar no iPhone</h3>
                                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">Siga estes passos para ter o app na sua tela de início:</p>

                                    <div className="space-y-4 text-left mb-8">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-[#00d26a]/10 text-[#00d26a] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                            <p className="text-xs text-gray-700">Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-[#00d26a]/10 text-[#00d26a] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                            <p className="text-xs text-gray-700">Role a lista e toque em <strong>'Adicionar à Tela de Início'</strong>.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-[#00d26a]/10 text-[#00d26a] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                            <p className="text-xs text-gray-700">Confirme tocando em <strong>'Adicionar'</strong> no topo da tela.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowIOSInstructions(false)}
                                        className="w-full bg-[#00d26a] text-white py-3 rounded-xl font-bold text-sm shadow-md"
                                    >
                                        ENTENDI
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-green-50 border-l-4 border-[#00d26a] p-4 rounded-md">
                                <p className="text-sm text-green-700">{successMsg}</p>
                            </div>
                        )}

                        {isRegister && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nome Completo
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            required={isRegister}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="focus:ring-[#00d26a] focus:border-[#00d26a] block w-full sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="email"
                                            required={isRegister}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="focus:ring-[#00d26a] focus:border-[#00d26a] block w-full sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Usuário
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="focus:ring-[#00d26a] focus:border-[#00d26a] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900 transition-colors"
                                    placeholder="Seu usuário de acesso"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-[#00d26a] focus:border-[#00d26a] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900 transition-colors"
                                    placeholder="Sua senha"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#00d26a] hover:bg-[#00b55b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d26a] transition-all"
                            >
                                {isRegister ? 'Registrar Nova Conta' : 'Entrar no Dashboard'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setError('');
                                    setSuccessMsg('');
                                    setUsername('');
                                    setPassword('');
                                    setName('');
                                    setEmail('');
                                }}
                                className="text-sm font-medium text-[#00d26a] hover:text-[#00b55b] transition-colors"
                            >
                                {isRegister ? 'Já tenho uma conta' : 'Criar nova conta'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-sm font-medium text-gray-500 hover:text-[#00d26a] transition-colors"
                                title="Você pode usar o app sem login (offline), os dados ficarão apenas neste navegador."
                            >
                                Acessar Offline
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
