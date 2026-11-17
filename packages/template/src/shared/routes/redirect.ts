/**
 * Returns `target` only when it is a same-origin absolute path, so a crafted
 * `?redirectTo=https://evil.example` cannot turn login into an open redirect.
 */
export const getSafeRedirect = (target: string | null | undefined, fallback: string): string =>
  target?.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
    ? target
    : fallback
