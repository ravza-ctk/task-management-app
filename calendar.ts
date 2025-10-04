import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CellClickEventArgs,
  EventSettingsModel,
  DragEventArgs,
  ResizeEventArgs,
  ScheduleComponent,
  ScheduleModule,
  View
} from '@syncfusion/ej2-angular-schedule';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { FormsModule } from '@angular/forms';
import { TreeViewModule, DragAndDropEventArgs } from '@syncfusion/ej2-angular-navigations';
import { TaskService, UserTask } from '../services/task';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [ScheduleModule, CommonModule, FormsModule, TreeViewModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarComponent implements OnInit {
  constructor(private taskService: TaskService) {}

  @ViewChild('scheduleObj') public scheduleInstance!: ScheduleComponent;

  title = 'myTodo';
  public setView: View = 'Week';
  public setDate: Date = new Date();
  public localData: any[] = [];

  public eventObject: EventSettingsModel = {
    dataSource: this.localData,
    allowEditing: true,
    //allowDragDrop: true,
    //allowResizing: true
  };

  public showCustomPopup = false;

  public quickInfoTemplates: any;
  @ViewChild('header', { static: true }) headerTemplate: any;
  @ViewChild('content', { static: true }) contentTemplate: any;
  @ViewChild('footer', { static: true }) footerTemplate: any;

  public newTask: any = {
    Subject: '',
    StartTime: '',
    EndTime: '',
    Category: '',
    Description: ''
  };

  ngOnInit() {
    this.quickInfoTemplates = {
      header: this.headerTemplate,
      content: this.contentTemplate,
      footer: this.footerTemplate
    };

    // Takvim açıldığında görev listesinden verileri al
    this.taskService.tasks$.subscribe((tasks: UserTask[]) => {
      this.localData = tasks.map(task => ({
        Id: task.id,
        Subject: task.title,
        StartTime: new Date(task.dueDate),
        EndTime: new Date(task.dueDate),
        Description: task.description
      }));
      this.eventObject = { ...this.eventObject, dataSource: [...this.localData] };
      this.scheduleInstance?.refreshEvents();
    });
  }

  addTask() {
    const startDateTime = new Date(this.newTask.StartDate + 'T' + (this.newTask.StartTime || '00:00'));
    const endDateTime = new Date(this.newTask.EndDate + 'T' + (this.newTask.EndTime || '00:00'));

    const id = crypto.randomUUID(); // her event için benzersiz ID

    const newEvent = {
      Id: id,
      Subject: this.newTask.Subject,
      StartTime: startDateTime,
      EndTime: endDateTime,
      IsAllDay: this.newTask.IsAllDay || false,
      RecurrenceRule: this.newTask.RecurrenceRule || null,
      Category: this.newTask.Category || '',
      Description: this.newTask.Description || ''
    };

    // Takvime ekle
    this.localData.push(newEvent);
    this.eventObject = { ...this.eventObject, dataSource: [...this.localData] };
    this.scheduleInstance.refreshEvents();


    this.taskService.addTask({
  id,
  title: this.newTask.Subject,
  description: this.newTask.Description,
  dueDate: startDateTime.toISOString(), 
  priority: this.newTask.Category || 'normal'
});



    this.newTask = {
      Subject: '',
      StartDate: '',
      StartTime: '',
      EndDate: '',
      EndTime: '',
      IsAllDay: false,
      RecurrenceRule: '',
      Category: '',
      Description: ''
    };

    this.cancelPopup(); // popup’ı kapat
  }

  onPopupOpen(args: any): void {
    args.cancel = true;

    if (args.type === 'Editor' && args.data) {
      this.newTask = {
        Id: args.data.Id,
        Subject: args.data.Subject,
        StartDate: this.formatDate(args.data.StartTime),
        StartTime: this.formatTime(args.data.StartTime),
        EndDate: this.formatDate(args.data.EndTime),
        EndTime: this.formatTime(args.data.EndTime),
        IsAllDay: args.data.IsAllDay,
        Category: args.data.Category,
        Description: args.data.Description,
        RecurrenceRule: args.data.RecurrenceRule || ''
      };
    } else if (args.type === 'QuickInfo' && args.data) {
      this.newTask = {
        Id: null,
        Subject: '',
        StartDate: this.formatDate(args.data.StartTime),
        StartTime: this.formatTime(args.data.StartTime),
        EndDate: this.formatDate(args.data.EndTime),
        EndTime: this.formatTime(args.data.EndTime),
        IsAllDay: args.data.IsAllDay || false,
        Category: '',
        Description: '',
        RecurrenceRule: ''
      };
    }

    this.showCustomPopup = true;
  }

  formatDate(date: Date): string {
    return new Date(date).toISOString().substring(0, 10);
  }

  formatTime(date: Date): string {
    return new Date(date).toTimeString().substring(0, 5);
  }

  public treeFields: Object = {
    dataSource: [
      { id: 1, name: 'New Task 1' },
      { id: 2, name: 'New task 2' }
    ],
    id: 'id',
    text: 'name'
  };

  cancelPopup() {
    this.showCustomPopup = false;
  }

  onAllDayToggle() {
    if (this.newTask.IsAllDay) {
      this.newTask.StartTime = '';
      this.newTask.EndTime = '';
    }
  }

  onDragStart(args: DragEventArgs): void {
    if (args.scroll) {
      args.scroll.enable = true;
    }
  }

  onResizeStart(args: ResizeEventArgs): void {
    if (args.scroll) {
      args.scroll.enable = true;
    }
  }

  onTreeDragStop(args: DragAndDropEventArgs): void {
    let cellData = this.scheduleInstance.getCellDetails(args.target);
    const eventData: { [key: string]: any } = {
      Subject: args.draggedNodeData['text'],
      StartTime: cellData.startTime,
      EndTime: cellData.endTime,
      IsAllDay: cellData.isAllDay
    };
    this.scheduleInstance.addEvent(eventData);
    this.scheduleInstance.refreshEvents();
  }

  onEventDragStop(args: DragEventArgs): void {
    const updatedEvent = args.data;
    const index = this.localData.findIndex((e: any) => e['Id'] === updatedEvent['Id']);
    if (index > -1) {
      this.localData[index] = updatedEvent;
      this.eventObject = { ...this.eventObject, dataSource: [...this.localData] };
      this.scheduleInstance.refreshEvents();
    }
  }

  onEventResizeStop(args: ResizeEventArgs): void {
    const updatedEvent = args.data;
    const index = this.localData.findIndex((e: any) => e['Id'] === updatedEvent['Id']);
    if (index > -1) {
      this.localData[index] = updatedEvent;
      this.eventObject = { ...this.eventObject, dataSource: [...this.localData] };
      this.scheduleInstance.refreshEvents();
    }
  }
}







