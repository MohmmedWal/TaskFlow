import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Circle,
  Clock,
  CheckCircle2,
  Plus,
  Globe,
  Menu,
} from 'lucide-react';
import AuthContext from '../context/AuthContext/AuthContext';
import DataContext from '../context/DataContext/DataContext';
import { useLanguage } from '../context/LanguageContext/LanguageContext';
import Sidebar from '../components/dashboard/Sidebar';
import TaskRow from '../components/dashboard/TaskRow';
import KanbanCard from '../components/project/KanbanCard';
import CreateTaskModal from '../components/dashboard/CreateTaskModal';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectStats from '../components/project/ProjectStats';
import NotificationsBell from '../components/common/NotificationsBell';
import ProjectMembers from '../components/project/ProjectMembers';
import ProjectTaskFilters from '../components/project/ProjectTaskFilters';
import { useProjectTasks } from '../hooks/useProjectTasks';
import { useTheme } from '../context/ThemeContext/ThemeContext';

export default function ProjectDetails() {
  const params = useParams();
  const projectId = params.id || params.projectId;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const { user, logout } = useContext(AuthContext);
  const {
    projects,
    tasks,
    loading,
    updateProject,
    deleteProject,
    addMemberByEmail,
    sendProjectInvitation,
    cancelInvitation,
    fetchProjectPendingInvitations,
    removeMember,
    fetchProjectMembers,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useContext(DataContext);

  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals & View Mode
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // Default to Board for rich project experience

  // Drag and Drop State & Permissions Feedback
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [permissionAlert, setPermissionAlert] = useState(null);

  const project = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  const isOwner = project && user && project.ownerId === user.uid;

  // Granular SRS permission checks
  const canEditTask = (task) =>
    isOwner || task.createdBy === user?.uid || task.assigneeId === user?.uid;

  const canDeleteTask = (task) =>
    isOwner || task.createdBy === user?.uid;

  const canChangeTaskStatus = (task) =>
    isOwner || task.assigneeId === user?.uid || task.createdBy === user?.uid;

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    if (!canChangeTaskStatus(task)) {
      e.preventDefault();
      setPermissionAlert('تنبيه الصلاحيات: يمكنك فقط تغيير حالة المهام المسندة إليك أو التي أنشأتها.');
      setTimeout(() => setPermissionAlert(null), 3500);
      return;
    }
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
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
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = projectTasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    if (!canChangeTaskStatus(task)) {
      setPermissionAlert('تنبيه الصلاحيات: لا يحق لك تغيير حالة مهمة مسندة لعضو آخر.');
      setTimeout(() => setPermissionAlert(null), 3500);
      return;
    }

    try {
      await updateTaskStatus(projectId, task.id, targetStatus);
    } catch (err) {
      console.error('Error changing task status via drag and drop:', err);
      setPermissionAlert(err.message || 'حدث خطأ أثناء تحديث حالة المهمة.');
      setTimeout(() => setPermissionAlert(null), 3500);
    }
  };

  // Load project members
  const loadMembers = async () => {
    if (!projectId) return;
    setMembersLoading(true);
    try {
      const list = await fetchProjectMembers(projectId);
      setMembers(list);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  // Load pending invitations for this project
  const loadPendingInvitations = async () => {
    if (!projectId) return;
    try {
      const list = await fetchProjectPendingInvitations(projectId);
      setPendingInvitations(list);
    } catch (err) {
      console.error('Error loading pending invites:', err);
    }
  };

  useEffect(() => {
    loadMembers();
    loadPendingInvitations();
  }, [projectId]);

  // Tasks belonging to this project
  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === projectId);
  }, [tasks, projectId]);

  // Clean hook for search & filters (naturally sorts To Do first, then In Progress, then Done)
  const {
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
  } = useProjectTasks(projectTasks);

  const handleSendInvitation = async (email) => {
    await sendProjectInvitation(projectId, email);
    await loadPendingInvitations();
  };

  const handleCancelInvitation = async (invitationId) => {
    await cancelInvitation(invitationId);
    await loadPendingInvitations();
  };

  const handleRemoveMember = async (memberUid) => {
    await removeMember(projectId, memberUid);
    await loadMembers();
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        'تحذير: هل أنت متأكد من حذف هذا المشروع نهائياً؟ سيتم حذف جميع مهامه أيضاً.'
      )
    )
      return;

    try {
      await deleteProject(projectId);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء حذف المشروع.');
    }
  };

  const handleTaskSubmit = async (taskData) => {
    if (editingTask) {
      await updateTask(projectId, editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await addTask({ ...taskData, projectId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6 text-center font-sans">
        <div className="text-xs text-zinc-400">جاري تحميل بيانات المشروع...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans dir-rtl">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold mb-1">المشروع غير موجود أو تم حذفه</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
          قد لا تملك صلاحية الوصول لهذا المشروع أو أن الرابط غير صحيح.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
        >
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans transition-colors duration-200">
      {/* Sidebar matching Dashboard */}
      <Sidebar
        currentUser={user}
        activeTab="projects"
        setActiveTab={(tab) => navigate(`/dashboard?tab=${tab}`)}
        onLogout={logout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Top Header with Breadcrumbs & Actions */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
          {/* Breadcrumbs Navigation with Prominent Return Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              title="القائمة الجانبية"
              aria-label="Toggle Mobile Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard?tab=projects')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all shadow-2xs hover:-translate-x-0.5 cursor-pointer flex-shrink-0"
              title={t('backToProjects')}
            >
              <ArrowRight className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span className="hidden sm:inline">{t('backToProjects')}</span>
            </button>

            <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 min-w-0">
              <Link
                to="/dashboard?tab=overview"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate"
              >
                {t('navOverview')}
              </Link>
              <span>/</span>
              <Link
                to="/dashboard?tab=projects"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate"
              >
                {t('navProjects')}
              </Link>
              <span>/</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]">
                {project.name}
              </span>
            </nav>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-bold">
                {language === 'ar' ? 'English' : 'العربية'}
              </span>
            </button>

            {/* Notifications Bell */}
            <NotificationsBell />

            {/* Theme Toggle (Single Header Location) */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title={theme === 'dark' ? t('themeToggleLight') : t('themeToggleDark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newTask')}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Permission Alert Toast */}
          {permissionAlert && (
            <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-900 text-white shadow-2xl border border-rose-700 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-300 flex-shrink-0" />
                <span>{permissionAlert}</span>
              </div>
            </div>
          )}
          {/* Prominent Back Banner */}
          <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
            <button
              onClick={() => navigate('/dashboard?tab=projects')}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <span>← العودة إلى قائمة المشاريع</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                أنت الآن تتصفح مهام مشروع:
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                {project.name}
              </span>
            </div>
          </div>

          {/* Project Hero Header */}
          <ProjectHeader
            project={project}
            isOwner={isOwner}
            onAddTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditProject={() => setIsEditProjectModalOpen(true)}
            onDeleteProject={handleDeleteProject}
          />

          {/* Project Progress & Members Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <ProjectStats projectTasks={projectTasks} />
            <ProjectMembers
              members={members}
              pendingInvitations={pendingInvitations}
              ownerId={project.ownerId}
              isOwner={isOwner}
              membersLoading={membersLoading}
              onSendInvitation={handleSendInvitation}
              onCancelInvitation={handleCancelInvitation}
              onRemoveMember={handleRemoveMember}
            />
          </div>

          {/* Tasks Management Section */}
          <section className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  مهام المشروع ({filteredTasks.length})
                </h2>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                      viewMode === 'board'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title={t('dragDropBoard')}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{t('boardView')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title={t('listView')}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{t('listView')}</span>
                  </button>
                </div>
              </div>

              {/* Task Filters */}
              <ProjectTaskFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                filterAssignee={filterAssignee}
                setFilterAssignee={setFilterAssignee}
                filterOverdueOnly={filterOverdueOnly}
                setFilterOverdueOnly={setFilterOverdueOnly}
                members={members}
              />
            </div>

            {/* Task Views */}
            {filteredTasks.length > 0 ? (
              viewMode === 'board' ? (
                /* Kanban Columns: To Do column first, then In Progress, then Done with Drag & Drop */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                  {/* Column 1: To Do (First!) */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'todo')}
                    onDragLeave={(e) => handleDragLeave(e, 'todo')}
                    onDrop={(e) => handleDrop(e, 'todo')}
                    className={`p-4 rounded-3xl border transition-all duration-200 space-y-3 min-h-[300px] ${
                      dragOverColumn === 'todo'
                        ? 'bg-zinc-200/70 dark:bg-zinc-800/60 border-zinc-500 ring-2 ring-zinc-500/30'
                        : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          قيد الانتظار (To Do)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                        {todoTasks.length}
                      </span>
                    </div>

                    {/* Drop target indicator */}
                    {dragOverColumn === 'todo' && (
                      <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-zinc-400 dark:border-zinc-600 bg-zinc-200/40 dark:bg-zinc-800/40 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 animate-pulse">
                        أفلت المهمة هنا لنقلها إلى To Do
                      </div>
                    )}

                    <div className="space-y-3">
                      {todoTasks.length > 0 ? (
                        todoTasks.map((task) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            members={members}
                            onStatusChange={updateTaskStatus}
                            onEdit={(t) => {
                              setEditingTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={deleteTask}
                            canEdit={canEditTask(task)}
                            canDelete={canDeleteTask(task)}
                            canChangeStatus={canChangeTaskStatus(task)}
                            isDragging={draggedTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                          لا توجد مهام قيد الانتظار
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: In Progress (Second!) */}
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
                          قيد التنفيذ (In Progress)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                        {inProgressTasks.length}
                      </span>
                    </div>

                    {/* Drop target indicator */}
                    {dragOverColumn === 'in_progress' && (
                      <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-center text-xs font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
                        أفلت المهمة هنا لنقلها إلى In Progress
                      </div>
                    )}

                    <div className="space-y-3">
                      {inProgressTasks.length > 0 ? (
                        inProgressTasks.map((task) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            members={members}
                            onStatusChange={updateTaskStatus}
                            onEdit={(t) => {
                              setEditingTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={deleteTask}
                            canEdit={canEditTask(task)}
                            canDelete={canDeleteTask(task)}
                            canChangeStatus={canChangeTaskStatus(task)}
                            isDragging={draggedTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                          لا توجد مهام قيد التنفيذ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Done (Third!) */}
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
                          المكتملة (Done)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">
                        {doneTasks.length}
                      </span>
                    </div>

                    {/* Drop target indicator */}
                    {dragOverColumn === 'done' && (
                      <div className="py-2.5 px-3 rounded-xl border-2 border-dashed border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-pulse">
                        أفلت المهمة هنا لنقلها إلى Done
                      </div>
                    )}

                    <div className="space-y-3">
                      {doneTasks.length > 0 ? (
                        doneTasks.map((task) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            members={members}
                            onStatusChange={updateTaskStatus}
                            onEdit={(t) => {
                              setEditingTask(t);
                              setIsTaskModalOpen(true);
                            }}
                            onDelete={deleteTask}
                            canEdit={canEditTask(task)}
                            canDelete={canDeleteTask(task)}
                            canChangeStatus={canChangeTaskStatus(task)}
                            isDragging={draggedTaskId === task.id}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                          لا توجد مهام مكتملة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* List View (Tasks naturally sorted: To Do first, then In Progress, then Done) */
                <div className="space-y-2.5">
                  {filteredTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      members={members}
                      onStatusChange={updateTaskStatus}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onDelete={deleteTask}
                      canEdit={canEditTask(task)}
                      canDelete={canDeleteTask(task)}
                      canChangeStatus={canChangeTaskStatus(task)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="p-12 text-center bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl text-zinc-500 text-xs shadow-2xs">
                {filterOverdueOnly
                  ? 'رائع! لا توجد مهام متأخرة عن موعدها في هذا المشروع.'
                  : projectTasks.length === 0
                  ? 'لا توجد مهام مسجلة لهذا المشروع بعد. ابدأ بإضافة المهمة الأولى!'
                  : 'لا توجد مهام تطابق معايير الفلترة والبحث المحددة.'}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        selectedProjectId={projectId}
        projects={[project]}
        members={members}
        initialData={editingTask}
        title={editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة للمشروع'}
      />

      <CreateProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSubmit={(data) => updateProject(projectId, data)}
        initialData={project}
        title="تعديل بيانات المشروع"
      />
    </div>
  );
}
