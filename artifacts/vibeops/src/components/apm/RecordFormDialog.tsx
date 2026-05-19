import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  /** Span both columns. */
  full?: boolean;
}

interface RecordFormDialogProps {
  title: string;
  description?: string;
  fields: FormField[];
  /** Pre-filled values keyed by field name — present when editing. */
  initialValues?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
  /** Uncontrolled use: pass a trigger. Controlled use: pass open + onOpenChange. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/**
 * Field-config-driven modal used for both creating and editing APM records.
 * Submitting hands raw string values back to the caller, which maps them onto
 * the entity and calls the matching ApmDataContext collection mutator.
 */
export default function RecordFormDialog({
  title,
  description,
  fields,
  initialValues,
  submitLabel = "Save",
  onSubmit,
  trigger,
  open,
  onOpenChange,
}: RecordFormDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInternalOpen(v));

  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});

  // Reset the form to the latest initial values each time the dialog opens.
  useEffect(() => {
    if (isOpen) setValues(initialValues ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          {fields.map((field) => {
            const value = values[field.name] ?? "";
            return (
              <label
                key={field.name}
                className={`space-y-1.5 text-sm ${field.full || field.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <div className="flex items-center gap-1 text-foreground">
                  <span>{field.label}</span>
                  {field.required && <span className="text-destructive">*</span>}
                </div>
                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={inputClass}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={value}
                    required={field.required}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {field.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={value}
                    required={field.required}
                    placeholder={field.placeholder}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={inputClass}
                  />
                )}
              </label>
            );
          })}

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
