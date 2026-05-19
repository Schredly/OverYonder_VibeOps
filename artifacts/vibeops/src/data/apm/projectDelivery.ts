// Project delivery health — splits each modernization project into the work
// the internal team owns and the work the consulting partner owns, and scores
// each side against schedule so leadership can see whether consultants AND
// internal teams are on track.
//
// Only workstreams that have actually started count toward a side's score —
// a not-yet-started phase (often the internal-led cutover) shouldn't read as
// "behind" when it is simply sequenced later.

import { projects, type ModernizationProject, type Workstream } from "./projects";
import { findPerson } from "./people";

export const DELIVERY_TODAY = new Date("2026-05-16");
const DAY_MS = 86_400_000;

const daysBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY_MS;

export type DeliveryStatus = "On Track" | "Watch" | "At Risk" | "Critical" | "Not Started";

export type DeliverySide = "internal" | "consultant";

export interface SideDelivery {
  side: DeliverySide;
  workstreams: Workstream[];
  startedCount: number;
  progress: number | null; // avg progress of started workstreams; null if none started
  spi: number | null; // progress / planned
  status: DeliveryStatus;
  hasBlocker: boolean;
}

export interface ProjectDelivery {
  project: ModernizationProject;
  internalLeadName: string;
  partnerFirms: string[];
  consultantNames: string[];
  plannedProgress: number;
  overallProgress: number;
  overallStatus: DeliveryStatus;
  internal: SideDelivery;
  consultant: SideDelivery;
}

function statusFromSpi(spi: number, blocked: boolean): DeliveryStatus {
  if (blocked && spi >= 0.6) return "At Risk";
  if (spi >= 0.95) return "On Track";
  if (spi >= 0.8) return "Watch";
  if (spi >= 0.6) return "At Risk";
  return "Critical";
}

function sideDelivery(
  side: DeliverySide,
  workstreams: Workstream[],
  plannedProgress: number,
  projectStarted: boolean,
): SideDelivery {
  const started = workstreams.filter((w) => w.status !== "Not Started");
  const hasBlocker = started.some((w) => w.status === "Blocked");

  if (!projectStarted || started.length === 0) {
    return {
      side,
      workstreams,
      startedCount: started.length,
      progress: null,
      spi: null,
      status: "Not Started",
      hasBlocker,
    };
  }

  const progress = Math.round(
    started.reduce((s, w) => s + w.progress, 0) / started.length,
  );
  const spi = plannedProgress > 0 ? progress / plannedProgress : 1;

  return {
    side,
    workstreams,
    startedCount: started.length,
    progress,
    spi: Math.round(spi * 100) / 100,
    status: statusFromSpi(spi, hasBlocker),
    hasBlocker,
  };
}

function computeProjectDelivery(p: ModernizationProject): ProjectDelivery {
  const start = new Date(p.startDate);
  const end = new Date(p.endDate);
  const totalDuration = Math.max(1, daysBetween(start, end));
  const elapsed = daysBetween(start, DELIVERY_TODAY);
  const projectStarted = elapsed > 0;
  const plannedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const internalWs = p.workstreams.filter(
    (w) => findPerson(w.leadId)?.type === "internal",
  );
  const consultantWs = p.workstreams.filter(
    (w) => findPerson(w.leadId)?.type === "consultant",
  );

  const overallSpi = plannedProgress > 0 ? p.progress / plannedProgress : 1;

  return {
    project: p,
    internalLeadName: findPerson(p.internalLeadId)?.name ?? p.internalLeadId,
    partnerFirms: [
      ...new Set(
        p.consultantIds
          .map((id) => findPerson(id)?.firm)
          .filter((f): f is string => Boolean(f)),
      ),
    ],
    consultantNames: p.consultantIds.map((id) => findPerson(id)?.name ?? id),
    plannedProgress: Math.round(plannedProgress),
    overallProgress: p.progress,
    overallStatus: !projectStarted ? "Not Started" : statusFromSpi(overallSpi, false),
    internal: sideDelivery("internal", internalWs, plannedProgress, projectStarted),
    consultant: sideDelivery("consultant", consultantWs, plannedProgress, projectStarted),
  };
}

export const projectDeliveries: ProjectDelivery[] = projects.map(computeProjectDelivery);

const isOffTrack = (s: DeliveryStatus) => s === "At Risk" || s === "Critical";

export interface DeliverySummary {
  activeProjects: number;
  partnerProjects: number;
  internalOffTrack: number;
  partnerOffTrack: number;
}

export const deliverySummary: DeliverySummary = {
  activeProjects: projectDeliveries.filter((d) => d.overallStatus !== "Not Started").length,
  partnerProjects: projectDeliveries.filter((d) => d.partnerFirms.length > 0).length,
  internalOffTrack: projectDeliveries.filter((d) => isOffTrack(d.internal.status)).length,
  partnerOffTrack: projectDeliveries.filter((d) => isOffTrack(d.consultant.status)).length,
};

export const deliveryStatusTone: Record<DeliveryStatus, "success" | "warning" | "danger" | "neutral"> = {
  "On Track": "success",
  Watch: "warning",
  "At Risk": "warning",
  Critical: "danger",
  "Not Started": "neutral",
};
