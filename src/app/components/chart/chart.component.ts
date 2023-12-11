import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgChartsModule} from "ng2-charts";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ChartType} from "chart.js";
import {ChartData} from "chart.js/dist/types";
import {AsyncPipe, NgIf} from "@angular/common";
import {Observable} from "rxjs";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    NgChartsModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    NgIf,
    MatProgressSpinnerModule
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {

  @Input({required: true}) data!: Observable<ChartData>;
  @Input({required: true}) type!: ChartType;
  @Input() title?: string;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();

  edit() {
    this.onEdit.emit();
  }

  delete() {
    const confirm = window.confirm('Are you sure you want to delete this chart?');
    if (confirm) {
      this.onDelete.emit();
    }
  }
}
