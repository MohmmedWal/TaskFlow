import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from '../lib/firebase';
import { validateProject, validateEmail, hasErrors } from '../lib/validation';
import { guardedWrite } from '../lib/errors';

/**
 * Creates a new project in Firestore and registers the owner as a member.
 */
export async function createProject(user, projectData) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

  const errors = validateProject(projectData);
  if (hasErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  const projectRef = doc(collection(db, 'projects'));
  const userEmail = (user.email || '').toLowerCase();
  const userDisplayName = user.displayName || userEmail.split('@')[0] || 'مستخدم';

  await guardedWrite(async () => {
    const batch = writeBatch(db);

    batch.set(projectRef, {
      name: projectData.name.trim(),
      description: (projectData.description || '').trim(),
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const memberRef = doc(db, 'projects', projectRef.id, 'members', user.uid);
    batch.set(memberRef, {
      displayName: userDisplayName,
      email: userEmail,
    });

    await batch.commit();
  });

  return projectRef.id;
}

/**
 * Updates project name and description (Owner only).
 */
export async function updateProject(user, project, projectData) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  if (!project || project.ownerId !== user.uid) {
    throw new Error('فقط مالك المشروع يحق له تعديله.');
  }

  const errors = validateProject(projectData);
  if (hasErrors(errors)) {
    throw new Error(Object.values(errors)[0]);
  }

  await guardedWrite(async () => {
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, {
      name: projectData.name.trim(),
      description: (projectData.description || '').trim(),
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Deletes a project along with its tasks and members subcollections (Owner only).
 */
export async function deleteProject(user, project) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  if (!project || project.ownerId !== user.uid) {
    throw new Error('فقط مالك المشروع يحق له حذفه.');
  }

  await guardedWrite(async () => {
    // 1. Delete tasks subcollection
    const tasksSnap = await getDocs(collection(db, 'projects', project.id, 'tasks'));
    if (tasksSnap.docs.length > 0) {
      const batch1 = writeBatch(db);
      tasksSnap.docs.forEach((d) => batch1.delete(d.ref));
      await batch1.commit();
    }

    // 2. Delete members subcollection
    const membersSnap = await getDocs(collection(db, 'projects', project.id, 'members'));
    if (membersSnap.docs.length > 0) {
      const batch2 = writeBatch(db);
      membersSnap.docs.forEach((d) => batch2.delete(d.ref));
      await batch2.commit();
    }

    // 3. Delete parent project document
    await deleteDoc(doc(db, 'projects', project.id));
  });
}

/**
 * Adds an existing registered user to project members by email.
 */
export async function addMemberByEmail(user, project, rawEmail) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  const email = (rawEmail || '').trim().toLowerCase();

  const emailErr = validateEmail(email);
  if (emailErr) throw new Error(emailErr);

  if (!project || project.ownerId !== user.uid) {
    throw new Error('فقط مالك المشروع يمكنه إضافة أعضاء.');
  }

  return await guardedWrite(async () => {
    const lookup = await getDoc(doc(db, 'userEmails', email));
    if (!lookup.exists()) {
      throw new Error('لا يوجد مستخدم مسجل بهذا البريد الإلكتروني.');
    }

    const { uid: targetUid, displayName: targetName } = lookup.data();

    if (project.memberIds && project.memberIds.includes(targetUid)) {
      throw new Error('هذا المستخدم عضو في المشروع بالفعل.');
    }

    const batch = writeBatch(db);
    batch.update(doc(db, 'projects', project.id), {
      memberIds: arrayUnion(targetUid),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'projects', project.id, 'members', targetUid), {
      displayName: targetName,
      email: email,
    });

    await batch.commit();
    return { uid: targetUid, displayName: targetName, email };
  });
}

/**
 * Removes a member from a project and unassigns their tasks.
 */
export async function removeMember(user, project, memberUid) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

  if (!project || project.ownerId !== user.uid) {
    throw new Error('فقط مالك المشروع يمكنه إزالة أعضاء.');
  }

  if (memberUid === project.ownerId) {
    throw new Error('لا يمكن إزالة مالك المشروع من مشروعه.');
  }

  await guardedWrite(async () => {
    const assignedTasks = await getDocs(
      collection(db, 'projects', project.id, 'tasks')
    );

    const tasksToUnassign = assignedTasks.docs.filter(
      (d) => d.data().assigneeId === memberUid
    );

    if (tasksToUnassign.length > 0) {
      const taskBatch = writeBatch(db);
      tasksToUnassign.forEach((d) => {
        taskBatch.update(d.ref, { assigneeId: null, updatedAt: serverTimestamp() });
      });
      await taskBatch.commit();
    }

    const batch = writeBatch(db);
    batch.update(doc(db, 'projects', project.id), {
      memberIds: arrayRemove(memberUid),
      updatedAt: serverTimestamp(),
    });
    batch.delete(doc(db, 'projects', project.id, 'members', memberUid));
    await batch.commit();
  });
}

/**
 * Fetches members of a project from subcollection.
 */
export async function fetchProjectMembers(projectId) {
  if (!projectId) return [];
  try {
    const snap = await getDocs(collection(db, 'projects', projectId, 'members'));
    return snap.docs.map((d) => ({
      id: d.id,
      uid: d.id,
      ...d.data(),
    }));
  } catch (err) {
    console.error('Error fetching project members:', err);
    return [];
  }
}

