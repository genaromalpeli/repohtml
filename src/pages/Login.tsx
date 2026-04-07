import { motion } from 'motion/react';
import { Sparkles, Chrome, ArrowLeft } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-indigo-500/30 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Landing
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-logo font-bold text-white mb-2">Welcome to Artify</h1>
          <p className="text-zinc-400">Sign in to start organizing your AI artifacts.</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-white text-zinc-950 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
