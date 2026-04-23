import { createFileRoute } from '@tanstack/react-router';
import { useAppStore } from '../lib/store';
import { CURRENCY_OPTIONS, LOCALE_OPTIONS, formatMoney } from '../lib/format-money';
import { Button } from '../components/ui/button';
import { Sparkles } from 'lucide-react';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const currencyCode = useAppStore((s) => s.currencyCode);
    const numberLocale = useAppStore((s) => s.numberLocale);
    const setCurrencyCode = useAppStore((s) => s.setCurrencyCode);
    const setNumberLocale = useAppStore((s) => s.setNumberLocale);
    const setHasSeenTour = useAppStore((s) => s.setHasSeenTour);

    const preview = formatMoney(1234.56, currencyCode, numberLocale);

    return (
        <div className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-stripe-text-primary sm:text-3xl">Settings</h1>
                <p className="mt-1 text-stripe-text-secondary">
                    Regional preferences and app behaviour. Changes apply immediately and are saved on this device.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-stripe-border bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold text-stripe-text-primary">Regional</h2>
                    <p className="mb-6 text-sm text-stripe-text-secondary">
                        Currency and number formatting used across payments, receipts, and lists.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="settings-currency" className="text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">
                                Currency
                            </label>
                            <select
                                id="settings-currency"
                                value={currencyCode}
                                onChange={(e) => setCurrencyCode(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
                            >
                                {CURRENCY_OPTIONS.map((o) => (
                                    <option key={o.code} value={o.code}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="settings-locale" className="text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">
                                Number locale
                            </label>
                            <select
                                id="settings-locale"
                                value={numberLocale}
                                onChange={(e) => setNumberLocale(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
                            >
                                {LOCALE_OPTIONS.map((o) => (
                                    <option key={o.code} value={o.code}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-lg border border-dashed border-stripe-border bg-stripe-sidebar px-4 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-stripe-text-secondary">Preview</p>
                            <p className="mt-1 font-mono text-lg font-semibold text-stripe-text-primary tabular-nums">{preview}</p>
                            <p className="mt-0.5 text-xs text-stripe-text-secondary">Sample: 1,234.56 in your selected currency</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-stripe-border bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold text-stripe-text-primary">App</h2>
                    <p className="mb-6 text-sm text-stripe-text-secondary">Onboarding and other app-wide options.</p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="font-medium text-stripe-text-primary">Onboarding tour</p>
                            <p className="mt-1 text-sm text-stripe-text-secondary">
                                Show the guided tour again the next time you use the dashboard.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-3 gap-2"
                                onClick={() => setHasSeenTour(false)}
                            >
                                <Sparkles className="size-4" />
                                Replay onboarding tour
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
