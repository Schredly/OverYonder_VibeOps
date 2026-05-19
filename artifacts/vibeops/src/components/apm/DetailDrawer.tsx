import { useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DetailField {
  label: string;
  value: ReactNode;
  /** Span the full row instead of the 2-column grid. */
  full?: boolean;
}

export interface DetailSection {
  heading?: string;
  fields: DetailField[];
}

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  sections: DetailSection[];
  /** Extra content (linked records, lists) rendered below the sections. */
  children?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  entityKind?: string;
}

/**
 * Slide-over panel that shows every field of a record, with Edit / Delete
 * actions. The lightweight detail view for APM entities that don't warrant a
 * dedicated routed page.
 */
export default function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  badges,
  sections,
  children,
  onEdit,
  onDelete,
  entityKind = "record",
}: DetailDrawerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border p-6 text-left">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
          {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        </SheetHeader>

        <div className="flex-1 space-y-6 p-6">
          {sections.map((section, i) => (
            <div key={section.heading ?? i}>
              {section.heading && (
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.heading}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {section.fields.map((field) => (
                  <div key={field.label} className={`space-y-0.5 ${field.full ? "col-span-2" : ""}`}>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{field.label}</dt>
                    <dd className="font-medium text-foreground">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {children}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onEdit}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        )}
      </SheetContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {entityKind}?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{title}</span> will be permanently
              removed from this session. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                onOpenChange(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
