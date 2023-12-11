import {Injectable} from '@angular/core';
import {ChartData} from "chart.js/dist/types";
import {map, Observable, take, timer} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RandomDataService {


  constructor() {
  }

  public getDataSetLabels(): string[] {
    return Array.from({length: 5}).map(i => `Random Data Set ${i}`);
  }

  public getChartData(labels: string[], length = 100): Observable<ChartData> {
    return timer(0, 2000).pipe(
      take(10),
      map(_ => (
        {
          datasets: labels.map(label => ({
            data: Array.from({length: length}).map(() => Math.floor(Math.random() * 100)),
            label: label
          }))
        }
      )));
  }
}
