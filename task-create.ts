import { Component, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from '../services/local-storage';
import { FormsModule } from '@angular/forms';
import { TaskService, UserTask } from '../services/task';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-task-create',
  template:'./task-create.html'
})

export class TaskCreateComponent {

@Output() taskCreated = new EventEmitter<void>();


title: string = '';
start: string = '';
end: string = '';
repeat: string = '';
repeatUntil: string = '';
isRecurring: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private taskService: TaskService
  ) {}

  async createTask() {
if (!this.title || !this.start || !this.end) return;

const newId = uuidv4();

const newTask: UserTask = {
  id: newId,
      title: this.title,
      description: '',
      dueDate: this.start,
      startDate: this.start,
      endDate: this.end,
      priority: 'medium',
      isRecurring: this.isRecurring,
      repeatUntil: this.repeatUntil || null,
      completed: false,
      createdAt: new Date().toISOString(),
      tags: []
};


this.localStorageService.saveTask({
  summary: this.title,
  start: {
    dateTime: new Date(this.start).toISOString(),
    timeZone: 'Europe/Istanbul',
  },
  end: {
    dateTime: new Date(this.end).toISOString(),
    timeZone: 'Europe/Istanbul',
  },
  id: newId,
  reminders: { useDefault: false },
  isRecurring: this.isRecurring,
  repeatUntil: this.repeatUntil || null,
});

if ((newTask as any).isAllDay) {
  const date = new Date(newTask.dueDate);
  newTask.startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  newTask.endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
}


this.taskService.addTask(newTask);

this.title = '';
this.start = '';
this.end = '';
this.repeat = '';
this.repeatUntil = '';
this.isRecurring = false;

this.taskCreated.emit();
}
}