import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${hover ? 'hover:shadow-lg hover:border-gray-200 transition-all duration-200' : ''} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50/50 ${className}`}>
            {children}
        </div>
    );
}
