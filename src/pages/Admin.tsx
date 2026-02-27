import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, Activity, UserX, ShieldCheck, Key, Trash2 } from 'lucide-react';
import { Modal, Button } from '../components/ui';

interface UserData {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    active: number;
    expiration_date: string | null;
    created_at: string;
}

export default function Admin() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('auth_token');
                navigate('/login');
                return;
            }

            if (!res.ok) {
                setError('Erro ao buscar usuários');
                return;
            }

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError('Erro de conexão com o servidor');
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/toggle-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setUsers(users.map(u =>
                    u.id === id ? { ...u, active: u.active === 1 ? 0 : 1 } : u
                ));
            }
        } catch (err) {
            console.error('Erro ao atualizar status', err);
        }
    };

    const handleUpdateExpiration = async (id: number, dateStr: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/update-expiration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, expiration_date: dateStr || null })
            });

            if (res.ok) {
                setUsers(users.map(u =>
                    u.id === id ? { ...u, expiration_date: dateStr || null } : u
                ));
                alert("Data de expiração atualizada com sucesso.");
            } else {
                alert("Erro ao atualizar data de expiração.");
            }
        } catch (err) {
            console.error('Erro ao atualizar expiração', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleChangePassword = async (id: number) => {
        const newPassword = prompt("Digite a nova senha para este usuário:");
        if (!newPassword || newPassword.trim().length === 0) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, newPassword })
            });

            if (res.ok) {
                alert("Senha alterada com sucesso!");
            } else {
                const data = await res.json();
                alert("Erro ao alterar senha: " + (data.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error('Erro ao alterar senha', err);
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleDeleteUser = async (id: number, username: string) => {
        if (username === 'master') {
            alert("O usuário 'master' não pode ser excluído.");
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir permanentemente o acesso de @${username}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                alert("Usuário excluído com sucesso.");
            } else {
                const data = await res.json();
                alert("Erro ao excluir usuário: " + (data.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error('Erro ao excluir usuário', err);
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleToggleRole = async (id: number, currentRole: string, username: string) => {
        if (username === 'master') {
            alert("O papel do usuário 'master' não pode ser alterado.");
            return;
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Deseja alterar o papel de @${username} para '${newRole}'?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/update-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, role: newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
                alert("Papel atualizado com sucesso.");
            } else {
                const data = await res.json();
                alert("Erro ao atualizar papel: " + (data.error || "Erro desconhecido"));
            }
        } catch (err) {
            console.error('Erro ao atualizar papel', err);
            alert("Erro de conexão com o servidor.");
        }
    };
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;
            processCSV(text);
        };
        reader.readAsText(file);
    };

    const processCSV = async (csvText: string) => {
        const lines = csvText.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) {
            alert("O arquivo CSV deve conter um cabeçalho e pelo menos um usuário.");
            return;
        }

        const usersToCreate = [];
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(s => s.trim());
            if (parts.length >= 4) {
                const [name, email, username, password, expirationDate] = parts;
                if (name && username && password && email) {
                    usersToCreate.push({ name, email, username, password, expirationDate: expirationDate || null });
                }
            }
        }

        if (usersToCreate.length === 0) {
            alert("Nenhum usuário válido encontrado no CSV (mínimo de 4 colunas preenchidas: nome, email, usuário, senha).");
            return;
        }

        setIsUploading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/admin/bulk-create-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ users: usersToCreate })
            });

            const data = await res.json();
            if (res.ok) {
                const msg = `Processamento concluído!\nSucesso: ${data.results.success}\nFalha: ${data.results.failed}${data.results.errors.length > 0 ? '\n\nErros:\n' + data.results.errors.slice(0, 5).join('\n') : ''}`;
                alert(msg);
                fetchUsers();
            } else {
                alert("Erro ao processar planilha: " + (data.error || "Erro desconhecido"));
            }
        } catch (err) {
            alert("Erro de conexão ao enviar planilha.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Settings className="h-6 w-6 text-blue-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Painel de Administração</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                title="Ir para o Dashboard Principal"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Users className="h-6 w-6 text-blue-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-900">Gestão de Usuários</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".csv"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="inline-flex items-center px-4 py-2 border border-blue-200 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                                    title="Formato: nome,email,usuario,senha,vencimento"
                                >
                                    {isUploading ? 'Processando...' : 'Importar Usuários (CSV)'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 rounded-t-lg">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiração</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Senha</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center mb-1">
                                                        {user.role === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-500 mr-1" />}
                                                        {user.name && user.name.length > 0 ? user.name : user.username}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleRole(user.id, user.role, user.username)}
                                                        disabled={user.username === 'master'}
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${user.role === 'admin'
                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                            } ${user.username === 'master' ? 'cursor-default' : 'cursor-pointer'}`}
                                                        title={user.username === 'master' ? '' : 'Clique para alterar papel'}
                                                    >
                                                        {user.role}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.active === 1 ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Inativo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.role !== 'admin' ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="date"
                                                                value={user.expiration_date ? user.expiration_date.split('T')[0] : ''}
                                                                onChange={(e) => handleUpdateExpiration(user.id, e.target.value)}
                                                                className="border border-gray-200 rounded p-1 text-xs"
                                                            />
                                                            {!user.expiration_date && <span className="text-xs text-gray-400">Vitalício</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Válido Sempre</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleChangePassword(user.id)}
                                                        className="text-gray-400 hover:text-amber-500 transition-colors p-2 rounded-lg hover:bg-amber-50"
                                                        title="Alterar Senha"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleToggleStatus(user.id)}
                                                                className={`text-xs px-2 py-1 rounded border transition-colors ${user.active === 1 ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                                            >
                                                                {user.active === 1 ? 'Bloquear' : 'Liberar'}
                                                            </button>
                                                        )}
                                                        {user.username !== 'master' && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                                title="Excluir Acesso"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
