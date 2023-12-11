import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChartSettingsDialogComponent} from './chart-settings-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {ChartType} from "chart.js";
import {AppChartSettingsDialogData} from "../../model/models";

describe('ChartSettingsDialogComponent', () => {
  let component: ChartSettingsDialogComponent;
  let fixture: ComponentFixture<ChartSettingsDialogComponent>;
  let data: AppChartSettingsDialogData = {dataSetOptions: ['Option1', 'Option2']};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSettingsDialogComponent, NoopAnimationsModule, MatDialogModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: MatDialogRef,
          useValue: {close: () => {}},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChartSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls and properties', () => {
    expect(component.formGroup).toBeDefined();
    expect(component.selectedChartType()).toBeNull();
    expect(component.selectedDatasets()).toBeNull();
    expect(component.title()).toBeNull();
    expect(component.isEditMode).toBeFalse();
  });

  it('should populate form controls in edit mode', () => {
    const newData = {
      dataSetOptions: ['Option1', 'Option2'],
      datasets: [{label: 'Option1', color: ''}],
      chartType: 'line' as ChartType,
      title: 'Chart Title',
    };

    fixture = TestBed.createComponent(ChartSettingsDialogComponent);
    component = fixture.componentInstance;
    component.data = newData;
    fixture.detectChanges();

    expect(component.selectedChartType()).toEqual('line');
    expect(component.selectedDatasetLabels()).toEqual(['Option1']);
    expect(component.title()).toEqual('Chart Title');
    expect(component.isEditMode).toBeTrue();
  });

  it('should close the dialog with the correct result', () => {
    spyOn(component.dialogRef, 'close');
    component.selectedChartType.set('line');
    component.selectedDatasets.set([{label: 'Option1', color: 'color'}]);
    component.title.set('Chart Title');
    component.close();

    expect(component.dialogRef.close).toHaveBeenCalledWith({
      chartType: 'line',
      datasets: [{label: 'Option1', color: 'color'}],
      title: 'Chart Title',
    });

  });


});
