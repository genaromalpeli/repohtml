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
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout, db, Folder } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'folders'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
      setFolders(folderData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Artifact</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-zinc-800 rounded-md text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-6">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search artifacts..." 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>
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
                <button className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-100 transition-colors">
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
                    <Link
                      key={folder.id}
                      to={`/folder/${folder.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                        location.pathname === `/folder/${folder.id}`
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      )}
                    >
                      <FolderOpen className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
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
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="font-bold">Artifact</span>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
