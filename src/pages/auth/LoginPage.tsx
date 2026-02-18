import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Lock, Mail, Zap } from 'lucide-react';
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
            toast.success('Loginsuccessful!');
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
                backgroundColor: '#0f172a',
                padding: '16px',
            }}
        >
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Card */}
                <div
                    style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        borderRadius: '16px',
                        padding: '32px',
                    }}
                >
                    {/* Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div
                            style={{
                                padding: '16px',
                                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                borderRadius: '16px',
                                border: '1px solid rgba(71, 85, 105, 0.3)',
                            }}
                        >
                            <Zap style={{ height: '40px', width: '40px', color: '#3b82f6' }} />
                        </div>
                    </div>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                            Invoicely
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sign in to your account</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#cbd5e1',
                                    marginBottom: '8px',
                                }}
                            >
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        height: '20px',
                                        width: '20px',
                                        color: '#64748b',
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '44px',
                                        paddingRight: '16px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                        border: errors.email ? '1px solid #ef4444' : '1px solid #475569',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p style={{ marginTop: '6px', fontSize: '14px', color: '#f87171' }}>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#cbd5e1',
                                    marginBottom: '8px',
                                }}
                            >
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        height: '20px',
                                        width: '20px',
                                        color: '#64748b',
                                    }}
                                />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '44px',
                                        paddingRight: '16px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                                        border: errors.password ? '1px solid #ef4444' : '1px solid #475569',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <p style={{ marginTop: '6px', fontSize: '14px', color: '#f87171' }}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                fontWeight: '500',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '14px',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }}
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            style={{ opacity: 0.25 }}
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            style={{ opacity: 0.75 }}
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Forgot Password Link */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <a
                            href="#"
                            style={{
                                color: '#3b82f6',
                                fontSize: '14px',
                                textDecoration: 'none',
                            }}
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            marginTop: '32px',
                            paddingTop: '24px',
                            borderTop: '1px solid rgba(51, 65, 85, 0.5)',
                        }}
                    >
                        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                            Secure admin access · IP restricted · All actions logged
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
