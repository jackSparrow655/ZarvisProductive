import { HomeRecentActivity } from "@/types/extended";
import { create } from "zustand";

interface taskState {
  tasks: HomeRecentActivity[] | [];
  addTasks: (tasks: HomeRecentActivity[]) => void;
}

export const useTasks = create<taskState>()((set) => ({
  tasks: [],
  addTasks: (tasks) =>
    set((state) => ({
      tasks: [...tasks],
    })),
}));
