import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Option[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            w-full px-4 py-2.5 border rounded-xl bg-gray-50 appearance-none cursor-pointer
                            focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                            transition-all duration-200
                            ${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}
                            ${className}
                        `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
