import { useState, useMemo } from 'react';
import { isOverdue } from '../lib/dates';

/**
 * Custom hook to manage search, filtering, and computed lists for project tasks.
 */
export function useProjectTasks(projectTasks = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = projectTasks.filter((task) => {
      const matchesSearch =
        !term ||
        (task.title || '').toLowerCase().includes(term) ||
        (task.description || '').toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === 'all' ? true : task.status === filterStatus;

      const matchesPriority =
        filterPriority === 'all' ? true : task.priority === filterPriority;

      const matchesAssignee =
        filterAssignee === 'all'
          ? true
          : filterAssignee === 'unassigned'
          ? !task.assigneeId
          : task.assigneeId === filterAssignee;

      const matchesOverdue = filterOverdueOnly ? isOverdue(task) : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesOverdue
      );
    });

    // Sort: To Do first (1), then In Progress (2), then Done (3)
    const STATUS_ORDER = {
      todo: 1,
      in_progress: 2,
      done: 3,
    };

    return result.sort((a, b) => {
      const orderA = STATUS_ORDER[a.status] || 99;
      const orderB = STATUS_ORDER[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;

      // Secondary sort: Overdue tasks first, then by dueDate
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return 0;
    });
  }, [
    projectTasks,
    searchTerm,
    filterStatus,
    filterPriority,
    filterAssignee,
    filterOverdueOnly,
  ]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterAssignee,
    setFilterAssignee,
    filterOverdueOnly,
    setFilterOverdueOnly,
    filteredTasks,
  };
}

