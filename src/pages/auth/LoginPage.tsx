import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Lock, Mail, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await login(data.email, data.password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #eff6ff 100%)',
            }}
        >
            {/* Card wrapper */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}
            >
                {/* Top gradient accent */}
                <div style={{
                    height: '3px',
                    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                }} />

                <div style={{ padding: '36px 32px 32px' }}>

                    {/* ── Logo + title ── */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
                            border: '1px solid #c7d2fe',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
                            marginBottom: '14px',
                        }}>
                            <Zap style={{ width: '22px', height: '22px', color: '#2563eb' }} strokeWidth={2.5} />
                        </div>
                        <h1 style={{
                            margin: '0 0 6px',
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#0f172a',
                            letterSpacing: '-0.4px',
                        }}>
                            Invoicely
                        </h1>
                        <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8', fontWeight: '400' }}>
                            Sign in to your admin account
                        </p>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Email field */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px',
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '15px',
                                    height: '15px',
                                    color: '#9ca3af',
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                }} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    {...register('email')}
                                    style={{
                                        width: '100%',
                                        height: '42px',
                                        paddingLeft: '36px',
                                        paddingRight: '12px',
                                        fontSize: '14px',
                                        color: '#1e293b',
                                        background: '#f8fafc',
                                        border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                                        borderRadius: '9px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = '#f8fafc';
                                    }}
                                />
                            </div>
                            {errors.email && (
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password field */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '6px',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{
                                    position: 'absolute',
                                    left: '11px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '15px',
                                    height: '15px',
                                    color: '#9ca3af',
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                }} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    style={{
                                        width: '100%',
                                        height: '42px',
                                        paddingLeft: '36px',
                                        paddingRight: '12px',
                                        fontSize: '14px',
                                        color: '#1e293b',
                                        background: '#f8fafc',
                                        border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                                        borderRadius: '9px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
                                        e.target.style.background = '#fff';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.background = '#f8fafc';
                                    }}
                                />
                            </div>
                            {errors.password && (
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Helper + Forgot password */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                        }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Use your admin credentials</span>
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#1d4ed8';
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#2563eb';
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Sign In button — native button, no component clipping */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: isLoading
                                    ? '#bfdbfe'
                                    : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '14px',
                                letterSpacing: '0.02em',
                                border: 'none',
                                borderRadius: '9px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: isLoading ? 'none' : '0 2px 12px rgba(37,99,235,0.30)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.40)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,0.30)';
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        width="15" height="15" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{ animation: 'lp-spin 0.75s linear infinite' }}
                                    >
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* ── Footer ── */}
                    <div style={{
                        marginTop: '24px',
                        paddingTop: '18px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                    }}>
                        <ShieldCheck style={{ width: '12px', height: '12px', color: '#cbd5e1', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                            Secure admin access · IP restricted · All actions logged
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes lp-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}