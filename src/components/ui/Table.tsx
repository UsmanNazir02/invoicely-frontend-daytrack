import type { ReactNode } from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
}

export function Table<T extends { id: string }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data available',
    emptyIcon,
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                <p className="text-gray-500 text-sm">Loading data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                {emptyIcon || (
                    <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
                <p className="text-sm font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.map((item, index) => (
                        <tr
                            key={item.id}
                            className="hover:bg-gray-50/50 transition-colors"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${column.className || ''}`}
                                >
                                    {column.render
                                        ? column.render(item)
                                        : (item as Record<string, unknown>)[column.key] as ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
