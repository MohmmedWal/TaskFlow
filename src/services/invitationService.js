import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  arrayUnion,
  serverTimestamp,
} from '../lib/firebase';
import { validateEmail } from '../lib/validation';
import { guardedWrite } from '../lib/errors';

/**
 * Sends a project invitation to a registered user by email.
 * The user is NOT added to project.memberIds until they accept the invitation.
 */
export async function sendProjectInvitation(user, project, rawEmail) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  const email = (rawEmail || '').trim().toLowerCase();

  const emailErr = validateEmail(email);
  if (emailErr) throw new Error(emailErr);

  if (!project || project.ownerId !== user.uid) {
    throw new Error('فقط مالك المشروع يمكنه دعوة أعضاء.');
  }

  return await guardedWrite(async () => {
    // 1. Verify user exists in Firestore
    const lookup = await getDoc(doc(db, 'userEmails', email));
    if (!lookup.exists()) {
      throw new Error('لا يوجد مستخدم مسجل بهذا البريد الإلكتروني في النظام.');
    }

    const { uid: targetUid, displayName: targetName } = lookup.data();

    // 2. Cannot invite yourself
    if (targetUid === user.uid) {
      throw new Error('لا يمكنك إرسال دعوة لنفسك.');
    }

    // 3. Check if already an active member
    if (project.memberIds && project.memberIds.includes(targetUid)) {
      throw new Error('هذا المستخدم عضو في هذا المشروع بالفعل.');
    }

    // 4. Check if there is already a pending invitation
    const pendingQuery = query(
      collection(db, 'invitations'),
      where('projectId', '==', project.id),
      where('targetUid', '==', targetUid),
      where('status', '==', 'pending')
    );
    const existingSnap = await getDocs(pendingQuery);
    if (!existingSnap.empty) {
      throw new Error('تم إرسال دعوة انضمام لهذا المستخدم مسبقاً وهي بانتظار موافقته.');
    }

    // 5. Create new pending invitation
    const invRef = doc(collection(db, 'invitations'));
    const invitationData = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description || '',
      ownerId: user.uid,
      ownerName: user.displayName || user.email.split('@')[0],
      ownerEmail: user.email,
      targetUid: targetUid,
      targetName: targetName || email.split('@')[0],
      targetEmail: email,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await setDoc(invRef, invitationData);

    return {
      id: invRef.id,
      ...invitationData,
    };
  });
}

/**
 * Accepts a pending project invitation:
 * - Updates invitation status to 'accepted'
 * - Adds user.uid to project.memberIds
 * - Adds user document to projects/members subcollection
 */
export async function acceptInvitation(user, invitation) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  if (invitation.targetUid !== user.uid) {
    throw new Error('هذه الدعوة ليست موجهة إليك.');
  }

  return await guardedWrite(async () => {
    const batch = writeBatch(db);

    // 1. Mark invitation as accepted
    const invRef = doc(db, 'invitations', invitation.id);
    batch.update(invRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });

    // 2. Add user to project's memberIds
    const projectRef = doc(db, 'projects', invitation.projectId);
    batch.update(projectRef, {
      memberIds: arrayUnion(user.uid),
      updatedAt: serverTimestamp(),
    });

    // 3. Add user document in projects/members subcollection
    const memberRef = doc(db, 'projects', invitation.projectId, 'members', user.uid);
    batch.set(memberRef, {
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'عضو جديد'),
      email: user.email ? user.email.toLowerCase() : '',
      joinedAt: serverTimestamp(),
    });

    await batch.commit();
    return true;
  });
}

/**
 * Declines a pending project invitation.
 */
export async function declineInvitation(user, invitation) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
  if (invitation.targetUid !== user.uid) {
    throw new Error('هذه الدعوة ليست موجهة إليك.');
  }

  return await guardedWrite(async () => {
    const invRef = doc(db, 'invitations', invitation.id);
    await updateDoc(invRef, {
      status: 'declined',
      declinedAt: serverTimestamp(),
    });
    return true;
  });
}

/**
 * Cancels a pending invitation (Owner only).
 */
export async function cancelInvitation(user, invitationId) {
  if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

  return await guardedWrite(async () => {
    const invRef = doc(db, 'invitations', invitationId);
    await deleteDoc(invRef);
    return true;
  });
}

/**
 * Fetches all pending invitations for a specific project.
 */
export async function fetchProjectPendingInvitations(projectId) {
  if (!projectId) return [];
  try {
    const q = query(
      collection(db, 'invitations'),
      where('projectId', '==', projectId),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (err) {
    console.error('Error fetching project pending invitations:', err);
    return [];
  }
}

