import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react';
import z from 'zod'
import type { loginModel } from '../types/auth';
import { loginUser } from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
// import { Badge } from '../components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../lib/store';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: z.object({
    redirectTo: z.string().default('/'),
  }),
  beforeLoad: async ({ }) => {
    // Auth check logic
  },
})

function RouteComponent() {
  const { login } = useAppStore(); // Use global store
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const router = useRouter();

  const [credentials, setCredentials] = useState<loginModel>({
    PhoneNumber: '',
    Password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use real API
      const response = await loginUser(credentials);

      console.log('Login successful');
      login(response, "Manager");

      await router.invalidate();
      navigate({ to: search.redirectTo });

    } catch (err) {
      console.error('Login failed:', err);
      // More specific error handling if possible, e.g. 401
      setError("Invalid phone number or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your properties efficiently
          </p>
        </div>

        <Card className="border-gray-200 shadow-xl ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium text-gray-500 hidden">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+1234567890"
                  value={credentials.PhoneNumber}
                  onChange={(e) => setCredentials(prev => ({ ...prev, PhoneNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.Password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, Password: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
