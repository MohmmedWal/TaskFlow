export const STATUSES = ["todo", "in_progress", "done"];
export const PRIORITIES = ["low", "medium", "high"];

export const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const LIMITS = {
  projectName: { min: 3, max: 80 },
  taskTitle: { min: 3, max: 120 },
  description: { max: 1000 },
  displayName: { min: 2, max: 60 },
  password: { min: 8 },
};

export const APP_TIMEZONE = "Asia/Hebron";

