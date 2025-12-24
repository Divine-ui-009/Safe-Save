import { useState, FormEvent } from 'react';
import { ArrowLeft, Wallet, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface SignInFormProps {
  onBack: () => void;
  onWalletSignIn?: () => void;
  onSignInSuccess?: () => void;
}

export function SignInForm({ onBack, onWalletSignIn, onSignInSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const success = await login(email, password);
      if (success && onSignInSuccess) {
        onSignInSuccess();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSignIn} className="px-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-lg flex items-center justify-center mb-4">
            <Wallet className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-emerald-600 mb-2 text-2xl font-semibold">Welcome Back</h2>
          <p className="text-slate-600 text-center">
            Sign in to your Safe-Save account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {/* Email Field */}
          <div className="space-y-4 mb-6">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Email address"
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-70"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Password"
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:opacity-70"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Wallet Connect Option */}
        <button 
          onClick={onWalletSignIn}
          className="w-full bg-white text-slate-700 py-4 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>Quick Sign In with Wallet</span>
        </button>

        {/* Footer */}
        <p className="text-slate-500 text-sm text-center mt-8">
          Don't have an account?{' '}
          <button
            onClick={onBack}
            className="text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Join a Group
          </button>
        </p>
      </form>
    </div>
  );
}