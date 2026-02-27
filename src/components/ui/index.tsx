import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils';
import { X } from 'lucide-react';

export const Card = ({ children, className = '', noPadding = false, ...props }: { children: React.ReactNode, className?: string, noPadding?: boolean, [key: string]: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        {...props}
        className={cn(
            "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-colors duration-300",
            "dark:bg-[#1E1E1E] dark:border-white/5 dark:text-white",
            noPadding ? "" : "p-4 md:p-5", // FIX: Smaller padding on mobile
            className
        )}
    >
        {children}
    </motion.div>
);

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    darkMode,
    onSubmit
}: {
    isOpen: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode,
    footer?: React.ReactNode,
    darkMode: boolean,
    onSubmit?: (e: React.FormEvent) => void
}) => {
    if (!isOpen) return null;

    const content = (
        <>
            {/* Header */}
            <div className={cn(
                "px-4 py-3 md:px-6 md:py-4 border-b flex justify-between items-center shrink-0",
                darkMode ? "bg-[#0f172a] border-white/5" : "bg-gray-50 border-gray-100"
            )}>
                <h2 className={cn("text-base md:text-xl font-bold", darkMode ? "text-white" : "text-gray-800")}>
                    {title}
                </h2>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 md:p-1 cursor-pointer">
                    <X size={24} className="md:w-6 md:h-6" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className="space-y-3 md:space-y-4">
                    {children}
                </div>
            </div>

            {/* Footer */}
            {footer && (
                <div className={cn(
                    "p-4 md:p-6 border-t shrink-0 bg-inherit",
                    darkMode ? "border-white/5" : "border-gray-100"
                )}>
                    {footer}
                </div>
            )}
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                    "w-full max-w-lg flex flex-col transition-colors duration-300 shadow-2xl overflow-hidden rounded-t-3xl md:rounded-3xl", /* FIX: Rounded top on mobile */
                    "h-[85vh] md:h-auto md:max-h-[90vh]", /* FIX: Consistent height on mobile to prevent overflow */
                    darkMode ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-800"
                )}
            >
                {onSubmit ? (
                    <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden pb-4 md:pb-safe">
                        {content}
                    </form>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden pb-4 md:pb-safe">
                        {content}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }: {
    children: React.ReactNode,
    onClick?: () => void,
    variant?: 'primary' | 'outline' | 'ghost' | 'danger',
    className?: string,
    type?: 'button' | 'submit'
}) => {
    const baseStyle = "px-4 py-3 md:py-2 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"; /* FIX: Larger touch target on mobile */

    const variants = {
        primary: "bg-[#00d26a] hover:bg-[#00b55b] text-white shadow-lg shadow-[#00d26a]/20",
        outline: "border-2 border-gray-200 hover:border-[#00d26a] text-gray-700 hover:text-[#00d26a] bg-transparent",
        ghost: "hover:bg-gray-100 text-gray-600 dark:hover:bg-white/5 dark:text-gray-300",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
    };

    return (
        <button type={type} onClick={onClick} className={cn(baseStyle, variants[variant], className)}>
            {children}
        </button>
    );
};
