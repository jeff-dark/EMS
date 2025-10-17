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
import { BookOpen, Folder, LayoutGrid, BookUser, ContactRound, ShieldBan, NotepadText, ClipboardList } from 'lucide-react';
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
    }
    if (role === 'admin') {
        items.push({ title: 'Teachers', href: '/teachers', icon: ContactRound });
        items.push({ title: 'Admins', href: '/admins', icon: NotepadText });
        items.push({ title: 'Courses', href: '/courses', icon: ShieldBan });
    }
    // Teacher-specific: Submitted Exams link for grading
    if (role === 'teacher') {
        items.push({ title: 'Submitted Exams', href: '/grading/exams/submitted', icon: ClipboardList });
    }
    // Student-specific: My Results page
    if (role === 'student') {
        items.push({ title: 'My Results', href: '/student/results', icon: ClipboardList });
    }
    return items;
}

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/dashboard',
        icon: Folder,
    },
    {
        title: 'Repository',
        href: '/dashboard',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    const role = (page?.props as any)?.auth?.role as string | undefined;
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
