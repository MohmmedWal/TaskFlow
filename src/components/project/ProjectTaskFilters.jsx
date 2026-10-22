import React from 'react';
import { Search, AlertCircle, Circle, Clock, CheckCircle2, Flag, Users } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

export default function ProjectTaskFilters({
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
  members = [],
}) {
  const statusOptions = [
    { value: 'all', label: 'كافة الحالات' },
    { value: 'todo', label: 'To Do', icon: <Circle className="w-3 h-3 text-zinc-500" /> },
    { value: 'in_progress', label: 'In Progress', icon: <Clock className="w-3 h-3 text-blue-500" /> },
    { value: 'done', label: 'Done', icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
  ];

  const priorityOptions = [
    { value: 'all', label: 'كل الأولويات' },
    { value: 'high', label: 'عالية (High)', icon: <Flag className="w-3 h-3 text-rose-500" /> },
    { value: 'medium', label: 'متوسطة (Medium)', icon: <Flag className="w-3 h-3 text-amber-500" /> },
    { value: 'low', label: 'منخفضة (Low)', icon: <Flag className="w-3 h-3 text-zinc-400" /> },
  ];

  const assigneeOptions = [
    { value: 'all', label: 'كل الأعضاء', icon: <Users className="w-3 h-3 text-zinc-400" /> },
    { value: 'unassigned', label: 'غير مسندة' },
    ...members.map((m) => ({
      value: m.uid,
      label: m.displayName || m.email,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="بحث في المهام..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-8 pl-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 w-36 sm:w-44"
        />
      </div>

      <CustomSelect
        value={filterStatus}
        onChange={setFilterStatus}
        options={statusOptions}
        size="md"
      />

      <CustomSelect
        value={filterPriority}
        onChange={setFilterPriority}
        options={priorityOptions}
        size="md"
      />

      <CustomSelect
        value={filterAssignee}
        onChange={setFilterAssignee}
        options={assigneeOptions}
        size="md"
      />

      <button
        type="button"
        onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
          filterOverdueOnly
            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 font-semibold'
            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{filterOverdueOnly ? 'كل المهام' : 'المتأخرة فقط'}</span>
      </button>
    </div>
  );
}

