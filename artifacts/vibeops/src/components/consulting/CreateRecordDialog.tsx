import { useState, type ReactNode } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "select" | "textarea" | "number";
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
}

interface CreateRecordDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  fields: FieldDef[];
  submitLabel?: string;
  /** Toast message on submit. Form values are passed in for templating. */
  onSubmit?: (values: Record<string, string>) => void;
}

/**
 * Generic create-record modal used for "New X" actions in consulting modules
 * that don't yet have their own canonical create flow. Submitting toasts a
 * confirmation — actual persistence is wired per-module as those flows mature.
 */
export default function CreateRecordDialog({
  trigger,
  title,
  description,
  fields,
  submitLabel = "Create",
  onSubmit,
}: CreateRecordDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const update = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    toast({
      title: `${title.replace(/^New\s+/, "")} created`,
      description: "Saved locally to your session. Backing API is wired up next.",
    });
    setValues({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          {fields.map((f) => (
            <label
              key={f.name}
              className={`space-y-1.5 text-sm ${f.type === "textarea" ? "md:col-span-2" : ""}`}
            >
              <span className="flex items-center gap-1 text-foreground">
                {f.label}
                {f.required && <span className="text-destructive">*</span>}
              </span>
              {f.type === "select" ? (
                <select
                  required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  required={f.required}
                  type={f.type === "number" ? "number" : "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => update(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              )}
            </label>
          ))}

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

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
