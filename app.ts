import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet,RouterLink,RouterLinkActive } from '@angular/router';
import { TodoComponent } from './todo/todo'; 
import { TaskCreateComponent } from './task-create/task-create';
import { TaskTableComponent } from './task-table/task-table';
import { CalendarComponent } from './calendar/calendar';
import { AgendaService, DayService, MonthAgendaService, MonthService, RecurrenceEditorModule, ScheduleComponent, WeekService, YearService } from '@syncfusion/ej2-angular-schedule';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RecurrenceEditorModule,CommonModule, TodoComponent, RouterOutlet,RouterLink,RouterLinkActive,TaskCreateComponent,TaskTableComponent,CalendarComponent],
    providers: [
      DayService,WeekService,MonthService,YearService,MonthAgendaService,AgendaService
    ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})

export class App {
  protected title = 'todo';

  showCalendar = false;


   toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }
}
