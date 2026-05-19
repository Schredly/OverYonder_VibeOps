import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Construction, Plus, Filter, Sparkles } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description?: string;
}

/**
 * Polished default screen for modules that don't have full UI yet.
 * Renders the OverYonder shell (page header, filter bar, KPI strip skeleton,
 * empty state) so unfinished modules still feel coherent with the rest of the app.
 */
export default function ModulePlaceholder({
  title,
  description = "This module is being built out. The shell, navigation, and operating-mode wiring are live.",
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </>
        }
      />

      {/* KPI strip skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 h-3 w-24 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-lg border border-border bg-card p-12 shadow-sm"
      >
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Construction className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">{title} — coming soon</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            The data model, API contracts, and detail views for this module are next on
            the roadmap. For now, the route is wired and the shell renders so workflows
            can be prototyped end-to-end.
          </p>
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Request priority on this module
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
