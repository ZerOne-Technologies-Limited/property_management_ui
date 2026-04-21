import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../lib/store';
import { User, Shield, Phone, LogOut } from 'lucide-react';
import { AddPropertyDialog } from '../components/dashboard/AddPropertyDialog';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/profile')({
    component: ProfilePage,
});

function avatarColor(name: string) {
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-purple-100 text-purple-600',
        'bg-green-100 text-green-600',
        'bg-amber-100 text-amber-600',
        'bg-rose-100 text-rose-600',
        'bg-teal-100 text-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function ProfilePage() {
    const { user, logout } = useAppStore();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate({ to: '/login' });
    }

    const initials = user?.name
        ? user.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
        : 'US';

    return (
        <div className="px-4 py-4 sm:px-6 sm:py-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-stripe-text-primary sm:text-3xl">Profile</h1>
                    <p className="mt-1 text-stripe-text-secondary">Manage your account settings and properties.</p>
                </div>
                <div className="flex gap-3">
                    <AddPropertyDialog />
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <div className="rounded-xl border border-stripe-border bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${avatarColor(user?.name ?? '')}`}>
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-stripe-text-primary">{user?.name || 'User'}</h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-stripe-purple-light px-2 py-0.5 text-xs font-medium text-stripe-purple">
                                <Shield className="size-3" />
                                {user?.role || 'Manager'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {user?.phone && (
                            <div className="flex items-center gap-3 text-stripe-text-secondary">
                                <Phone className="size-4 shrink-0" />
                                <span className="text-sm">{user.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-stripe-text-secondary">
                            <User className="size-4 shrink-0" />
                            <span className="text-sm font-mono text-xs">ID: {user?.id || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Account Security Card */}
                <div className="rounded-xl border border-stripe-border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-stripe-text-primary">Account Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-stripe-border pb-4">
                            <div>
                                <p className="font-medium text-stripe-text-primary">Password</p>
                                <p className="text-sm text-stripe-text-secondary">Use a strong, unique password.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-stripe-purple"
                                disabled
                                title="Coming soon"
                            >
                                Change
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-stripe-text-primary">Session</p>
                                <p className="text-sm text-stripe-text-secondary">Sign out of your current session.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
