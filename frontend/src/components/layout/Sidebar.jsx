import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel, SidebarGroupContent, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { LayoutDashboard, TriangleAlert, FileText, Settings, LogOut, User2, ShieldAlert, ChevronsUpDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "@/store/AuthProvider";
import { publicClient } from "@/api/api";
import { useContext, useState } from "react";
import { useUser } from "@/store/useUser";

export default function AppSidebar() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { clearSession } = useContext(AuthContext);
    const navigate = useNavigate()
    const location = useLocation()
    const { open } = useSidebar()
    const user = useUser((state) => state.user);

    const Menu = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'ALERTS', url: '/alerts', icon: TriangleAlert },
        { title: 'MY REPORTS', url: '/reports', icon: FileText },
        { title: 'SETTING', url: '/setting', icon: Settings }
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        const logoutPromise = publicClient.post('/api/auth/logout');

        toast.promise(logoutPromise, {
            loading: 'Terminating Sessions...',
            success: () => {
                clearSession();
                navigate("/", { replace: true });
                return "Logged Out Successfully"
            },
            error: (err) => {
                clearSession()
                navigate("/", { replace: true })
                return err.response?.data?.message || "Session ended with exceptions."
            }
        });

        logoutPromise.finally(() => setIsLoggingOut(false));
    };

    return (
        <aside aria-label="Primary sidebar">
            <Sidebar className="border-r border-sidebar-border rounded" collapsible="icon">

                <SidebarHeader className="border-b border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="group/header relative flex h-9 w-full items-center">
                                <SidebarMenuButton className={`hover:bg-transparent transition-opacity duration-200 
                            ${!open ? "group-hover/header:opacity-0 justify-center" : "gap-2 px-1"} `} render={
                                        <Link to="/dashboard" className="flex items-center gap-2 px-1 rounded-md transition-colors hover:bg-sidebar-accent">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-destructive/10">
                                                <ShieldAlert className="h-5 w-5 text-destructive" />
                                            </div>
                                            <span className="font-semibold text-sidebar-foreground">DisasterWatch</span>
                                        </Link>
                                    } />
                                <SidebarTrigger className={`cursor-pointer h-7 w-7 transition-all duration-200 
                                ${!open ? "absolute left-0 opacity-0 pointer-events-none group-hover/header:opacity-100 group-hover/header:pointer-events-auto" : "opacity-100"}`} />
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="py-2">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground"> MENU </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {Menu.map((item) => {
                                    const isActive = location.pathname === item.url;

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton isActive={isActive} tooltip={item.title} render={
                                                <Link to={item.url} className="mb-1 flex items-center w-full gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
                                                    <item.icon className={`h-4 w-4 ${isActive ? `text-primary` : 'none'} `} /> <span> {item.title} </span> </Link>
                                            } />
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <SidebarMenuButton disabled={isLoggingOut} className="data-[state=open]:bg-sidebar-accent cursor-pointer">
                                            <div className="flex w-6 h-6 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium">
                                                <User2 className="h-4 w-4" />
                                            </div>
                                            <span className="truncate text-sm">{user?.firstName} {user?.lastName}</span>
                                            <ChevronsUpDown className="ml-auto h-3.5 w-3.5 opacity-50" />
                                        </SidebarMenuButton>
                                    } />
                                <DropdownMenuContent
                                    side="top"
                                    align="end"
                                    className="w-[--radix-popper-anchor-width] min-w-46 rounded-md p-1"
                                >
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium leading-none"> {user?.firstName} {user?.lastName} </span>
                                                <span className="text-xs text-muted-foreground truncate"> {user?.email} </span>
                                            </div>
                                        </DropdownMenuLabel>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="cursor-pointer mb-1" render={
                                            <Link to="/setting">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span> Profile Setting </span>
                                            </Link>
                                        } />
                                        <DropdownMenuItem className="cursor-pointer" render={
                                            <Link to="/reports">
                                                <FileText className="h-4 w-4 mr-2" />
                                                <span> My Reports History </span>
                                            </Link>
                                        } />
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        <span>Log Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </aside>
    )
}