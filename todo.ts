import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, UserTask } from '../services/task';
import { Observable, combineLatest, map, startWith, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './todo.html',
  styleUrls: ['./todo.scss'],
})
export class TodoComponent implements OnInit {
  todoForm!: FormGroup;
  filteredTodos$!: Observable<UserTask[]>;
  reminderTodos$!: Observable<UserTask[]>;

  public searchTerm = new BehaviorSubject<string>('');
  public activeTag = new BehaviorSubject<string>('');
  
  // ÇOKLU SEÇİM ÖZELLİĞİ EKLENDİ
  public selectedIds = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.todoForm = this.fb.group({
      title: [''],
      description: [''],
      dueDate: [''],
      priority: ['medium'],
      tags: [''],
    });

    const allTodos$ = this.taskService.tasks$

    this.filteredTodos$ = combineLatest([
      allTodos$,
      this.searchTerm,
      this.activeTag,
    ]).pipe(
      map(([todos, term, tag]) =>
        todos.filter((todo: UserTask) => {
          const matchesTitle = (todo.title || '').toLowerCase().includes((term || '').toLowerCase());
          const matchesTag = tag ? todo.tags?.includes(tag) : true;
          return matchesTitle && matchesTag;
        })
      )
    );

    this.reminderTodos$ = allTodos$.pipe(
      map(todos =>
        todos.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          const due = new Date(todo.dueDate).getTime();
          const now = Date.now();
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          return due > now && due - now <= threeDays;
        })
      )
    );
  }

  onSubmit(): void {
    if (this.todoForm.invalid || !this.todoForm.value.title) return;

   this.taskService.addTask({
  id: Date.now().toString(), // string olmalı
  title: this.todoForm.value.title,
  description: this.todoForm.value.description,
  dueDate: this.todoForm.value.dueDate ? new Date(this.todoForm.value.dueDate).toISOString() : '',
  completed: false,
  createdAt: new Date().toISOString(),
  priority: this.todoForm.value.priority,
  tags: this.todoForm.value.tags
    ? this.todoForm.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [],
});


    this.todoForm.reset({ priority: 'medium' });
  }

  // FİLTRELEME METODLARI
  performSearch(term: string): void { this.searchTerm.next(term); }
  filterByTag(tag: string): void { this.activeTag.next(tag); }
  clearTagFilter(): void { this.activeTag.next(''); }

  // GÖREV METODLARI
  toggleCompleted(todo: UserTask): void {
  this.taskService.updateTask({ ...todo, completed: !todo.completed });
}

deleteTodo(id: string): void {
  this.taskService.deleteTask(id);
}



  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  deleteSelected(): void {
    if (confirm(`${this.selectedIds.size} görevi silmek istediğinize emin misiniz?`)) {
      // Serviste deleteMultiple metodunun olması gerekir
      this.taskService.deleteMultiple(Array.from(this.selectedIds));
      this.selectedIds.clear();
    }
  }

  completeSelected(): void {
    if (confirm(`${this.selectedIds.size} görevi tamamlandı olarak işaretlemek istediğinize emin misiniz?`)) {
      // Serviste completeMultiple metodunun olması gerekir
      this.taskService.completeMultiple(Array.from(this.selectedIds));
      this.selectedIds.clear();
    }
  }
}