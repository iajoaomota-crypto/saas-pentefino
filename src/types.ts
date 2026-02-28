export interface Transaction {
    id: number | string;
    desc: string;
    category: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    expenseType?: 'Empresa' | 'Pessoal';
    revenueType?: 'services' | 'products' | 'courses' | 'other';
    barber?: string;
    synced?: boolean;
}

export interface Closing {
    id: string | number;
    date: string;
    user_id: string | number;
    total_amount: number;
    status: 'open' | 'closed';
    notes: string;
    synced?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Account {
    id: number | string;
    name: string;
    category: string;
    amount: number;
    dueDate: number | string;
    status: 'pending' | 'paid';
    type: 'fixa' | 'variavel';
    variableType?: 'unica' | 'recorrente';
    referenceMonth: string;
    paidAt?: string;
    synced?: boolean;
}
