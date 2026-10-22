import { useState, useMemo } from 'react';
import { isOverdue } from '../lib/dates';

/**
 * Custom hook to encapsulate filtering and metrics computation for the dashboard.
 * Adheres to SRP by abstracting derived data calculations from the page component.
 */
export function useDashboardFilters(projects = [], tasks = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Computed metrics
  const overdueTasks = useMemo(() => tasks.filter((t) => isOverdue(t)), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);

  // Filtered projects: sorted so projects with active To Do tasks appear first, then In Progress, then completed
  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = projects;
    if (term) {
      list = list.filter(
        (project) =>
          (project.name || '').toLowerCase().includes(term) ||
          (project.description || '').toLowerCase().includes(term)
      );
    }
    return [...list].sort((a, b) => {
      const aTasks = tasks.filter((t) => t.projectId === a.id);
      const bTasks = tasks.filter((t) => t.projectId === b.id);

      const aTodo = aTasks.filter((t) => t.status === 'todo').length;
      const bTodo = bTasks.filter((t) => t.status === 'todo').length;
      if (aTodo !== bTodo) return bTodo - aTodo; // More To Do tasks first

      const aInProg = aTasks.filter((t) => t.status === 'in_progress').length;
      const bInProg = bTasks.filter((t) => t.status === 'in_progress').length;
      if (aInProg !== bInProg) return bInProg - aInProg; // In Progress tasks next

      return 0;
    });
  }, [projects, tasks, searchTerm]);

  // Filtered tasks: sorted with To Do first, then In Progress, then Done
  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = tasks.filter((task) => {
      const matchesSearch =
        !term ||
        (task.title || '').toLowerCase().includes(term) ||
        (task.description || '').toLowerCase().includes(term) ||
        (task.projectName || '').toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === 'all' ? true : task.status === selectedStatus;

      const matchesOverdue = onlyOverdue ? isOverdue(task) : true;

      return matchesSearch && matchesStatus && matchesOverdue;
    });

    const STATUS_ORDER = { todo: 1, in_progress: 2, done: 3 };
    return result.sort((a, b) => {
      const diff = (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99);
      if (diff !== 0) return diff;
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });
  }, [tasks, searchTerm, selectedStatus, onlyOverdue]);

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    onlyOverdue,
    setOnlyOverdue,
    filteredProjects,
    filteredTasks,
    overdueTasks,
    completedTasks,
    activeTasks,
  };
}

