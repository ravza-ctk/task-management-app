import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly key = 'localTasks';

  getTasks(): any[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  saveTask(task: any): void {
    const tasks = this.getTasks();
    tasks.push(task);
    localStorage.setItem(this.key, JSON.stringify(tasks));
  }

  deleteTaskById(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    localStorage.setItem(this.key, JSON.stringify(tasks));
  }

  clearAll(): void {
    localStorage.removeItem(this.key);
  }

  saveAllTasks(tasks: any[]) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

}
