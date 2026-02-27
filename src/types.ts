export interface Transaction {
    id: number | string;
    desc: string;
    category: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    expenseType?: 'professional' | 'personal';
    revenueType?: 'services' | 'products' | 'courses' | 'other';
    barber?: string;
}

export interface Closing {
    id: string;
    date: string;
    user_id: string;
    total_amount: number;
    status: 'open' | 'closed';
    notes: string;
    created_at: string;
    updated_at: string;
}
