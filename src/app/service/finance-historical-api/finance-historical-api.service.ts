import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {DatePipe} from "@angular/common";
import {environment} from "../../../environments/environment";
import {map, Observable, Subject, switchMap, takeUntil} from "rxjs";
import {DatasetWithColor, FinanceStockPriceData} from "../../model/models";
import {ChartData, ChartDataset} from "chart.js";

@Injectable({
  providedIn: 'root'
})
export class FinanceHistoricalApiService implements OnDestroy {

  public static readonly BASE_URL = 'https://financialmodelingprep.com/api/v3/historical-chart/4hour/AAPL';

  private destroyed$ = new Subject<void>();

  constructor(
    protected http: HttpClient,
    public datePipe: DatePipe
  ) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public getDailyData(dateRange$: Observable<[Date | null, Date | null]>, dataSets: DatasetWithColor[]): Observable<ChartData> {
    if (dataSets.some(dataSet => !FINANCIAL_DATA_SETS.includes(dataSet.label as FINANCIAL_DATA_SET))) {
      throw new Error(`Invalid financial data set: ${dataSets.map(dataSet => dataSet.label).join(', ')}`);
    }

    return dateRange$.pipe(
      takeUntil(this.destroyed$),
      switchMap((dateRange) => this.getDailyDataFromApi(dateRange[0], dateRange[1], dataSets))
    );

  }

  public getDataSetLabels(): string[] {
    return FINANCIAL_DATA_SETS;
  }

  private getDailyDataFromApi(startDate: Date | null, endDate: Date | null, dataSets: DatasetWithColor[]): Observable<ChartData> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('from', this.formateDate(startDate));
    httpParams = httpParams.append('to', this.formateDate(endDate));
    httpParams = httpParams.append('apikey', environment.financialModelingPrepAPIKey);

    return this.http.get<any[]>(FinanceHistoricalApiService.BASE_URL, {params: httpParams})
      .pipe(
        map((data: any[]) => this.mapToFinanceStockPriceData(data)),
        map((data: FinanceStockPriceData[]) => this.getChartData(data, dataSets))
      );
  }

  private formateDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-dd-MM') || '';
  }

  private mapToFinanceStockPriceData(data: any[]): FinanceStockPriceData[] {
    return data.map((stockVal: any) => ({
      date: stockVal.date,
      open: stockVal.open,
      close: stockVal.close,
      low: stockVal.low,
      high: stockVal.high
    }));
  }

  private getChartData(data: FinanceStockPriceData[], dataSets: DatasetWithColor[]): ChartData {
    data.reverse();

    const labels = data.map((stockVal: FinanceStockPriceData) => stockVal.date);

    const chartDatasets: ChartDataset[] = [];
    for (const dataSet of dataSets) {
      const dataSetLabel = dataSet.label as FINANCIAL_DATA_SET;
      if (data?.length > 0 && dataSetLabel in data[0]) {
        chartDatasets.push({
          data: data.map((stockVal: FinanceStockPriceData) => stockVal[dataSetLabel]),
          label: dataSetLabel[0].toUpperCase() + dataSetLabel.slice(1),
          backgroundColor: dataSet.color,
          borderColor: dataSet.color,
        });
      }
    }

    return {
      labels: labels,
      datasets: chartDatasets
    }
  }
}

// keys of FinanceStockPriceData that are numbers
type FINANCIAL_DATA_SET = {
  [K in keyof FinanceStockPriceData]: FinanceStockPriceData[K] extends number ? K : never
}[keyof FinanceStockPriceData];

export const FINANCIAL_DATA_SETS: FINANCIAL_DATA_SET[] = ['open', 'close', 'low', 'high'];
