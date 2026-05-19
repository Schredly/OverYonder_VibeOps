/**
 * Tenant control-plane persistence.
 *
 * Persists the operator's session across reloads: the active tenant, the
 * previously active tenant (for quick "switch back"), and the preferred
 * operating mode. All access is guarded — storage may be unavailable.
 */
const KEYS = {
  activeTenant: "vibeops:tenant:active",
  lastTenant: "vibeops:tenant:last",
  preferredMode: "vibeops:mode:preferred",
} as const;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — session-only */
  }
}

export function loadActiveTenantId(): string | null {
  return read(KEYS.activeTenant);
}

export function loadLastTenantId(): string | null {
  return read(KEYS.lastTenant);
}

/** Record the new active tenant, demoting the current one to "last". */
export function persistActiveTenant(nextId: string, previousId: string | null): void {
  if (previousId && previousId !== nextId) write(KEYS.lastTenant, previousId);
  write(KEYS.activeTenant, nextId);
}

export function loadPreferredMode(): "enterprise" | "consulting" | null {
  const value = read(KEYS.preferredMode);
  return value === "enterprise" || value === "consulting" ? value : null;
}

export function persistPreferredMode(mode: "enterprise" | "consulting"): void {
  write(KEYS.preferredMode, mode);
}
