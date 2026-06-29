'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  FolderOpen,
  Mic,
  Headphones,
  BookOpen,
  Library,
  Video,
  Film,
  Clock,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'active' | 'archived';

const projectTypes = [
  {
    id: 'voice',
    name: 'Voice',
    description: 'Generate realistic AI voices',
    icon: Mic,
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    id: 'podcast',
    name: 'Podcast',
    description: 'Create full podcast episodes',
    icon: Headphones,
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Narrate engaging stories',
    icon: BookOpen,
    color: 'teal',
    gradient: 'from-teal-500/20 to-teal-600/20',
  },
  {
    id: 'audiobook',
    name: 'Audiobook',
    description: 'Convert books to audio',
    icon: Library,
    color: 'teal',
    gradient: 'from-teal-500/20 to-teal-600/20',
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Generate video content',
    icon: Video,
    color: 'red',
    gradient: 'from-red-500/20 to-red-600/20',
  },
  {
    id: 'reel',
    name: 'Reel',
    description: 'Create short-form video reels',
    icon: Film,
    color: 'red',
    gradient: 'from-red-500/20 to-red-600/20',
  },
];

const getTypeConfig = (type: string) => {
  return projectTypes.find((t) => t.id === type) || projectTypes[0];
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { variant: string; label: string }> = {
    draft: { variant: 'secondary', label: 'Draft' },
    generating: { variant: 'warning', label: 'Generating' },
    completed: { variant: 'success', label: 'Completed' },
    archived: { variant: 'secondary', label: 'Archived' },
    error: { variant: 'destructive', label: 'Error' },
  };
  return configs[status] || configs.draft;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { projects, createProject, deleteProject, updateProject, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user, fetchProjects]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by tab
    if (filterTab === 'active') {
      filtered = filtered.filter((p) => p.status !== 'archived');
    } else if (filterTab === 'archived') {
      filtered = filtered.filter((p) => p.status === 'archived');
    }

    // Search by title
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [projects, filterTab, searchQuery]);

  const handleCreateProject = (type: string) => {
    if (!user) return;
    const typeConfig = getTypeConfig(type);
    createProject({
      user_id: user.id,
      title: `New ${typeConfig.name} Project`,
      type,
      status: 'draft',
      progress: 0,
    });
    setShowNewProjectModal(false);
  };

  const handleDuplicate = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      createProject({
        ...project,
        title: `${project.title} (Copy)`,
        id: undefined,
      });
    }
    setActiveDropdown(null);
  };

  const handleArchive = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, {
        status: project.status === 'archived' ? 'draft' : 'archived',
      });
    }
    setActiveDropdown(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-ev-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-ev-on-surface">Projects</h1>
          <Button
            variant="primary"
            onClick={() => setShowNewProjectModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-on-surface-variant" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-ev-surface-container rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-ev-primary text-white'
                  : 'text-ev-on-surface-variant hover:text-ev-on-surface'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-ev-primary text-white'
                  : 'text-ev-on-surface-variant hover:text-ev-on-surface'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-ev-surface-container rounded-lg p-1">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filterTab === 'all'
                  ? 'bg-ev-primary text-white'
                  : 'text-ev-on-surface-variant hover:text-ev-on-surface'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filterTab === 'active'
                  ? 'bg-ev-primary text-white'
                  : 'text-ev-on-surface-variant hover:text-ev-on-surface'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('archived')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filterTab === 'archived'
                  ? 'bg-ev-primary text-white'
                  : 'text-ev-on-surface-variant hover:text-ev-on-surface'
              )}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Projects Display */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 rounded-full bg-ev-surface-container flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-ev-on-surface-variant" />
              </div>
              <h3 className="text-xl font-semibold text-ev-on-surface mb-2">
                No projects found
              </h3>
              <p className="text-ev-on-surface-variant mb-6">
                {searchQuery || filterTab !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first project to get started'}
              </p>
              <Button
                variant="primary"
                onClick={() => setShowNewProjectModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => {
                const typeConfig = getTypeConfig(project.type);
                const statusConfig = getStatusConfig(project.status);
                const TypeIcon = typeConfig.icon;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardContent className="p-0">
                        {/* Thumbnail */}
                        <div
                          className={cn(
                            'h-40 bg-gradient-to-br flex items-center justify-center',
                            typeConfig.gradient
                          )}
                        >
                          <TypeIcon className={cn('w-16 h-16', `text-${typeConfig.color}-500`)} />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-ev-on-surface line-clamp-2 flex-1">
                              {project.title}
                            </h3>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown === project.id ? null : project.id
                                  )
                                }
                                className="p-1 rounded-md hover:bg-ev-surface-container text-ev-on-surface-variant transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {activeDropdown === project.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveDropdown(null)}
                                  />
                                  <div className="absolute right-0 top-8 z-20 w-48 bg-ev-surface-high rounded-lg shadow-lg border border-ev-outline overflow-hidden">
                                    <button
                                      onClick={() => setActiveDropdown(null)}
                                      className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                                    >
                                      Open
                                    </button>
                                    <button
                                      onClick={() => handleDuplicate(project.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                                    >
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={() => handleArchive(project.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                                    >
                                      {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(project.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-ev-error hover:bg-ev-surface-container transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {typeConfig.name}
                            </Badge>
                            <Badge variant={statusConfig.variant as any} className="text-xs">
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          {(project.status === 'generating' || project.status === 'completed') && (
                            <div className="space-y-1">
                              <div className="h-2 bg-ev-surface-container rounded-full overflow-hidden">
                                <motion.div
                                  className={cn(
                                    'h-full rounded-full',
                                    project.status === 'generating'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${project.progress || 0}%`,
                                  }}
                                  transition={{
                                    duration: project.status === 'generating' ? 1.5 : 0.5,
                                    repeat: project.status === 'generating' ? Infinity : 0,
                                    repeatType: 'reverse',
                                  }}
                                />
                              </div>
                              <div className="text-xs text-ev-on-surface-variant text-right">
                                {project.progress || 0}%
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-ev-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(project.updatedAt)}
                            </div>
                            {project.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(project.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-ev-surface rounded-lg border border-ev-outline overflow-hidden"
            >
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-ev-surface-container text-xs font-medium text-ev-on-surface-variant border-b border-ev-outline">
                <div className="col-span-4">Project</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Progress</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-1">Created</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-ev-outline">
                {filteredProjects.map((project, index) => {
                  const listTypeConfig = getTypeConfig(project.type);
                  const listStatusConfig = getStatusConfig(project.status);
                  const ListTypeIcon = listTypeConfig.icon;

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-ev-surface-container transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                            listTypeConfig.gradient
                          )}
                        >
                          <ListTypeIcon className={cn('w-5 h-5', `text-${listTypeConfig.color}-500`)} />
                        </div>
                        <span className="font-semibold text-ev-on-surface truncate">
                          {project.title}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {listTypeConfig.name}
                        </Badge>
                      </div>

                      <div className="col-span-2">
                        <Badge variant={listStatusConfig.variant as any} className="text-xs">
                          {listStatusConfig.label}
                        </Badge>
                      </div>

                      <div className="col-span-1">
                        {(project.status === 'generating' || project.status === 'completed') && (
                          <div className="w-full">
                            <div className="h-2 bg-ev-surface-container rounded-full overflow-hidden">
                              <motion.div
                                className={cn(
                                  'h-full rounded-full',
                                  project.status === 'generating'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                )}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${project.progress || 0}%`,
                                }}
                                transition={{
                                  duration: project.status === 'generating' ? 1.5 : 0.5,
                                  repeat: project.status === 'generating' ? Infinity : 0,
                                  repeatType: 'reverse',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-span-1 text-sm text-ev-on-surface-variant">
                        {project.duration ? formatDuration(project.duration) : '-'}
                      </div>

                      <div className="col-span-1 text-sm text-ev-on-surface-variant">
                        {formatDate(project.createdAt)}
                      </div>

                      <div className="col-span-1 relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(activeDropdown === project.id ? null : project.id)
                          }
                          className="p-1 rounded-md hover:bg-ev-surface-high text-ev-on-surface-variant transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === project.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                            <div className="absolute right-0 top-8 z-20 w-48 bg-ev-surface-high rounded-lg shadow-lg border border-ev-outline overflow-hidden">
                              <button
                                onClick={() => setActiveDropdown(null)}
                                className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                              >
                                Open
                              </button>
                              <button
                                onClick={() => handleDuplicate(project.id)}
                                className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleArchive(project.id)}
                                className="w-full px-4 py-2 text-left text-sm text-ev-on-surface hover:bg-ev-surface-container transition-colors"
                              >
                                {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                              </button>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="w-full px-4 py-2 text-left text-sm text-ev-error hover:bg-ev-surface-container transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title="Create New Project"
        description="Choose a project type to get started"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {projectTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => handleCreateProject(type.id)}
                className={cn(
                  'p-6 rounded-lg border-2 border-ev-outline bg-ev-surface hover:bg-ev-surface-container',
                  'transition-all duration-200 text-left group hover:border-ev-primary',
                  'hover:shadow-lg hover:scale-105'
                )}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3',
                    type.gradient
                  )}
                >
                  <Icon className={cn('w-6 h-6', `text-${type.color}-500`)} />
                </div>
                <h3 className="font-semibold text-ev-on-surface mb-1">{type.name}</h3>
                <p className="text-sm text-ev-on-surface-variant">{type.description}</p>
              </motion.button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
