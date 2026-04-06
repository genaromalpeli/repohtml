import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Upload, 
  FolderPlus, 
  MoreVertical, 
  FileCode, 
  ExternalLink, 
  Trash2, 
  Tag, 
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  X,
  FileText
} from 'lucide-react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  orderBy
} from 'firebase/firestore';
import { auth, db, Artifact, Folder } from '../lib/firebase';
import { format } from 'date-fns';

export default function Dashboard() {
  const { folderId } = useParams();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch Artifacts
  useEffect(() => {
    if (!auth.currentUser) return;
    
    let q = query(
      collection(db, 'artifacts'), 
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    if (folderId) {
      q = query(
        collection(db, 'artifacts'), 
        where('ownerId', '==', auth.currentUser.uid),
        where('folderId', '==', folderId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const artifactData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artifact));
      setArtifacts(artifactData);
    });
    return () => unsubscribe();
  }, [folderId]);

  // Fetch Subfolders
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'folders'), 
      where('ownerId', '==', auth.currentUser.uid),
      where('parentId', '==', folderId || null)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
      setFolders(folderData);
    });
    return () => unsubscribe();
  }, [folderId]);

  // File Upload Logic
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!auth.currentUser) return;
    setUploading(true);
    
    for (const file of acceptedFiles) {
      if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
        console.error('Only HTML files are allowed');
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          await addDoc(collection(db, 'artifacts'), {
            title: file.name.replace('.html', ''),
            content,
            ownerId: auth.currentUser?.uid,
            folderId: folderId || null,
            tags: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.error('Error uploading artifact:', err);
        }
      };
      reader.readAsText(file);
    }
    
    setUploading(false);
    setIsUploadModalOpen(false);
  }, [folderId]);

  const dropzoneOptions: any = { 
    onDrop,
    accept: { 'text/html': ['.html'] },
    multiple: true
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newFolderName.trim()) return;

    try {
      await addDoc(collection(db, 'folders'), {
        name: newFolderName.trim(),
        ownerId: auth.currentUser.uid,
        parentId: folderId || null,
        createdAt: serverTimestamp()
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const handleDeleteArtifact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artifact?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', id));
    } catch (err) {
      console.error('Error deleting artifact:', err);
    }
  };

  const filteredArtifacts = artifacts.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {folderId ? 'Folder Contents' : 'Dashboard'}
          </h1>
          <p className="text-zinc-500">
            {folderId ? 'View and manage artifacts in this folder.' : 'Welcome back! Here are your latest AI artifacts.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all text-sm font-medium"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all text-sm font-medium shadow-lg shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" />
            Upload HTML
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search artifacts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Folders Section (if any) */}
      {folders.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-widest mb-4 px-2">Subfolders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Link 
                key={folder.id} 
                to={`/folder/${folder.id}`}
                className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{folder.name}</h3>
                  <p className="text-xs text-zinc-500">Folder</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts Grid/List */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-600 uppercase tracking-widest mb-4 px-2">Artifacts</h2>
        {filteredArtifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
              <FileCode className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No artifacts found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-6">
              Start by uploading an HTML file generated by your favorite AI tool.
            </p>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all font-medium"
            >
              Upload your first artifact
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
            {filteredArtifacts.map((artifact) => (
              <motion.div
                layout
                key={artifact.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={viewMode === 'grid' 
                  ? "group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all"
                  : "group flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-all"
                }
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                      <FileText className="w-12 h-12 text-zinc-800 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors" />
                      <Link 
                        to={`/artifact/${artifact.id}`}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="px-4 py-2 bg-white text-zinc-950 rounded-full text-sm font-bold shadow-xl flex items-center gap-2">
                          View Artifact
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </Link>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg truncate flex-1 pr-4">{artifact.title}</h3>
                        <button 
                          onClick={() => handleDeleteArtifact(artifact.id)}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {artifact.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px] font-bold uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {artifact.createdAt ? format(artifact.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          {artifact.tags.length} tags
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
                      <FileText className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{artifact.title}</h3>
                      <p className="text-xs text-zinc-500">
                        {artifact.createdAt ? format(artifact.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/artifact/${artifact.id}`}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteArtifact(artifact.id)}
                        className="p-2 bg-zinc-800 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Upload Artifacts</h2>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                  isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-indigo-400' : 'text-zinc-600'}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? 'Drop them here!' : 'Drag & drop HTML files'}
                </h3>
                <p className="text-zinc-500 text-sm mb-8">
                  Upload files generated by Claude, ChatGPT, or any other AI tool.
                </p>
                <button className="px-6 py-2.5 bg-zinc-100 text-zinc-950 rounded-xl font-bold hover:bg-white transition-all">
                  Select Files
                </button>
              </div>

              {uploading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-400">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Uploading artifacts...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Folder Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">New Folder</h2>
                <button 
                  onClick={() => setIsFolderModalOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Folder Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g. Market Research" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsFolderModalOpen(false)}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-semibold hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
