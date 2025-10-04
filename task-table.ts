import { Component, Input, OnInit } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import { TaskService,UserTask } from '../services/task';

@Component({
  standalone: true,
  selector: 'app-task-table',
  template: './task-table.html'
})

export class TaskTableComponent implements OnInit {
tasks: UserTask[] = [];

constructor(private taskService: TaskService) {}

ngOnInit(): void {
this.taskService.tasks$.subscribe((tasks) => {
this.tasks = tasks;
});
}

deleteTask(id: string) {
this.taskService.deleteTask(id);
}


}
