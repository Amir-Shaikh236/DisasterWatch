import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    TriangleAlert,
    FileText,
    Settings,
    Radio,
    Menu,
    X,
    LogOut,
    Loader2
} from "lucide-react";
import { AuthContext } from "@/store/AuthProvider";
import { privateClient } from "@/api/api";
import { toast } from "sonner";

const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Active Alerts", to: "/alerts", icon: TriangleAlert },
    { label: "My Reports", to: "/reports", icon: FileText },
    { label: "Settings", to: "/settings", icon: Settings },
];

function NavItem({ to, icon: Icon, label, onClick }) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${isActive
                    ? "bg-teal-500/10 text-teal-400 border-l-2 border-teal-400"
                    : "text-slate-400 border-l-2 border-transparent hover:bg-slate-900 hover:text-slate-200"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                            }`}
                        aria-hidden="true"
                    />
                    <span className="font-medium">{label}</span>
                    {label === "Active Alerts" && (
                        <span
                            className="ml-auto flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"
                            role="status"
                            aria-label="New active alerts pending review"
                        />
                    )}
                </>
            )}
        </NavLink>
    );
}

function SidebarContent({ onNavigate }) {
    const { clearSession } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        const logoutPromise = privateClient.post("/api/auth/logout");

        toast.promise(logoutPromise, {
            loading: "Terminating session...",
            success: () => {
                clearSession();
                navigate("/", { replace: true });
                return "Logged out successfully.";
            },
            error: (err) => {
                // Fail-safe fallback: Clean client context even if server request times out or errors
                clearSession();
                navigate("/", { replace: true });
                return err.response?.data?.message || "Session ended with exceptions.";
            },
        });
    };

    return (
        <div className="flex h-full flex-col bg-slate-950">
            {/* Brand Identity */}
            <div className="flex items-center gap-2 px-4 py-6 text-teal-400">
                <Radio className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-mono tracking-widest uppercase font-bold">DisasterWatch</span>
            </div>

            {/* Navigation Framework */}
            <nav className="flex-1 space-y-1 px-3" aria-label="Main Navigation">
                {navItems.map((item) => (
                    <NavItem key={item.to} {...item} onClick={onNavigate} />
                ))}
            </nav>

            {/* Functional Operational Footer */}
            <div className="mt-auto border-t border-slate-800 p-3 space-y-3">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-rose-400 border-l-2 border-transparent hover:bg-rose-950/20 hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Log out of application account"
                >
                    {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-400" aria-hidden="true" />
                    ) : (
                        <LogOut className="h-4 w-4 shrink-0 text-rose-500 group-hover:text-rose-400 transition-colors" aria-hidden="true" />
                    )}
                    <span>{isLoggingOut ? "Ending Session..." : "Sign Out"}</span>
                </button>

                <div className="flex items-center gap-2 px-1 text-xs font-mono text-slate-500Select selection text-nowrap select-none">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400" />
                    </span>
                    Monitoring active
                </div>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Top App Bar Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 lg:hidden">
                <div className="flex items-center gap-2 text-teal-400">
                    <Radio className="h-5 w-5" aria-hidden="true" />
                    <span className="text-sm font-mono tracking-widest uppercase font-bold">DisasterWatch</span>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="rounded-md p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                    aria-label="Open primary site navigation menu"
                    aria-expanded={isOpen}
                >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {/* Mobile Navigation Portal Overlay Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                    {/* Backdrop Shading click listener mask */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    <div className="relative flex h-full w-64 flex-col bg-slate-950 border-r border-slate-800 shadow-2xl animate-in slide-in-from-left duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-3 top-5 rounded-md p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-700 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <SidebarContent onNavigate={() => setIsOpen(false)} />
                    </div>
                </div>
            )}

            {/* Static Desktop Persistent Shell Container Aside Layout */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-800 lg:bg-slate-950 lg:h-screen lg:sticky lg:top-0">
                <SidebarContent />
            </aside>
        </>
    );
}