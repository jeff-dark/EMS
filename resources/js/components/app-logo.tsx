import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div> */}
            <div className="flex items-center gap-2">
                <img
                    src="/images/alison_icon.jpeg"
                    alt="Exam Management System Logo"
                    className="h-9 w-9 rounded-md"
                />
                <span className="text-base font-semibold tracking-tight">
                    EMS
                </span>
            </div>
        </>
    );
}
