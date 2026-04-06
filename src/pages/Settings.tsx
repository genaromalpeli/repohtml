import { motion } from 'motion/react';
import { User, Mail, Shield, Bell, Globe, Trash2 } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function Settings() {
  const user = auth.currentUser;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-zinc-500">Manage your account and workspace preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-6 mb-8">
            <img 
              src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
              alt="User" 
              className="w-20 h-20 rounded-full ring-4 ring-zinc-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-2xl font-bold">{user?.displayName}</h2>
              <p className="text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue={user?.displayName || ''}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Email Address</label>
              <input 
                disabled
                type="email" 
                defaultValue={user?.email || ''}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-400" />
            Workspace Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                  <Bell className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="font-semibold">Email Notifications</p>
                  <p className="text-xs text-zinc-500">Get updates about your shared artifacts.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                  <Shield className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="font-semibold">Public Profile</p>
                  <p className="text-xs text-zinc-500">Allow others to see your public artifacts.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-3">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-red-500/60 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
