import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, Layout, Share2, FolderOpen, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">Artifact</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
              Log in
            </Link>
            <Link to="/login" className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-full text-sm font-semibold hover:bg-white transition-all shadow-lg shadow-white/5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 border border-indigo-500/20">
              The Home for AI-Generated HTML
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Organize your AI <br /> artifacts in one place.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Claude and ChatGPT generate beautiful HTML documents. Artifact gives them a home. 
              Store, organize, and share your AI-powered reports, presentations, and one-pagers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
                Start Stashing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-zinc-100 rounded-full text-lg font-semibold hover:bg-zinc-800 transition-all border border-zinc-800">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Preview Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full -z-10" />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl overflow-hidden aspect-video max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-3 space-y-3">
                  <div className="h-8 bg-zinc-800/50 rounded w-full" />
                  <div className="h-8 bg-zinc-800/50 rounded w-3/4" />
                  <div className="h-8 bg-zinc-800/50 rounded w-5/6" />
                </div>
                <div className="col-span-9 grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-zinc-800/30 rounded-xl border border-zinc-800/50" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section className="py-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <Layout className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Visual Integrity</h3>
              <p className="text-zinc-400 leading-relaxed">
                We render your HTML artifacts exactly as they were intended. No more broken styles or lost layouts in Notion.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <FolderOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Smart Organization</h3>
              <p className="text-zinc-400 leading-relaxed">
                Group your documents into folders and workspaces. Tag them for quick retrieval and keep your research tidy.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <Share2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Instant Sharing</h3>
              <p className="text-zinc-400 leading-relaxed">
                Share a clean, immersive link with your team. No more sending .html files via Slack or email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© 2026 Artifact. Built for the AI era.</p>
      </footer>
    </div>
  );
}
