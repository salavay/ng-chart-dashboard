import { TestBed } from '@angular/core/testing';

import {FinanceHistoricalApiService} from './finance-historical-api.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {DatePipe} from "@angular/common";
import {BehaviorSubject, NEVER, Subject} from "rxjs";

describe('FinanceHistoricalApiService', () => {
  let service: FinanceHistoricalApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DatePipe, FinanceHistoricalApiService]
    });

    service = TestBed.inject(FinanceHistoricalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw invalid dataset error', () => {
    expect(() => service.getDailyData(NEVER, [{label: 'XXX', color: ''}])).toThrow(new Error('Invalid financial data set: XXX'));
  });

  it('should send request twice with BehaviorSubject', () => {
    let rangeSubject = new BehaviorSubject<[Date | null, Date | null]>([null, null]);

    service.getDailyData(rangeSubject, []).subscribe();

    httpMock.expectOne(() => true).flush([]);

    rangeSubject.next([new Date(), new Date()]);
    httpMock.expectOne(() => true).flush([]);

    expect().nothing();
  });

  it('should send request with dates', () => {
    let rangeSubject = new Subject<[Date | null, Date | null]>();

    service.getDailyData(rangeSubject, []).subscribe();

    let startDate = '2023-12-11';
    let endDate = '2023-12-15';
    rangeSubject.next([new Date(startDate), new Date(endDate)]);

    httpMock.expectOne((req) => {
      return req.url === FinanceHistoricalApiService.BASE_URL &&
        req.params.get('from') === '2023-11-12' &&
        req.params.get('to') === '2023-15-12'
    }).flush([]);

    expect().nothing();
  });

});
