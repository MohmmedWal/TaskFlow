import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckSquare, AlertCircle, FolderKanban, Circle, Clock, CheckCircle2, LayoutGrid, List, Mail, Check, X } from 'lucide-react';
import AuthContext from '../context/AuthContext/AuthContext';
import DataContext from '../context/DataContext/DataContext';
import { useLanguage } from '../context/LanguageContext/LanguageContext';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatCard from '../components/dashboard/StatCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import TaskRow from '../components/dashboard/TaskRow';
import KanbanCard from '../components/project/KanbanCard';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import SettingsView from '../components/dashboard/SettingsView';
import CustomSelect from '../components/common/CustomSelect';
import { useDashboardFilters } from '../hooks/useDashboardFilters';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const {
    projects,
    tasks,
    invitations,
    acceptInvitation,
    declineInvitation,
    addProject,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useContext(DataContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = ['overview', 'projects', 'tasks', 'settings'].includes(tabParam)
    ? tabParam
    : 'overview';

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Logical Task View Mode: 'board' (لوحة كانبان / سحب وإفلات) or 'list' (عرض القائمة)
  const [tasksViewMode, setTasksViewMode] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('taskflow_workflow_prefs') || '{}');
      return prefs.kanbanFirst ? 'board' : 'list';
    } catch {
      return 'list';
    }
  });

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, projectId: task.projectId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e, columnStatus) => {
    if (dragOverColumn === columnStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { taskId, projectId } = JSON.parse(dataStr);
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === targetStatus) return;

      const taskProject = projects.find((p) => p.id === projectId);
      const isOwner = taskProject && user && taskProject.ownerId === user.uid;
      const isAssignee = user && task.assigneeId === user.uid;
      const isCreator = user && task.createdBy === user.uid;
      if (!isOwner && !isAssignee && !isCreator) {
        alert(t('permissionDenied'));
        return;
      }

      await updateTaskStatus(projectId, taskId, targetStatus);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const navigate = useNavigate();

  // Custom hook extracting all filtering, search, and metrics logic
  const {
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
  } = useDashboardFilters(projects, tasks);

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const handleTaskSubmit = async (taskData) => {
    if (editingTask) {
      await updateTask(taskData.projectId, editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await addTask(taskData);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans transition-colors duration-200">
      <Sidebar
        currentUser={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={
            activeTab === 'overview'
              ? t('navOverview')
              : activeTab === 'projects'
              ? t('navProjects')
              : activeTab === 'tasks'
              ? t('navTasks')
              : t('navSettings')
          }
          searchTerm={activeTab !== 'settings' ? searchTerm : null}
          setSearchTerm={activeTab !== 'settings' ? setSearchTerm : null}
          onNewProjectClick={activeTab !== 'settings' ? () => setIsProjectModalOpen(true) : null}
          onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
        />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsView currentUser={user} onLogout={logout} />
          )}

          {/* Top Welcome Banner & Overview Metrics: Shown ONLY on overview (Home) */}
          {activeTab === 'overview' && (
            <>
              <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {t('welcomeTitle')} {user?.displayName || 'مستخدم TaskFlow'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {t('welcomeSubtitle')}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700/80 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('newProject')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    disabled={projects.length === 0}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('newTask')}</span>
                  </button>
                </div>
              </div>

              {/* Metrics Section */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title={t('statTotalProjects')}
                  value={projects.length}
                  type="projects"
                />
                <StatCard
                  title={t('statActiveTasks')}
                  value={activeTasks.length}
                  type="active"
                />
                <StatCard
                  title={t('statCompletedTasks')}
                  value={completedTasks.length}
                  type="completed"
                />
                <StatCard
                  title={t('statOverdueTasks')}
                  value={overdueTasks.length}
                  type="overdue"
                  highlight={true}
                />
              </section>
            </>
          )}

          {/* Projects View */}
          {(activeTab === 'overview' || activeTab === 'projects') && (
            <section className="space-y-4">
              <div className="flex justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {activeTab === 'projects' ? t('allProjects') : t('navProjects')}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {filteredProjects.length}
                  </span>
                </div>
                {activeTab === 'projects' && (
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('newProject')}</span>
                  </button>
                )}
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      tasks={tasks}
                      isOwner={project.ownerId === user?.uid}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl text-zinc-500 text-xs">
                  {projects.length === 0
                    ? t('noProjectsYet')
                    : t('noProjectsMatch')}
                </div>
              )}
            </section>
          )}

          {/* Tasks View with Filters and List / Board Switcher */}
          {(activeTab === 'overview' || activeTab === 'tasks') && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t('navTasks')}</h3>
                    <span className="text-xs text-zinc-400 mr-1">({filteredTasks.length})</span>
                  </div>

                  {/* Logical View Mode Switcher: لوحة كانبان / عرض القائمة */}
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                    <button
                      type="button"
                      onClick={() => setTasksViewMode('board')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        tasksViewMode === 'board'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                      title={t('dragDropBoard')}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{t('boardView')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTasksViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        tasksViewMode === 'list'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                      title={t('listView')}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>{t('listView')}</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <CustomSelect
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                      { value: 'all', label: t('allStatuses') },
                      {
                        value: 'todo',
                        label: 'To Do',
                        icon: <Circle className="w-3 h-3 text-zinc-500" />,
                      },
                      {
                        value: 'in_progress',
                        label: 'In Progress',
                        icon: <Clock className="w-3 h-3 text-blue-500" />,
                      },
                      {
                        value: 'done',
                        label: 'Done',
                        icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
                      },
                    ]}
                    size="md"
                  />

                  <button
                    type="button"
                    onClick={() => setOnlyOverdue(!onlyOverdue)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      onlyOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{onlyOverdue ? t('cancelOverdueFilter') : t('onlyOverdueFilter')}</span>
                  </button>
                </div>
              </div>

              {filteredTasks.length > 0 ? (
                tasksViewMode === 'list' ? (
                  <div className="space-y-2">
                    {filteredTasks.map((task) => {
                      const taskProject = projects.find((p) => p.id === task.projectId);
                      const isProjectOwner = taskProject && user && taskProject.ownerId === user.uid;
                      const isCreator = user && task.createdBy === user.uid;
                      const isAssignee = user && task.assigneeId === user.uid;

                      const canEdit = isProjectOwner || isCreator || isAssignee;
                      const canDelete = isProjectOwner || isCreator;
                      const canChangeStatus = isProjectOwner || isAssignee || isCreator;

                      return (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsTaskModalOpen(true);
                          }}
                          onDelete={deleteTask}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          canChangeStatus={canChangeStatus}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: To Do */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'todo')}
                      onDragLeave={(e) => handleDragLeave(e, 'todo')}
                      onDrop={(e) => handleDrop(e, 'todo')}
                      className={`p-4 rounded-3xl border transition-all duration-200 space-y-3 min-h-[300px] ${
                        dragOverColumn === 'todo'
                          ? 'bg-zinc-100/90 dark:bg-zinc-800/80 border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-400/30'
                          : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {t('statusTodoLabel')} (To Do)
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {todoTasks.length}
                        </span>
                      </div>

                      {dragOverColumn === 'todo' && (
                        <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-zinc-400 dark:border-zinc-500 bg-zinc-200/50 dark:bg-zinc-800/50 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 animate-pulse">
                          {t('dropTaskHere')}
                        </div>
                      )}

                      <div className="space-y-3">
                        {todoTasks.length > 0 ? (
                          todoTasks.map((task) => {
                            const taskProject = projects.find((p) => p.id === task.projectId);
                            const isProjectOwner = taskProject && user && taskProject.ownerId === user.uid;
                            const isCreator = user && task.createdBy === user.uid;
                            const isAssignee = user && task.assigneeId === user.uid;

                            return (
                              <KanbanCard
                                key={task.id}
                                task={task}
                                projectName={taskProject?.name}
                                members={taskProject?.members || []}
                                onStatusChange={updateTaskStatus}
                                onEdit={(t) => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                onDelete={deleteTask}
                                canEdit={isProjectOwner || isCreator || isAssignee}
                                canDelete={isProjectOwner || isCreator}
                                canChangeStatus={isProjectOwner || isAssignee || isCreator}
                                isDragging={draggedTaskId === task.id}
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                              />
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                            {t('noTasksInTodo')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: In Progress */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'in_progress')}
                      onDragLeave={(e) => handleDragLeave(e, 'in_progress')}
                      onDrop={(e) => handleDrop(e, 'in_progress')}
                      className={`p-4 rounded-3xl border transition-all duration-200 space-y-3 min-h-[300px] ${
                        dragOverColumn === 'in_progress'
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            {t('statusInProgressLabel')} (In Progress)
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                          {inProgressTasks.length}
                        </span>
                      </div>

                      {dragOverColumn === 'in_progress' && (
                        <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-center text-xs font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
                          {t('dropTaskHere')}
                        </div>
                      )}

                      <div className="space-y-3">
                        {inProgressTasks.length > 0 ? (
                          inProgressTasks.map((task) => {
                            const taskProject = projects.find((p) => p.id === task.projectId);
                            const isProjectOwner = taskProject && user && taskProject.ownerId === user.uid;
                            const isCreator = user && task.createdBy === user.uid;
                            const isAssignee = user && task.assigneeId === user.uid;

                            return (
                              <KanbanCard
                                key={task.id}
                                task={task}
                                projectName={taskProject?.name}
                                members={taskProject?.members || []}
                                onStatusChange={updateTaskStatus}
                                onEdit={(t) => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                onDelete={deleteTask}
                                canEdit={isProjectOwner || isCreator || isAssignee}
                                canDelete={isProjectOwner || isCreator}
                                canChangeStatus={isProjectOwner || isAssignee || isCreator}
                                isDragging={draggedTaskId === task.id}
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                              />
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                            {t('noTasksInProgress')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Done */}
                    <div
                      onDragOver={(e) => handleDragOver(e, 'done')}
                      onDragLeave={(e) => handleDragLeave(e, 'done')}
                      onDrop={(e) => handleDrop(e, 'done')}
                      className={`p-4 rounded-3xl border transition-all duration-200 space-y-3 min-h-[300px] ${
                        dragOverColumn === 'done'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {t('statusDoneLabel')} (Done)
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">
                          {doneTasks.length}
                        </span>
                      </div>

                      {dragOverColumn === 'done' && (
                        <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-pulse">
                          {t('dropTaskHere')}
                        </div>
                      )}

                      <div className="space-y-3">
                        {doneTasks.length > 0 ? (
                          doneTasks.map((task) => {
                            const taskProject = projects.find((p) => p.id === task.projectId);
                            const isProjectOwner = taskProject && user && taskProject.ownerId === user.uid;
                            const isCreator = user && task.createdBy === user.uid;
                            const isAssignee = user && task.assigneeId === user.uid;

                            return (
                              <KanbanCard
                                key={task.id}
                                task={task}
                                projectName={taskProject?.name}
                                members={taskProject?.members || []}
                                onStatusChange={updateTaskStatus}
                                onEdit={(t) => {
                                  setEditingTask(t);
                                  setIsTaskModalOpen(true);
                                }}
                                onDelete={deleteTask}
                                canEdit={isProjectOwner || isCreator || isAssignee}
                                canDelete={isProjectOwner || isCreator}
                                canChangeStatus={isProjectOwner || isAssignee || isCreator}
                                isDragging={draggedTaskId === task.id}
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnd={handleDragEnd}
                              />
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                            {t('noTasksDone')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-10 text-center bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl text-zinc-500 text-xs">
                  {onlyOverdue
                    ? t('noOverdueTasks')
                    : t('noTasksMatch')}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={addProject}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        projects={projects}
        initialData={editingTask}
        title={editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
      />
    </div>
  );
}
