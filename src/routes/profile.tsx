import { createFileRoute } from '@tanstack/react-router';
import { useAppStore } from '../lib/store';
import { User, Shield, Mail, MapPin } from 'lucide-react';
import { AddPropertyDialog } from '../components/dashboard/AddPropertyDialog';
import { Button } from '../components/ui/button';

export const Route = createFileRoute('/profile')({
    component: ProfilePage,
});

function ProfilePage() {
    const { user, logout } = useAppStore();

    return (
        <div className="px-4 py-4 sm:px-6 sm:py-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-stripe-text-primary sm:text-3xl">User Profile</h1>
                        <p className="mt-1 text-stripe-text-secondary">Manage your account settings and properties.</p>
                    </div>
                    <div className="flex gap-3">
                        <AddPropertyDialog />
                        <Button variant="outline" onClick={() => logout()}>Log out</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Card */}
                    <div className="rounded-xl border border-stripe-border bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
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
                            <div className="flex items-center gap-3 text-stripe-text-secondary">
                                <Mail className="size-4" />
                                <span className="text-sm">manager@bhd.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-stripe-text-secondary">
                                <User className="size-4" />
                                <span className="text-sm">ID: {user?.id || 'mock-id'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-stripe-text-secondary">
                                <MapPin className="size-4" />
                                <span className="text-sm">South Africa</span>
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
                                    <p className="text-sm text-stripe-text-secondary">Last changed 3 months ago</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-stripe-purple">Change</Button>
                            </div>
                            <div className="flex items-center justify-between border-b border-stripe-border pb-4">
                                <div>
                                    <p className="font-medium text-stripe-text-primary">Two-Factor Auth</p>
                                    <p className="text-sm text-stripe-text-secondary">Enabled for extra security</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-stripe-purple">Manage</Button>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
