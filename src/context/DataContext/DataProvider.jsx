import React, { useState, useEffect, useContext, useCallback } from 'react';
import DataContext from './DataContext';
import AuthContext from '../AuthContext/AuthContext';
import { db, collection, onSnapshot, query, where, orderBy } from '../../lib/firebase';
import * as projectService from '../../services/projectService';
import * as taskService from '../../services/taskService';
import * as invitationService from '../../services/invitationService';

export function DataProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Live subscription to pending invitations for current user
  useEffect(() => {
    if (!user) {
      setInvitations([]);
      return;
    }

    const q = query(
      collection(db, 'invitations'),
      where('targetUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
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
        console.error('Error fetching user invitations snapshot:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Live subscription to projects where user is a member
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('memberIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
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
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching projects snapshot:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Live subscription to tasks across all accessible projects
  useEffect(() => {
    if (!user || projects.length === 0) {
      setTasks([]);
      return;
    }

    const unsubscribers = [];
    const tasksByProject = {};

    projects.forEach((proj) => {
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
        },
        (error) => {
          console.error(`Error fetching tasks for project ${proj.id}:`, error);
        }
      );
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user, projects.map((p) => p.id).sort().join(',')]);

  // Project operations (delegated to projectService)
  const addProject = async (projectData) => {
    return await projectService.createProject(user, projectData);
  };

  const updateProject = async (projectId, projectData) => {
    const project = projects.find((p) => p.id === projectId);
    return await projectService.updateProject(user, project, projectData);
  };

  const deleteProject = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return await projectService.deleteProject(user, project);
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
    return await projectService.fetchProjectMembers(projectId);
  }, []);

  // Project Invitation operations (delegated to invitationService)
  const sendProjectInvitation = async (projectId, email) => {
    const project = projects.find((p) => p.id === projectId);
    return await invitationService.sendProjectInvitation(user, project, email);
  };

  const acceptInvitation = async (invitation) => {
    return await invitationService.acceptInvitation(user, invitation);
  };

  const declineInvitation = async (invitation) => {
    return await invitationService.declineInvitation(user, invitation);
  };

  const cancelInvitation = async (invitationId) => {
    return await invitationService.cancelInvitation(user, invitationId);
  };

  const fetchProjectPendingInvitations = useCallback(async (projectId) => {
    return await invitationService.fetchProjectPendingInvitations(projectId);
  }, []);

  // Task operations (delegated to taskService)
  const addTask = async (taskData) => {
    return await taskService.createTask(user, taskData);
  };

  const updateTask = async (projectId, taskId, taskData) => {
    return await taskService.updateTask(user, projectId, taskId, taskData);
  };

  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    return await taskService.updateTaskStatus(user, projectId, taskId, newStatus);
  };

  const deleteTask = async (projectId, taskId) => {
    return await taskService.deleteTask(user, projectId, taskId);
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
