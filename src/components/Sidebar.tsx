import React from 'react';
import { LayoutDashboard, Users, Settings, CreditCard, MessageSquare, BarChart3, LogOut, ChevronRight, User, Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: any) => void;
    user: any;
    handleLogout: () => void;
}

export function Sidebar({ currentView, setCurrentView, user, handleLogout }: SidebarProps) {
    const navigation = [
        {
            section: 'Main', items: [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
            ]
        },
        {
            section: 'Insights', items: [
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                { id: 'chat', icon: MessageSquare, label: 'WhatsApp Bot' },
            ]
        },
        {
            section: 'Account', items: [
                { id: 'family', icon: Users, label: 'Family Sharing' },
                { id: 'settings', icon: Settings, label: 'Settings' },
            ]
        },
    ];

    return (
        <aside className="hidden lg:flex w-72 bg-[#1B4B45] border-r border-emerald-900/20 flex-col h-full transition-all duration-300 shadow-xl shadow-emerald-950/20">
            {/* Brand Section */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 transition-transform hover:scale-105 duration-300 shadow-lg">
                        <MessageSquare className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">SubTrack <span className="text-emerald-400">Pro</span></h1>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 overflow-y-auto space-y-8 py-4 custom-scrollbar">
                {navigation.map((group) => (
                    <div key={group.section} className="space-y-1">
                        <h3 className="px-4 text-[11px] font-bold text-emerald-200/50 uppercase tracking-[0.2em] mb-3">
                            {group.section}
                        </h3>
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id as any)}
                                    className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-white text-[#1B4B45] shadow-lg shadow-emerald-950/40 translate-x-1 font-bold'
                                        : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                    {isActive && <ChevronRight size={14} className="opacity-70" />}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer Section */}
            <div className="p-4 mt-auto border-t border-white/5">
                {user?.isDemo && (
                    <div className="mb-4 px-4 py-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">🎭</span>
                            <p className="text-xs font-bold text-amber-400">DEMO MODE</p>
                        </div>
                        <p className="text-[10px] text-amber-200/60">Using sample workspace data</p>
                    </div>
                )}

                <div className="bg-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-white/20 shadow-sm transition-transform group-hover:scale-105 duration-300">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#1B4B45] rounded-full shadow-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Guest User'}</p>
                            <p className="text-xs text-emerald-200/60 truncate">{user?.email || 'guest@subtrack.pro'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                            <NotificationCenter
                                accessToken={user?.accessToken || ''}
                                userId={user?.id || ''}
                            />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                            {/* <ThemeToggle /> */}
                        </div>
                        <button
                            onClick={() => setCurrentView('settings')}
                            className="p-2 rounded-lg text-emerald-200/60 hover:bg-white/10 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
