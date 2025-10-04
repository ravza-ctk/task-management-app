import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../services/local-storage';

export interface UserTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high' | 'normal';
  isRecurring?: boolean;
  repeatUntil?: string | null;
  completed?: boolean;
  tags?: string[];
  createdAt?: string; 
  isAllDay?: boolean; 
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<UserTask[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private localStorageService: LocalStorageService) {
    this.loadFromStorage();
  }

  private get tasks(): UserTask[] {
    return this.tasksSubject.getValue();
  }

  private set tasks(val: UserTask[]) {
    this.tasksSubject.next(val);
    this.localStorageService.saveAllTasks(val);
  }

  private loadFromStorage(): void {
    const saved = this.localStorageService.getTasks();
    if (saved && saved.length > 0) {
      this.tasks = saved;
    }
  }

  addTask(task: UserTask): void {
    if (task.isAllDay && task.dueDate) {
    const date = new Date(task.dueDate);
    task.startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    task.endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  }
    this.tasks = [...this.tasks, task];
  }

  updateTask(updatedTask: UserTask): void {
    this.tasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  deleteMultiple(ids: string[]): void {
    this.tasks = this.tasks.filter(t => !ids.includes(t.id));
  }

  completeMultiple(ids: string[]): void {
    this.tasks = this.tasks.map(t =>
      ids.includes(t.id) ? { ...t, completed: true } : t
    );
  }
}
