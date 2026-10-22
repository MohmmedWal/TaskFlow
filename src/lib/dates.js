import { Timestamp } from "firebase/firestore";
import { APP_TIMEZONE } from "./constants";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date (YYYY-MM-DD) in the application timezone. */
export function todayInAppTimezone(now = new Date(), timeZone = APP_TIMEZONE) {
  const validNow = now instanceof Date ? now : new Date();
  const validTz = typeof timeZone === "string" ? timeZone : APP_TIMEZONE;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: validTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(validNow);
}

export function isValidIsoDate(value) {
  if (!value || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isoDateToTimestamp(value) {
  if (!value) return null;
  return Timestamp.fromDate(new Date(`${value}T12:00:00Z`));
}

export function timestampToIsoDate(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === "function") {
    return ts.toDate().toISOString().slice(0, 10);
  }
  if (ts instanceof Date) {
    return ts.toISOString().slice(0, 10);
  }
  if (typeof ts === "string") {
    return ts.slice(0, 10);
  }
  return null;
}

export function formatDate(ts) {
  const iso = timestampToIsoDate(ts);
  if (!iso) return "بدون تاريخ";
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${iso}T12:00:00Z`));
  } catch {
    return iso;
  }
}

/** Overdue: due date strictly before today (app timezone) and status is not done. */
export function isOverdue(task, now = new Date(), timeZone = APP_TIMEZONE) {
  if (!task || !task.dueDate || task.status === "done") return false;
  const validNow = now instanceof Date ? now : new Date();
  const validTz = typeof timeZone === "string" ? timeZone : APP_TIMEZONE;
  const due = timestampToIsoDate(task.dueDate);
  if (!due) return false;
  return due < todayInAppTimezone(validNow, validTz);
}

