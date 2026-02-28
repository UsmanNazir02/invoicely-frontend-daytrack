import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalRecords,
}: PaginationProps) {
    if (totalRecords === 0) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                {totalRecords} record{totalRecords !== 1 ? 's' : ''}
            </span>
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                            color: currentPage <= 1 ? '#cbd5e1' : '#475569',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            if (currentPage > 1) {
                                e.currentTarget.style.borderColor = '#94a3b8';
                                e.currentTarget.style.background = '#f8fafc';
                            }
                        }}
                        onMouseLeave={e => {
                            if (currentPage > 1) {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.background = '#fff';
                            }
                        }}
                    >
                        <ChevronLeft style={{ width: '16px', height: '16px' }} />
                    </button>

                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569', padding: '0 8px' }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                            color: currentPage >= totalPages ? '#cbd5e1' : '#475569',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            if (currentPage < totalPages) {
                                e.currentTarget.style.borderColor = '#94a3b8';
                                e.currentTarget.style.background = '#f8fafc';
                            }
                        }}
                        onMouseLeave={e => {
                            if (currentPage < totalPages) {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.background = '#fff';
                            }
                        }}
                    >
                        <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                </div>
            )}
        </div>
    );
}
