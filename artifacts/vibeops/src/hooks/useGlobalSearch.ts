/**
 * Fuzzy global search over the command-palette index.
 *
 * Input is debounced, every result is fuzzy-scored, and matches are bucketed
 * into ordered groups (active operating mode surfaced first). Pure local data
 * — fast enough to feel instant.
 */
import { useEffect, useMemo, useState } from "react";
import {
  searchIndex,
  GROUP_ORDER,
  SECTION_ORDER_ENTERPRISE,
  SECTION_ORDER_CONSULTING,
  type SearchEntry,
  type SearchSection,
} from "@/data/searchIndex";

const DEBOUNCE_MS = 90;
const MAX_PER_GROUP = 6;

export interface SearchResultGroup {
  key: string;
  section: SearchSection;
  label: string;
  entries: SearchEntry[];
}

/**
 * Score a single query token against a text field. Returns 0 for no match,
 * higher is better. Prefers contiguous substring hits at word boundaries,
 * falls back to an in-order subsequence match.
 */
export function fuzzyScore(token: string, text: string): number {
  if (!token) return 0;
  if (!text) return 0;

  const idx = text.indexOf(token);
  if (idx !== -1) {
    let score = 1000 - idx * 4 - (text.length - token.length);
    const boundary = idx === 0 || /[\s\-_/·.,()]/.test(text[idx - 1]);
    if (boundary) score += 450;
    return Math.max(score, 1);
  }

  // Subsequence fallback — every token char appears in order.
  let ti = 0;
  let qi = 0;
  let runs = 0;
  let prev = -2;
  while (ti < text.length && qi < token.length) {
    if (text[ti] === token[qi]) {
      if (ti === prev + 1) runs += 1;
      prev = ti;
      qi += 1;
    }
    ti += 1;
  }
  if (qi < token.length) return 0;
  return Math.max(280 + runs * 14 - Math.round(text.length * 0.2), 1);
}

/** True when every token fuzzy-matches somewhere in the haystack. */
export function matchesQuery(query: string, haystack: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((t) => fuzzyScore(t, haystack) > 0);
}

interface PreparedEntry {
  entry: SearchEntry;
  title: string;
  subtitle: string;
  status: string;
}

export function useGlobalSearch(
  query: string,
  activeView: "enterprise" | "consulting",
  activeTenantId: string,
) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // Lowercased fields, computed once — the index itself never changes.
  const prepared = useMemo<PreparedEntry[]>(
    () =>
      searchIndex.map((entry) => ({
        entry,
        title: entry.title.toLowerCase(),
        subtitle: entry.subtitle.toLowerCase(),
        status: (entry.status ?? "").toLowerCase(),
      })),
    [],
  );

  const { groups, total } = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return { groups: [] as SearchResultGroup[], total: 0 };

    const tokens = q.split(/\s+/).filter(Boolean);
    const scored: { entry: SearchEntry; score: number }[] = [];

    for (const p of prepared) {
      // Tenant scoping — shared records (no tenantId) stay visible to all.
      if (p.entry.tenantId && p.entry.tenantId !== activeTenantId) continue;
      let sum = 0;
      let matched = true;
      for (const tok of tokens) {
        const best = Math.max(
          fuzzyScore(tok, p.title) * 1,
          fuzzyScore(tok, p.subtitle) * 0.55,
          fuzzyScore(tok, p.status) * 0.5,
          fuzzyScore(tok, p.entry.keywords) * 0.4,
        );
        if (best <= 0) {
          matched = false;
          break;
        }
        sum += best;
      }
      if (matched) scored.push({ entry: p.entry, score: sum });
    }

    scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

    const bucket = new Map<string, SearchEntry[]>();
    for (const { entry } of scored) {
      const key = `${entry.section}:${entry.group}`;
      const arr = bucket.get(key) ?? [];
      if (arr.length < MAX_PER_GROUP) arr.push(entry);
      bucket.set(key, arr);
    }

    const sectionOrder =
      activeView === "enterprise" ? SECTION_ORDER_ENTERPRISE : SECTION_ORDER_CONSULTING;
    const out: SearchResultGroup[] = [];
    let count = 0;
    for (const section of sectionOrder) {
      for (const group of GROUP_ORDER[section]) {
        const entries = bucket.get(`${section}:${group}`);
        if (entries && entries.length) {
          out.push({ key: `${section}:${group}`, section, label: group, entries });
          count += entries.length;
        }
      }
    }
    return { groups: out, total: count };
  }, [debounced, prepared, activeView, activeTenantId]);

  return {
    debouncedQuery: debounced,
    isSearching: query.trim() !== debounced.trim(),
    groups,
    total,
  };
}
