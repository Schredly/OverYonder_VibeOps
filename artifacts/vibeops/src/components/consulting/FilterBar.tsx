import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";

interface FilterBarProps {
  searchPlaceholder?: string;
  search: string;
  onSearch: (value: string) => void;
  /** Right-side summary text, e.g. "12 records · 3 active" */
  summary?: ReactNode;
  /** Optional pills/select inputs for filtering. */
  filters?: ReactNode;
  /** Optional extra actions (export, view toggle, etc.). */
  actions?: ReactNode;
}

/**
 * Standard filter strip used at the top of every consulting list view.
 */
export default function FilterBar({
  searchPlaceholder = "Search…",
  search,
  onSearch,
  summary,
  filters,
  actions,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {filters}
        {!filters && (
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {summary && <div className="text-sm text-muted-foreground">{summary}</div>}
        {actions}
      </div>
    </div>
  );
}

/**
 * Small select used inside FilterBar.filters slots.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-white px-2 py-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
