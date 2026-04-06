import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Share2, 
  Trash2, 
  MoreVertical, 
  Maximize2, 
  Minimize2, 
  Download, 
  Copy, 
  Check,
  Info,
  Tag,
  Calendar,
  Sparkles
} from 'lucide-react';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, Artifact } from '../lib/firebase';
import { format } from 'date-fns';

export default function ArtifactReader() {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchArtifact = async () => {
      if (!artifactId) return;
      try {
        const docRef = doc(db, 'artifacts', artifactId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArtifact({ id: docSnap.id, ...docSnap.data() } as Artifact);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching artifact:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtifact();
  }, [artifactId, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', artifactId!));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting artifact:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!artifact) return null;

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg truncate">{artifact.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-all ${showInfo ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-900 text-zinc-400'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-2" />
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content (Iframe) */}
        <div className="flex-1 bg-white relative">
          <iframe 
            srcDoc={artifact.content}
            title={artifact.title}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Info Sidebar */}
        <AnimatePresence>
          {showInfo && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 p-6 shadow-2xl z-40 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Details</h2>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Title</label>
                  <p className="text-sm font-medium text-zinc-100">{artifact.title}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Created</label>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    {artifact.createdAt ? format(artifact.createdAt.toDate(), 'MMMM d, yyyy') : 'Just now'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {artifact.tags.length === 0 ? (
                      <p className="text-sm text-zinc-600 italic">No tags added</p>
                    ) : (
                      artifact.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Actions</label>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors">
                      <Download className="w-4 h-4" />
                      Download HTML
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors">
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
