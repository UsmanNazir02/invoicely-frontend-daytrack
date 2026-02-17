import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fadeIn"
                    onClick={onClose}
                />

                {/* Modal */}
                <div
                    className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl transform transition-all animate-scaleIn`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">{children}</div>
                </div>
            </div>
        </div>
    );
}
