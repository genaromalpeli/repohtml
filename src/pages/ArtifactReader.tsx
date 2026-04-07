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
  Sparkles,
  FileText,
  FileCode,
  FileJson,
  Eye,
  Code as CodeIcon
} from 'lucide-react';
import { doc, getDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db, Artifact, auth } from '../lib/firebase';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSXRenderer from '../components/JSXRenderer';

export default function ArtifactReader() {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

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
    if (!artifact) return;
    if (!window.confirm('Are you sure you want to delete this artifact?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', artifactId!));
      // Update user storage usage
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          storageUsed: increment(-artifact.size)
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting artifact:', err);
    }
  };

  const renderContent = () => {
    if (!artifact) return null;

    // If user explicitly wants to see code
    if (viewMode === 'code' && artifact.type !== 'html') {
      const language = artifact.type === 'jsx' ? 'javascript' : 
                       artifact.type === 'tsx' ? 'typescript' : 
                       artifact.type;
      return (
        <div className="w-full h-full overflow-hidden bg-[#1d1f21]">
          <SyntaxHighlighter 
            language={language} 
            style={atomDark}
            customStyle={{ 
              margin: 0, 
              padding: '2rem', 
              height: '100%', 
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}
            showLineNumbers
          >
            {artifact.content}
          </SyntaxHighlighter>
        </div>
      );
    }

    switch (artifact.type) {
      case 'html': {
        // Sanitize HTML to prevent "Cannot set property fetch of #<Window>" error
        // by injecting a script that makes these globals configurable/writable
        const injection = `
          <script>
            (function() {
              const protected = ['fetch', 'location', 'history', 'navigator', 'screen'];
              protected.forEach(prop => {
                try {
                  const original = window[prop];
                  Object.defineProperty(window, prop, {
                    value: original,
                    writable: true,
                    configurable: true,
                    enumerable: true
                  });
                } catch (e) {
                  // If defineProperty fails, we try to shadow it with a var
                  window[prop] = window[prop]; 
                }
              });
            })();
          </script>
        `;
        
        let sanitizedContent = artifact.content;
        if (sanitizedContent.includes('<head>')) {
          sanitizedContent = sanitizedContent.replace('<head>', '<head>' + injection);
        } else if (sanitizedContent.includes('<html>')) {
          sanitizedContent = sanitizedContent.replace('<html>', '<html><head>' + injection + '</head>');
        } else {
          sanitizedContent = injection + sanitizedContent;
        }

        return (
          <iframe 
            srcDoc={sanitizedContent}
            title={artifact.title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        );
      }
      case 'markdown':
        return (
          <div className="w-full h-full overflow-y-auto bg-white p-8 md:p-12 lg:p-20 selection:bg-indigo-100">
            <div className="max-w-3xl mx-auto prose prose-indigo prose-zinc lg:prose-xl">
              <Markdown>{artifact.content}</Markdown>
            </div>
          </div>
        );
      case 'jsx':
      case 'tsx':
        return (
          <div className="w-full h-full overflow-y-auto bg-zinc-950">
            <JSXRenderer code={artifact.content} className="w-full h-full" />
          </div>
        );
      default:
        // Other code types (json, css, js, ts) - always show code if not jsx/tsx/md/html
        return (
          <div className="w-full h-full overflow-hidden bg-[#1d1f21]">
            <SyntaxHighlighter 
              language={artifact.type} 
              style={atomDark}
              customStyle={{ 
                margin: 0, 
                padding: '2rem', 
                height: '100%', 
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}
              showLineNumbers
            >
              {artifact.content}
            </SyntaxHighlighter>
          </div>
        );
    }
  };

  const getIcon = () => {
    if (!artifact) return <Sparkles className="w-4 h-4 text-white" />;
    switch (artifact.type) {
      case 'html': return <Sparkles className="w-4 h-4 text-white" />;
      case 'markdown': return <FileText className="w-4 h-4 text-white" />;
      case 'json': return <FileJson className="w-4 h-4 text-white" />;
      default: return <FileCode className="w-4 h-4 text-white" />;
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

  const canPreview = ['html', 'markdown', 'jsx', 'tsx'].includes(artifact.type);

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
            <h1 className="font-bold text-lg truncate">{artifact.title}</h1>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-wider">
              {artifact.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canPreview && artifact.type !== 'html' && (
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mr-2">
              <button 
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button 
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <CodeIcon className="w-3.5 h-3.5" />
                Code
              </button>
            </div>
          )}

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
        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
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
