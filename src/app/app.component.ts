import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgChartsModule],
  providers: [],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
}
