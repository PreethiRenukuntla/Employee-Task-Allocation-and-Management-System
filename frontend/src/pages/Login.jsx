import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-x-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 shadow-xl shadow-primary-500/30 mb-6">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your TaskFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm text-center animate-slide-up">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500/50 mr-2" />
              Remember me
            </label>
            <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center py-3"
          >
            {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>
                 Sign In
                 <ArrowRight className="w-4 h-4 ml-2" />
               </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          Don't have an account?{' '}
          <a href="/register" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
            Sign up
          </a>
        </p>

        <p className="text-center mt-4 text-xs text-slate-600">
          Admin Login Setup: <br/> email: admin@system.com / pass: password123
        </p>
      </div>
    </div>
  );
};

export default Login;
