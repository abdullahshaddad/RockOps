import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberPassword, setRememberPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Login returns the complete response with token, role, etc.
            const userData = await login(username, password);
            console.log('[LoginPage] Login successful:', userData);

            // Navigate based on role from the response
            if (userData.role === 'ADMIN') {
                console.log('[LoginPage] Redirecting to admin page');
                navigate('/admin');
            } else {
                console.log('[LoginPage] Redirecting to dashboard');
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.message || 'Failed to login. Please check your credentials.');
            console.error('[LoginPage] Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const backgroundStyle = {
        backgroundImage: "url('/Assets/imgs/rock4mining-pattern.png')",
    };

    return (
        <div className="login-container" style={backgroundStyle}>
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">Login to Account</h2>
                    <p className="login-subtitle">Please enter your username and password to continue</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">
                            Username:
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="form-control"
                            placeholder="@username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="password-header">
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
                            <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="remember-container">
                        <input
                            id="remember"
                            type="checkbox"
                            className="remember-checkbox"
                            checked={rememberPassword}
                            onChange={(e) => setRememberPassword(e.target.checked)}
                        />
                        <label htmlFor="remember" className="remember-label">
                            Remember Password
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="signup-link">
                    <span>Don't have an account? </span>
                    <a href="/register">Create Account</a>
                </div>
            </div>
        </div>
    );
};

export default Login;