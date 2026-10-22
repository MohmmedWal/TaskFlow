import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '../lib/firebase';
import { isoDateToTimestamp } from '../lib/dates';
import { validateTask, hasErrors } from '../lib/validation';
import { guardedWrite } from '../lib/errors';

/**
 * Creates a new task inside a project subcollection (projects/{pid}/tasks).
 */
export async function createTask(user, taskData) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  if (!taskData.projectId) throw new Error('يجب تحديد المشروع التابع له المهمة.');

  const errors = validateTask({
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    dueDate: taskData.dueDate || null,
  });
  if (hasErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  const taskPayload = {
    title: taskData.title.trim(),
    description: (taskData.description || '').trim(),
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    assigneeId: taskData.assigneeId || null,
    createdBy: user.uid,
    dueDate: taskData.dueDate ? isoDateToTimestamp(taskData.dueDate) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return await guardedWrite(async () => {
    const docRef = await addDoc(
      collection(db, 'projects', taskData.projectId, 'tasks'),
      taskPayload
    );
    return docRef.id;
  });
}

/**
 * Updates an existing task in a project.
 */
export async function updateTask(user, projectId, taskId, taskData) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

  const errors = validateTask({
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate || null,
  });
  if (hasErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  await guardedWrite(async () => {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      status: taskData.status,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId || null,
      dueDate: taskData.dueDate ? isoDateToTimestamp(taskData.dueDate) : null,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Updates only the status of a task.
 */
export async function updateTaskStatus(user, projectId, taskId, newStatus) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  await guardedWrite(async () => {
    const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Deletes a task from its project.
 */
export async function deleteTask(user, projectId, taskId) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  await guardedWrite(async () => {
    await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
  });
}

