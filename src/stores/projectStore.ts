import { create } from 'zustand';
import { projectService } from '@/lib/supabase';
import type { Project, ProjectType } from '@/types';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string, userId: string) => Promise<void>;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),

  fetchProjects: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectService.getProjects(userId);
      set({ projects, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createProject: async (data: Partial<Project>) => {
    const project = await projectService.createProject(data);
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    const updated = await projectService.updateProject(id, updates);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deleteProject: async (id: string) => {
    await projectService.deleteProject(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },

  duplicateProject: async (id: string, userId: string) => {
    const copy = await projectService.duplicateProject(id, userId);
    set((state) => ({ projects: [copy, ...state.projects] }));
  },
}));
