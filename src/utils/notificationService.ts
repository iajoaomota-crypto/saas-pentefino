/**
 * Service for handling PWA Notification logic
 */
export const NotificationService = {
    /**
     * Request permission for notifications
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return false;
        }

        if (Notification.permission === 'granted') return true;

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    /**
     * Shows a local notification
     */
    sendLocalNotification(title: string, body: string) {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body,
                icon: '/logo-v5.png',
                badge: '/favicon-v5.png',
                vibrate: [200, 100, 200],
                tag: 'bill-reminder-' + Date.now(),
                data: {
                    url: window.location.origin
                }
            } as any);
        });
    },

    /**
     * Check accounts and notify if any are due today
     */
    async checkAndNotifyDueAccounts(accounts: any[]) {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) return;

        const today = new Date().getDate();
        const dueToday = accounts.filter(acc =>
            acc.status === 'pending' &&
            parseInt(acc.dueDate) === today
        );

        if (dueToday.length > 0) {
            // Avoid spamming; only notify once per session if not already notified
            const lastNotified = sessionStorage.getItem('last_notified_date');
            const todayStr = new Date().toDateString();

            if (lastNotified !== todayStr) {
                const count = dueToday.length;
                const title = count === 1 ? 'Conta vencendo hoje! 📌' : `${count} contas vencendo hoje! 📌`;
                const body = count === 1
                    ? `A conta "${dueToday[0].name}" vence hoje. Não esqueça de pagar!`
                    : `Você tem ${count} compromissos financeiros para hoje. Confira no dashboard.`;

                this.sendLocalNotification(title, body);
                sessionStorage.setItem('last_notified_date', todayStr);
            }
        }
    }
};
