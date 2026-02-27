/**
 * Global configurations and constants for PenteFino
 */

export const BRAND_COLORS = {
    primary: '#00d26a',
    secondary: '#1e293b',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#00d26a',
};

export const REVENUE_CATEGORIES = [
    { id: 'services', label: 'Serviços' },
    { id: 'products', label: 'Produtos' },
    { id: 'courses', label: 'Cursos' },
    { id: 'other', label: 'Outros' },
];

export const EXPENSE_CATEGORIES = [
    { id: 'professional', label: 'Profissional' },
    { id: 'personal', label: 'Pessoal' },
];

export const PAYMENT_METHODS = [
    { id: 'pix', label: 'PIX', color: '#00d26a' },
    { id: 'credit_card', label: 'Cartão de Crédito', color: '#3b82f6' },
    { id: 'debit_card', label: 'Cartão de Débito', color: '#6366f1' },
    { id: 'cash', label: 'Dinheiro', color: '#10b981' },
];

export const ACCOUNT_CATEGORIES = [
    'Aluguel',
    'Internet / Telefone',
    'Energia',
    'Água',
    'Manutenção',
    'Produtos / Insumos',
    'Marketing',
    'Impostos',
    'Outras Despesas',
];
