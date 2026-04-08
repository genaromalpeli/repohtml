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
            <span className="font-logo font-black text-2xl tracking-tighter text-zinc-100">ARTIFY</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="px-5 py-2.5 bg-zinc-100 text-zinc-950 rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-white/5">
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
              The Home for AI-Generated Artifacts
            </span>
            <h1 className="text-5xl md:text-7xl font-logo font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Organize your AI <br /> artifacts in one place.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Claude and ChatGPT generate beautiful documents, code, and UI. Artify gives them a home. 
              Store, organize, and preview your AI-powered reports, components, and data structures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
                Start Stashing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full -z-10" />
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-2 shadow-2xl overflow-hidden max-w-5xl mx-auto">
              <div className="bg-zinc-950 rounded-2xl border border-zinc-800/50 overflow-hidden aspect-[16/10] relative">
                <img 
                  src="https://picsum.photos/seed/dashboard/1600/1000" 
                  alt="Artify Dashboard Preview" 
                  className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                
                {/* UI Mockup Overlay */}
                <div className="absolute inset-0 flex">
                  {/* Sidebar Mockup */}
                  <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-md p-6 hidden md:flex flex-col gap-8">
                    <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
                      ))}
                    </div>
                    <div className="mt-auto h-12 w-full bg-zinc-800/30 rounded-xl" />
                  </div>
                  
                  {/* Main Content Mockup */}
                  <div className="flex-1 p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-48 h-6 bg-zinc-800 rounded animate-pulse" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 h-fit">
                          <div className="aspect-video bg-zinc-800 rounded-xl mb-2 overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                             <div className="absolute bottom-2 left-2 right-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 w-1/3" />
                             </div>
                          </div>
                          <div className="h-4 bg-zinc-800 rounded w-3/4" />
                          <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  </div>
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
              <h3 className="text-xl font-semibold">Multi-Format Support</h3>
              <p className="text-zinc-400 leading-relaxed">
                Whether it's HTML, Markdown, React (JSX/TSX), or data (JSON/CSS), we render and organize every artifact with pixel-perfect precision.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <FolderOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Smart Organization</h3>
              <p className="text-zinc-400 leading-relaxed">
                Group your documents, code snippets, and UI components into folders. Tag them for quick retrieval and keep your AI research tidy.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <Share2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Instant Sharing</h3>
              <p className="text-zinc-400 leading-relaxed">
                Share clean, immersive links for your artifacts. No more sending raw code or .html files via Slack or email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© 2026 Artify. Built for the AI era.</p>
      </footer>
    </div>
  );
}
