import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-2.5 border rounded-xl bg-gray-50
                            focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                            placeholder:text-gray-400
                            transition-all duration-200
                            ${icon ? 'pl-10' : ''}
                            ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
