import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {ChartComponent} from "../chart/chart.component";
import {
  AppChartConfiguration,
  AppChartSettingsDialogData,
  AppChartSettingsDialogResult,
  DatasetWithColor
} from "../../model/models";
import {MatButtonModule} from "@angular/material/button";
import {ChartSettingsDialogComponent} from "../chart-settings-dialog/chart-settings-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject, Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {
  FinanceHistoricalApiService
} from "../../service/finance-historical-api/finance-historical-api.service";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
  MomentDateAdapter
} from "@angular/material-moment-adapter";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatBadgeModule} from "@angular/material/badge";
import {ChartData} from "chart.js/dist/types";

export const DATE_FORMAT = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'L',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartComponent, MatButtonModule, AsyncPipe, MatDatepickerModule, ReactiveFormsModule, MatFormFieldModule, MatMomentDateModule, MatIconModule, MatBadgeModule],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnDestroy {

  chartConfigurations = signal<AppChartConfiguration[]>([])
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  needToRefresh = signal<boolean>(false);

  private rangeDates$$ = new BehaviorSubject<[Date | null, Date | null]>([null, null]);
  rangeDates$ = this.rangeDates$$.asObservable();

  rangePicker: FormGroup;

  constructor(
    protected financeHistoricalApiService: FinanceHistoricalApiService,
    protected dialog: MatDialog,
    protected formBuilder: FormBuilder
  ) {
    this.rangePicker = this.formBuilder.group({
      startDate: [this.startDate()],
      endDate: [this.endDate()]
    });
  }

  ngOnDestroy() {
    this.rangeDates$$.complete();
  }

  addChart() {
    this.openChartSettingsDialog().subscribe((result: AppChartSettingsDialogResult) => {
      if (result) {
        this.chartConfigurations().push(this.updateConfigurationWithResult(result, {} as AppChartConfiguration));
      }
    });
  }

  editChart(chartConfiguration: AppChartConfiguration) {
    this.openChartSettingsDialog(chartConfiguration).subscribe((result: AppChartSettingsDialogResult) => {
      if (result) {
        this.updateConfigurationWithResult(result, chartConfiguration);
      }
    });
  }

  private updateConfigurationWithResult(result: AppChartSettingsDialogResult, conf: AppChartConfiguration): AppChartConfiguration {
    conf.title = result.title;
    conf.type = result.chartType;
    conf.dataSets = result.datasets;
    conf.data = this.getDailyChartData(result.datasets);
    return conf;
  }

  refreshCharts() {
    this.needToRefresh.set(false);
    this.rangeDates$$.next([this.startDate(), this.endDate()]);
  }

  private getDailyChartData(datasets: DatasetWithColor[]): Observable<ChartData> {
    return this.financeHistoricalApiService.getDailyData(this.rangeDates$, datasets);
  }

  deleteChart(chartConfig: AppChartConfiguration) {
    const index = this.chartConfigurations().indexOf(chartConfig);
    if (index > -1) {
      this.chartConfigurations().splice(index, 1);
    }
  }


  private openChartSettingsDialog(chartConfiguration?: AppChartConfiguration): Observable<AppChartSettingsDialogResult> {
    let data: AppChartSettingsDialogData = {
      dataSetOptions: this.financeHistoricalApiService.getDataSetLabels()
    };

    if (chartConfiguration) {
      data = {
        chartType: chartConfiguration.type,
        datasets: chartConfiguration.dataSets,
        title: chartConfiguration.title,

        ...data
      };
    }
    return this.dialog.open(ChartSettingsDialogComponent, {data, width: '600px'}).afterClosed()
  }

  startDateChanged(value: Date | null) {
    this.startDate.set(value);
    this.needToRefresh.set(true);
  }

  endDateChanged(value: Date | null) {
    this.endDate.set(value);
    this.needToRefresh.set(true);
  }
}
