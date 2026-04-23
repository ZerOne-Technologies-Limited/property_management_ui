import { useMemo } from 'react';
import { useAppStore } from './store';

export function formatMoney(amount: number, currencyCode: string, numberLocale: string): string {
    try {
        return new Intl.NumberFormat(numberLocale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currencyCode}`;
    }
}

/** Presets for the Settings currency select */
export const CURRENCY_OPTIONS: { code: string; label: string }[] = [
    { code: 'ZMW', label: 'Zambian Kwacha (ZMW)' },
    { code: 'USD', label: 'US Dollar (USD)' },
    { code: 'EUR', label: 'Euro (EUR)' },
    { code: 'GBP', label: 'British Pound (GBP)' },
    { code: 'ZAR', label: 'South African Rand (ZAR)' },
    { code: 'KES', label: 'Kenyan Shilling (KES)' },
    { code: 'TZS', label: 'Tanzanian Shilling (TZS)' },
    { code: 'UGX', label: 'Ugandan Shilling (UGX)' },
];

/** Presets for number/currency formatting locale */
export const LOCALE_OPTIONS: { code: string; label: string }[] = [
    { code: 'en-ZM', label: 'English (Zambia)' },
    { code: 'en-US', label: 'English (United States)' },
    { code: 'en-GB', label: 'English (United Kingdom)' },
    { code: 'en-ZA', label: 'English (South Africa)' },
    { code: 'en-KE', label: 'English (Kenya)' },
    { code: 'de-DE', label: 'German (Germany)' },
    { code: 'fr-FR', label: 'French (France)' },
];

export function useFormatMoney() {
    const currencyCode = useAppStore((s) => s.currencyCode);
    const numberLocale = useAppStore((s) => s.numberLocale);
    return useMemo(
        () => (n: number) => formatMoney(n, currencyCode, numberLocale),
        [currencyCode, numberLocale]
    );
}
