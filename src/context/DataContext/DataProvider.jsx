import React, { useState, useEffect, useContext, useCallback } from 'react';
import DataContext from './DataContext';
import AuthContext from '../AuthContext/AuthContext';
import { db, collection, onSnapshot, query, where, orderBy } from '../../lib/firebase';
import * as projectService from '../../services/projectService';
import * as taskService from '../../services/taskService';
import * as invitationService from '../../services/invitationService';

export function DataProvider({ children }) {
  const { user } = useContext(AuthContext);

  const getCachedProjects = (uid) => {
    if (!uid) return [];
    try {
      const raw = localStorage.getItem(`taskflow_projects_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setCachedProjects = (uid, list) => {
    if (!uid) return;
    try {
      localStorage.setItem(`taskflow_projects_${uid}`, JSON.stringify(list));
    } catch {}
  };

  const getCachedTasks = (uid) => {
    if (!uid) return [];
    try {
      const raw = localStorage.getItem(`taskflow_tasks_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setCachedTasks = (uid, list) => {
    if (!uid) return;
    try {
      localStorage.setItem(`taskflow_tasks_${uid}`, JSON.stringify(list));
    } catch {}
  };

  const [projects, setProjects] = useState(() => (user ? getCachedProjects(user.uid) : []));
  const [tasks, setTasks] = useState(() => (user ? getCachedTasks(user.uid) : []));
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync cache immediately when user changes
  useEffect(() => {
    if (user) {
      setProjects(getCachedProjects(user.uid));
      setTasks(getCachedTasks(user.uid));
      setLoading(false);
    } else {
      setProjects([]);
      setTasks([]);
      setInvitations([]);
      setLoading(false);
    }
  }, [user?.uid]);

  // 1. Live subscription to pending invitations for current user
  useEffect(() => {
    if (!user) {
      setInvitations([]);
      return;
    }

    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, 'invitations'),
        where('targetUid', '==', user.uid),
        where('status', '==', 'pending')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          list.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          setInvitations(list);
        },
        (error) => {
          console.warn('Invitations live sync notice (fallback to local):', error.message);
        }
      );
    } catch (err) {
      console.warn('Invitations query init notice:', err.message);
    }

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Live subscription to projects where user is a member
  useEffect(() => {
    if (!user) return;

    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, 'projects'),
        where('memberIds', 'array-contains', user.uid)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedProjects = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          fetchedProjects.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          setProjects(fetchedProjects);
          setCachedProjects(user.uid, fetchedProjects);
          setLoading(false);
        },
        (error) => {
          console.warn('Projects live sync notice (maintaining active local workspace):', error.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Projects query init notice:', err.message);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [user?.uid]);

  // 3. Live subscription to tasks across all accessible projects
  useEffect(() => {
    if (!user || projects.length === 0) return;

    const unsubscribers = [];
    const tasksByProject = {};

    projects.forEach((proj) => {
      try {
        const tasksRef = collection(db, 'projects', proj.id, 'tasks');
        const q = query(tasksRef, orderBy('createdAt', 'desc'));

        const unsub = onSnapshot(
          q,
          (snapshot) => {
            tasksByProject[proj.id] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              projectId: proj.id,
              projectName: proj.name,
              ...docSnap.data(),
            }));
            const allTasks = Object.values(tasksByProject).flat();
            setTasks(allTasks);
            setCachedTasks(user.uid, allTasks);
          },
          (error) => {
            console.warn(`Tasks live sync notice for project ${proj.id}:`, error.message);
          }
        );
        unsubscribers.push(unsub);
      } catch (err) {
        console.warn(`Tasks query init notice for ${proj.id}:`, err.message);
      }
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user?.uid, projects.map((p) => p.id).sort().join(',')]);

  // Project operations (Hybrid Firestore + Local Workspace)
  const addProject = async (projectData) => {
    if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

    let newId = `proj_${Date.now()}`;
    try {
      const cloudId = await projectService.createProject(user, projectData);
      if (cloudId) newId = cloudId;
    } catch (err) {
      console.warn('Firestore createProject notice (stored in local workspace):', err.message);
    }

    const newProject = {
      id: newId,
      name: projectData.name.trim(),
      description: (projectData.description || '').trim(),
      ownerId: user.uid,
      memberIds: [user.uid],
      createdAt: { toMillis: () => Date.now() },
      updatedAt: { toMillis: () => Date.now() },
    };

    setProjects((prev) => {
      const updated = [newProject, ...prev.filter((p) => p.id !== newId)];
      setCachedProjects(user.uid, updated);
      return updated;
    });

    return newId;
  };

  const updateProject = async (projectId, projectData) => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              name: projectData.name?.trim() || p.name,
              description: projectData.description?.trim() || p.description,
              updatedAt: { toMillis: () => Date.now() },
            }
          : p
      );
      setCachedProjects(user?.uid, updated);
      return updated;
    });

    try {
      const project = projects.find((p) => p.id === projectId);
      await projectService.updateProject(user, project, projectData);
    } catch (err) {
      console.warn('Firestore updateProject notice:', err.message);
    }
  };

  const deleteProject = async (projectId) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      setCachedProjects(user?.uid, updated);
      return updated;
    });

    setTasks((prev) => {
      const updated = prev.filter((t) => t.projectId !== projectId);
      setCachedTasks(user?.uid, updated);
      return updated;
    });

    try {
      const project = projects.find((p) => p.id === projectId);
      await projectService.deleteProject(user, project);
    } catch (err) {
      console.warn('Firestore deleteProject notice:', err.message);
    }
  };

  const addMemberByEmail = async (projectId, email) => {
    const project = projects.find((p) => p.id === projectId);
    return await projectService.addMemberByEmail(user, project, email);
  };

  const removeMember = async (projectId, memberUid) => {
    const project = projects.find((p) => p.id === projectId);
    return await projectService.removeMember(user, project, memberUid);
  };

  const fetchProjectMembers = useCallback(async (projectId) => {
    try {
      return await projectService.fetchProjectMembers(projectId);
    } catch {
      return [];
    }
  }, []);

  // Project Invitation operations
  const sendProjectInvitation = async (projectId, email) => {
    const project = projects.find((p) => p.id === projectId);
    return await invitationService.sendProjectInvitation(user, project, email);
  };

  const acceptInvitation = async (invitation) => {
    const result = await invitationService.acceptInvitation(user, invitation);
    // Add joined project to user workspace
    if (invitation?.projectId) {
      const joinedProject = {
        id: invitation.projectId,
        name: invitation.projectName || 'مشروع جديد',
        ownerId: invitation.inviterUid || 'owner',
        memberIds: [invitation.inviterUid, user.uid],
        createdAt: { toMillis: () => Date.now() },
        updatedAt: { toMillis: () => Date.now() },
      };
      setProjects((prev) => {
        const updated = [joinedProject, ...prev.filter((p) => p.id !== invitation.projectId)];
        setCachedProjects(user.uid, updated);
        return updated;
      });
    }
    return result;
  };

  const declineInvitation = async (invitation) => {
    return await invitationService.declineInvitation(user, invitation);
  };

  const cancelInvitation = async (invitationId) => {
    return await invitationService.cancelInvitation(user, invitationId);
  };

  const fetchProjectPendingInvitations = useCallback(async (projectId) => {
    try {
      return await invitationService.fetchProjectPendingInvitations(projectId);
    } catch {
      return [];
    }
  }, []);

  // Task operations (Hybrid Firestore + Local Workspace)
  const addTask = async (taskData) => {
    if (!user) throw new Error('يجب تسجيل الدخول أولاً.');

    let newTaskId = `task_${Date.now()}`;
    try {
      const cloudTaskId = await taskService.createTask(user, taskData);
      if (cloudTaskId) newTaskId = cloudTaskId;
    } catch (err) {
      console.warn('Firestore addTask notice (stored in local workspace):', err.message);
    }

    const targetProject = projects.find((p) => p.id === taskData.projectId);
    const newTask = {
      id: newTaskId,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      projectId: taskData.projectId,
      projectName: targetProject?.name || 'مشروع',
      createdBy: user.uid,
      assigneeId: taskData.assigneeId || user.uid,
      assigneeName: taskData.assigneeName || user.displayName || 'أنا',
      createdAt: { toMillis: () => Date.now() },
      updatedAt: { toMillis: () => Date.now() },
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev.filter((t) => t.id !== newTaskId)];
      setCachedTasks(user.uid, updated);
      return updated;
    });

    return newTaskId;
  };

  const updateTask = async (projectId, taskId, taskData) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...taskData,
              updatedAt: { toMillis: () => Date.now() },
            }
          : t
      );
      setCachedTasks(user?.uid, updated);
      return updated;
    });

    try {
      await taskService.updateTask(user, projectId, taskId, taskData);
    } catch (err) {
      console.warn('Firestore updateTask notice:', err.message);
    }
  };

  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              updatedAt: { toMillis: () => Date.now() },
            }
          : t
      );
      setCachedTasks(user?.uid, updated);
      return updated;
    });

    try {
      await taskService.updateTaskStatus(user, projectId, taskId, newStatus);
    } catch (err) {
      console.warn('Firestore updateTaskStatus notice:', err.message);
    }
  };

  const deleteTask = async (projectId, taskId) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      setCachedTasks(user?.uid, updated);
      return updated;
    });

    try {
      await taskService.deleteTask(user, projectId, taskId);
    } catch (err) {
      console.warn('Firestore deleteTask notice:', err.message);
    }
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        tasks,
        invitations,
        loading,
        addProject,
        updateProject,
        deleteProject,
        addMemberByEmail,
        sendProjectInvitation,
        acceptInvitation,
        declineInvitation,
        cancelInvitation,
        fetchProjectPendingInvitations,
        removeMember,
        fetchProjectMembers,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
export default DataProvider;
