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
import { BookOpen, Folder, LayoutGrid, BookUser, ContactRound, ShieldBan, NotepadText } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Exams',
        href: '/exams',
        icon: BookOpen,
    },
        {
        title: 'Students',
        href: '/students',
        icon: BookUser,
    },
    {
        title: 'Teachers',
        href: '/teachers',
        icon: ContactRound,
    },
    {
        title: 'Admins',
        href: '/admins',
        icon: NotepadText,
    },
    {
        title: 'Courses',
        href: '/courses',
        icon: ShieldBan,
    },
    
];

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
