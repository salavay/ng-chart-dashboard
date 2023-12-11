import {ChartType, Color} from "chart.js";
import {ChartData} from "chart.js/dist/types";
import {Observable} from "rxjs";

export type AppChartConfiguration = {
  title: string;
  type: ChartType;
  dataSets: DatasetWithColor[];
  data: Observable<ChartData>;
}

export type AppChartSettingsDialogResult = {
  chartType: ChartType;
  datasets: DatasetWithColor[];
  title: string;
}

export type AppChartSettingsDialogData = {dataSetOptions: string[]} | {
  chartType: ChartType;
  datasets: DatasetWithColor[];
  title: string;

  dataSetOptions: string[];
}

export type DatasetWithColor = {
  label: string;
  color?: Color;
}

export type FinanceStockPriceData = {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
}
