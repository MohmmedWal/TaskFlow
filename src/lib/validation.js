import { LIMITS, PRIORITIES, STATUSES } from "./constants";
import { isValidIsoDate } from "./dates";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email) {
  if (!email || !EMAIL.test(email.trim())) {
    return "يرجى إدخال بريد إلكتروني صالح.";
  }
  return null;
}

export function validateRegistration(input) {
  const errors = {};
  const name = (input.displayName || "").trim();
  if (name.length < LIMITS.displayName.min || name.length > LIMITS.displayName.max) {
    errors.displayName = `الاسم يجب أن يكون بين ${LIMITS.displayName.min} و ${LIMITS.displayName.max} حرفاً.`;
  }
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  if (!input.password || input.password.length < LIMITS.password.min) {
    errors.password = `كلمة المرور يجب ألا تقل عن ${LIMITS.password.min} أحرف.`;
  }
  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    errors.confirmPassword = "كلمات المرور غير متطابقة.";
  }
  return errors;
}

export function validateLogin(input) {
  const errors = {};
  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;
  if (!input.password) errors.password = "يرجى إدخال كلمة المرور.";
  return errors;
}

export function validateProject(input) {
  const errors = {};
  const name = (input.name || "").trim();
  if (name.length < LIMITS.projectName.min || name.length > LIMITS.projectName.max) {
    errors.name = `اسم المشروع يجب أن يكون بين ${LIMITS.projectName.min} و ${LIMITS.projectName.max} حرفاً.`;
  }
  const desc = (input.description || "").trim();
  if (desc.length > LIMITS.description.max) {
    errors.description = `الوصف لا يجب أن يتجاوز ${LIMITS.description.max} حرف.`;
  }
  return errors;
}

export function validateTask(input) {
  const errors = {};
  const title = (input.title || "").trim();
  if (title.length < LIMITS.taskTitle.min || title.length > LIMITS.taskTitle.max) {
    errors.title = `عنوان المهمة يجب أن يكون بين ${LIMITS.taskTitle.min} و ${LIMITS.taskTitle.max} حرفاً.`;
  }
  const desc = (input.description || "").trim();
  if (desc.length > LIMITS.description.max) {
    errors.description = `الوصف لا يجب أن يتجاوز ${LIMITS.description.max} حرف.`;
  }
  if (!STATUSES.includes(input.status)) {
    errors.status = "يرجى اختيار حالة صالحة للمهمة.";
  }
  if (!PRIORITIES.includes(input.priority)) {
    errors.priority = "يرجى اختيار أولوية صالحة للمهمة.";
  }
  if (input.dueDate && !isValidIsoDate(input.dueDate)) {
    errors.dueDate = "يرجى إدخال تاريخ صالح.";
  }
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
