import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, LayoutGrid, BookUser, ContactRound, ShieldBan, NotepadText, ClipboardList, FileText } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';

function buildMainNavItems(role?: string): NavItem[] {
    const items: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        { title: 'Exams', href: '/exams', icon: BookOpen },
    ];
    if (role === 'teacher' || role === 'admin') {
        items.push({ title: 'Students', href: '/students', icon: BookUser });
    }
    // Teacher-specific: My Courses list (courses the teacher is assigned to)
    if (role === 'teacher') {
        items.push({ title: 'My Courses', href: '/courses', icon: BookOpen });
        // Teacher Revision Bank management
        items.push({ title: 'Revision Bank', href: '/revision', icon: FileText });
    }
    if (role === 'admin') {
        items.push({ title: 'Instructors', href: '/teachers', icon: ContactRound });
        items.push({ title: 'Admins', href: '/admins', icon: NotepadText });
        items.push({ title: 'Courses', href: '/courses', icon: ShieldBan });
        items.push({ title: 'System Settings', href: '/admin/system-settings', icon: NotepadText });
        // Admin-only: Proctoring Events (violations overview)
        // items.push({ title: 'Proctoring Events', href: '/admin/proctor/events', icon: ShieldBan });
        // Admin-only: Audit Logs
        items.push({ title: 'Logs', href: '/admin/logs', icon: NotepadText });
    }
    // Teacher-specific: Submitted Exams link for grading
    if (role === 'teacher') {
        items.push({ title: 'Submitted Exams', href: '/grading/exams/submitted', icon: ClipboardList });
    }
    // Student-specific: My Results page
    if (role === 'student') {
        items.push({ title: 'My Results', href: '/student/results', icon: ClipboardList });
        // Student Revision access
        items.push({ title: 'Revise', href: '/student/revision', icon: FileText });
    }
    return items;
}

// Footer links removed per request; keep component for layout consistency
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const page = usePage();
    const roleRaw = (page?.props as any)?.auth?.role as string | undefined;
    const role = roleRaw ? roleRaw.toLowerCase() : undefined;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={buildMainNavItems(role)} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
