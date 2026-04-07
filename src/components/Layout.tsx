import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  ChevronRight,
  Star,
  Clock,
  Menu,
  X,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout, db, Folder, UserProfile, STORAGE_QUOTA_BYTES } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ConfirmationModal from './ConfirmationModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  user: User | null;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'folders'), where('ownerId', '==', user.uid));
    const unsubscribeFolders = onSnapshot(q, (snapshot) => {
      const folderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
      setFolders(folderData);
    });

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      }
    });

    return () => {
      unsubscribeFolders();
      unsubscribeProfile();
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteFolder = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Folder',
      message: 'Are you sure you want to delete this folder? All artifacts inside will remain but will be moved to the main dashboard.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'folders', id));
        } catch (err) {
          console.error('Error deleting folder:', err);
        }
      }
    });
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !user) return;
    try {
      await addDoc(collection(db, 'folders'), {
        name: newFolderName.trim(),
        ownerId: user.uid,
        parentId: null,
        createdAt: serverTimestamp()
      });
      setNewFolderName('');
      setIsFolderModalOpen(false);
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const storageUsed = userProfile?.storageUsed || 0;
  const storageQuota = userProfile?.storageQuota || STORAGE_QUOTA_BYTES;
  const storagePercentage = Math.min(Math.round((storageUsed / storageQuota) * 100), 100);
  const storageFormatted = (storageUsed / (1024 * 1024)).toFixed(2);
  const quotaFormatted = (storageQuota / (1024 * 1024)).toFixed(0);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Clock, label: 'Recent', path: '/recent' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:relative z-40 w-72 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col shadow-2xl"
          >
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <span className="font-logo font-black text-xl tracking-tighter text-zinc-100 group-hover:text-indigo-400 transition-colors">ARTIFY</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-zinc-800 rounded-md text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2">Main</div>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                    location.pathname === item.path 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", location.pathname === item.path ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                  {item.label}
                </Link>
              ))}

              <div className="mt-8 mb-2 flex items-center justify-between px-2">
                <div className="text-xs font-semibold text-zinc-600 uppercase tracking-widest">Folders</div>
                <button 
                  onClick={() => setIsFolderModalOpen(true)}
                  className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {folders.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-zinc-600 text-center italic border border-dashed border-zinc-800 rounded-xl">
                    No folders yet
                  </div>
                ) : (
                  folders.map((folder) => (
                    <div key={folder.id} className="relative group">
                      <Link
                        to={`/folder/${folder.id}`}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                          location.pathname === `/folder/${folder.id}`
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                        )}
                      >
                        <FolderOpen className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                        <span className="truncate pr-6">{folder.name}</span>
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              {/* Storage Usage */}
              <div className="px-2 mb-6">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  <span>Storage Usage</span>
                  <span className={cn(storagePercentage > 90 ? "text-red-400" : "text-zinc-400")}>
                    {storagePercentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    className={cn(
                      "h-full transition-all duration-500",
                      storagePercentage > 90 ? "bg-red-500" : storagePercentage > 70 ? "bg-yellow-500" : "bg-indigo-500"
                    )}
                  />
                </div>
                <p className="mt-2 text-[10px] text-zinc-600">
                  {storageFormatted} MB of {quotaFormatted} MB used
                </p>
              </div>

              <div className="flex items-center gap-3 mb-4 px-2">
                <img 
                  src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                  alt="User" 
                  className="w-8 h-8 rounded-full ring-2 ring-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  to="/settings"
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        {!isSidebarOpen && (
          <header className="lg:hidden h-16 border-b border-zinc-800 bg-zinc-950 flex items-center px-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-4 flex items-center gap-2">
              <span className="font-logo font-black text-xl tracking-tighter text-zinc-100">ARTIFY</span>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950">
          <Outlet />
        </main>
      </div>

      {/* New Folder Modal */}
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

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}
