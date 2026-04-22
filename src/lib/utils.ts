import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── API error parser ─────────────────────────────────────────────────────────
// Converts raw ASP.NET / Identity error responses into friendly plain-English
// messages. Falls back to a sensible default if nothing can be extracted.

const IDENTITY_REWRITES: [RegExp, string][] = [
    [/username '.+' is already taken/i, 'This phone number is already registered. Try signing in instead.'],
    [/email '.+' is already taken/i, 'This email is already registered. Try signing in instead.'],
    [/passwords must have at least one (uppercase|non alphanumeric|digit)/i, 'Password must include uppercase letters, numbers, and symbols.'],
    [/password.*too short/i, 'Password is too short. Use at least 8 characters.'],
    [/invalid.*phone/i, 'The phone number format is invalid.'],
    [/property does not exist/i, 'This property could not be found or you do not have access.'],
    [/user.*not found/i, 'No account was found with those details.'],
    [/invalid.*credentials/i, 'Incorrect phone number or password.'],
    [/access denied/i, 'You do not have permission to perform this action.'],
]

export function parseApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
    if (!err || typeof err !== 'object') return fallback

    // Axios error shape: err.response.data
    const data = (err as any)?.response?.data ?? (err as any)?.data ?? err

    // Extract raw messages — try all common shapes
    const rawMessages: string[] = []

    // { Errors: { GeneralErrors: [...], ... } }
    const errorsObj = data?.Errors ?? data?.errors
    if (errorsObj && typeof errorsObj === 'object') {
        for (const msgs of Object.values(errorsObj)) {
            if (Array.isArray(msgs)) rawMessages.push(...msgs.map(String))
            else if (typeof msgs === 'string') rawMessages.push(msgs)
        }
    }

    // { Message: "..." }
    const topMsg = data?.Message ?? data?.message
    if (typeof topMsg === 'string' && topMsg.toLowerCase() !== 'one or more errors occurred!') {
        rawMessages.push(topMsg)
    }

    // Plain string body
    if (typeof data === 'string' && data.length < 300) rawMessages.push(data)

    // Try to map any raw message to a friendly string
    for (const raw of rawMessages) {
        for (const [pattern, friendly] of IDENTITY_REWRITES) {
            if (pattern.test(raw)) return friendly
        }
    }

    // Return the first raw message if it looks human-readable (no stack traces)
    const first = rawMessages.find(m => m.length > 0 && m.length < 200 && !m.includes('at '))
    return first ?? fallback
}
