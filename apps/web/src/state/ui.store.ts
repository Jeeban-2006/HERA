import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIStore {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: uuidv4(),
          message,
          type,
          duration,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));

// Alias for backward compatibility
export const useToastStore = useUIStore;
