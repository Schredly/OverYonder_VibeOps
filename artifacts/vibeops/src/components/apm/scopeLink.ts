import type { Scope, ScopeType } from "@/data/apm/risks";

/** Map a scope to the route that best shows it. */
export function scopeHref(scope: Scope): string {
  switch (scope.type) {
    case "application":
      return `/applications/${scope.id}`;
    case "project":
      return `/projects/${scope.id}`;
    case "migration":
      return "/migrations";
    case "certification":
      return "/certifications";
    case "capability":
      return "/capabilities";
    case "portfolio":
    default:
      return "/applications";
  }
}

export const scopeLabel: Record<ScopeType, string> = {
  application: "Application",
  project: "Project",
  migration: "Migration Wave",
  certification: "Certification",
  capability: "Capability",
  portfolio: "Portfolio",
};
