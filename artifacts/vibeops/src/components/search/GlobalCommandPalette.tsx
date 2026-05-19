/**
 * GlobalCommandPalette — the platform-wide command center.
 *
 * An enterprise command palette in the spirit of Linear / Superhuman: fuzzy
 * search across every record in both operating modes, grouped results, quick
 * actions, recent + pinned items, and full keyboard control. Opens on Cmd/Ctrl+K.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, CornerDownLeft, Pin, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { useGlobalSearch, matchesQuery } from "@/hooks/useGlobalSearch";
import {
  quickActions,
  searchIndexById,
  SECTION_LABEL,
  type QuickAction,
  type SearchEntry,
  type SearchTone,
} from "@/data/searchIndex";

interface GlobalCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECENT_KEY = "vibeops:cmdk:recent";
const PINNED_KEY = "vibeops:cmdk:pinned";

const tonePill: Record<SearchTone, string> = {
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-500/10 text-blue-600",
};

interface PaletteRow {
  key: string;
  kind: "entry" | "action";
  entry?: SearchEntry;
  action?: QuickAction;
}

interface PaletteSection {
  id: string;
  label: string;
  sectionTag?: string;
  rows: PaletteRow[];
}

/** A localStorage-backed list of ids (recent searches / pinned items). */
function useStoredIds(storageKey: string, cap: number) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(parsed) ? parsed.slice(0, cap) : [];
    } catch {
      return [];
    }
  });

  const persist = (next: string[]) => {
    const capped = next.slice(0, cap);
    setIds(capped);
    try {
      localStorage.setItem(storageKey, JSON.stringify(capped));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  };

  return [ids, persist] as const;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-white px-1 text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

export default function GlobalCommandPalette({ open, onOpenChange }: GlobalCommandPaletteProps) {
  const [, navigate] = useLocation();
  const { activeView, setActiveView, activeTenant } = useAppContext();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentIds, setRecentIds] = useStoredIds(RECENT_KEY, 6);
  const [pinnedIds, setPinnedIds] = useStoredIds(PINNED_KEY, 8);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { groups, total, isSearching } = useGlobalSearch(query, activeView, activeTenant.id);

  // --- Global Cmd/Ctrl+K toggle -------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // --- On open: reset, focus, lock body scroll ----------------------------
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => onOpenChange(false);

  // --- Resolve recent / pinned entries ------------------------------------
  const pinnedEntries = useMemo(
    () => pinnedIds.map((id) => searchIndexById.get(id)).filter((e): e is SearchEntry => Boolean(e)),
    [pinnedIds],
  );
  const recentEntries = useMemo(
    () =>
      recentIds
        .filter((id) => !pinnedIds.includes(id))
        .map((id) => searchIndexById.get(id))
        .filter((e): e is SearchEntry => Boolean(e)),
    [recentIds, pinnedIds],
  );

  // --- Build the rendered sections ----------------------------------------
  const matchedActions = useMemo<QuickAction[]>(() => {
    const q = query.trim();
    if (!q) return [];
    return quickActions.filter((a) =>
      matchesQuery(q, `${a.label} ${a.hint} ${a.keywords}`.toLowerCase()),
    );
  }, [query]);

  const sections = useMemo<PaletteSection[]>(() => {
    const out: PaletteSection[] = [];
    const trimmed = query.trim();

    if (!trimmed) {
      if (pinnedEntries.length) {
        out.push({
          id: "pinned",
          label: "Pinned",
          rows: pinnedEntries.map((e) => ({ key: `pin:${e.id}`, kind: "entry", entry: e })),
        });
      }
      if (recentEntries.length) {
        out.push({
          id: "recent",
          label: "Recent",
          rows: recentEntries.map((e) => ({ key: `rec:${e.id}`, kind: "entry", entry: e })),
        });
      }
      out.push({
        id: "actions",
        label: "Quick Actions",
        rows: quickActions.map((a) => ({ key: `act:${a.id}`, kind: "action", action: a })),
      });
      return out;
    }

    if (matchedActions.length) {
      out.push({
        id: "actions",
        label: "Quick Actions",
        rows: matchedActions.map((a) => ({ key: `act:${a.id}`, kind: "action", action: a })),
      });
    }
    for (const g of groups) {
      out.push({
        id: g.key,
        label: g.label,
        sectionTag: SECTION_LABEL[g.section],
        rows: g.entries.map((e) => ({ key: e.id, kind: "entry", entry: e })),
      });
    }
    return out;
  }, [query, groups, matchedActions, pinnedEntries, recentEntries]);

  const flatRows = useMemo(() => sections.flatMap((s) => s.rows), [sections]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActiveIndex((i) => (i >= flatRows.length ? 0 : i));
  }, [flatRows.length]);

  // Keep the keyboard-selected row scrolled into view.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-cmd-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const pushRecent = (id: string) => setRecentIds([id, ...recentIds.filter((x) => x !== id)]);
  const togglePin = (id: string) =>
    setPinnedIds(pinnedIds.includes(id) ? pinnedIds.filter((x) => x !== id) : [id, ...pinnedIds]);

  const runRow = (row: PaletteRow) => {
    if (row.kind === "entry" && row.entry) {
      pushRecent(row.entry.id);
      navigate(row.entry.to);
      close();
      return;
    }
    if (row.kind === "action" && row.action) {
      const action = row.action;
      if (action.type === "switch-mode") {
        const next = activeView === "enterprise" ? "consulting" : "enterprise";
        setActiveView(next);
        navigate(next === "enterprise" ? "/dashboard" : "/consulting/dashboard");
      } else if (action.to) {
        navigate(action.to);
      }
      close();
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flatRows.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(flatRows.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = flatRows[activeIndex];
      if (row) runRow(row);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  const trimmed = query.trim();
  const showEmptyState = trimmed.length > 0 && flatRows.length === 0;

  // A running counter assigns each row its flat keyboard index.
  let rowIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onMouseDown={close}
          role="presentation"
        >
          <motion.div
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-white shadow-2xl ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Global command palette"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search applications, clients, engagements, actions…"
                className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search the platform"
              />
              {isSearching && <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-primary" />}
              <Kbd>Esc</Kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[58vh] overflow-y-auto py-2">
              {showEmptyState ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No results found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nothing matches “{trimmed}”. Try a different term.
                  </p>
                </div>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="mb-1">
                    <div className="flex items-center justify-between px-4 pb-1 pt-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.label}
                      </span>
                      {section.sectionTag && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                          {section.sectionTag}
                        </span>
                      )}
                    </div>
                    {section.rows.map((row) => {
                      rowIndex += 1;
                      const index = rowIndex;
                      const active = index === activeIndex;
                      const isEntry = row.kind === "entry";
                      const entry = row.entry;
                      const action = row.action;
                      const Icon = entry?.icon ?? action?.icon ?? Search;
                      const title = entry?.title ?? action?.label ?? "";
                      const subtitle = entry?.subtitle ?? action?.hint ?? "";
                      const badge = isEntry ? entry?.kind : "Action";
                      const pinned = isEntry && entry ? pinnedIds.includes(entry.id) : false;

                      return (
                        <div
                          key={row.key}
                          data-cmd-index={index}
                          onMouseMove={() => setActiveIndex(index)}
                          onClick={() => runRow(row)}
                          className={cn(
                            "group mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors",
                            active ? "bg-muted" : "hover:bg-muted/60",
                          )}
                          role="option"
                          aria-selected={active}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                              active
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border bg-white text-muted-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-foreground">
                                {title}
                              </span>
                              {badge && (
                                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {badge}
                                </span>
                              )}
                            </div>
                            {subtitle && (
                              <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
                            )}
                          </div>

                          {isEntry && entry?.status && (
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                tonePill[entry.tone],
                              )}
                            >
                              {entry.status}
                            </span>
                          )}

                          {isEntry && entry && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(entry.id);
                              }}
                              className={cn(
                                "shrink-0 rounded-md p-1 transition-colors",
                                pinned
                                  ? "text-primary"
                                  : "text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100",
                              )}
                              aria-label={pinned ? "Unpin item" : "Pin item"}
                            >
                              <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
                            </button>
                          )}

                          {active && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd>
                    <ArrowUp className="h-3 w-3" />
                  </Kbd>
                  <Kbd>
                    <ArrowDown className="h-3 w-3" />
                  </Kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>
                    <CornerDownLeft className="h-3 w-3" />
                  </Kbd>
                  open
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>Esc</Kbd>
                  close
                </span>
              </div>
              <span>
                {trimmed
                  ? `${total + matchedActions.length} result${
                      total + matchedActions.length === 1 ? "" : "s"
                    }`
                  : "VibeOps Command Center"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
