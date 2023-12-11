import {Component, computed, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {AppChartSettingsDialogData, AppChartSettingsDialogResult, DatasetWithColor} from "../../model/models";
import {ChartType} from "chart.js";
import {FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn} from "@angular/forms";

@Component({
  selector: 'app-chart-settings-dialog',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './chart-settings-dialog.component.html',
  styleUrl: './chart-settings-dialog.component.scss'
})
export class ChartSettingsDialogComponent implements OnInit {
  title = signal<string | null>(null);
  selectedChartType = signal<ChartType | null>(null);
  allDatasetsOptions = signal<string[] | null>(null);

  selectedDatasets = signal<DatasetWithColor[] | null>(null);
  selectedDatasetLabels = computed(() => this.selectedDatasets()?.map(dataset => dataset.label) ?? []);
  selectedDatasetColors = computed(() => this.selectedDatasets()?.map(dataset => dataset.color) ?? []);

  formGroup!: FormGroup;

  isEditMode = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppChartSettingsDialogData,
    public dialogRef: MatDialogRef<ChartSettingsDialogComponent>,
    protected formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.allDatasetsOptions.set(this.data.dataSetOptions);

    if ('title' in this.data) {
      this.selectedDatasets.set(this.data.datasets);
      this.selectedChartType.set(this.data.chartType);
      this.title.set(this.data.title);
      this.isEditMode = true;
    }

    this.formGroup = this.formBuilder.group({
      title: [this.title()],
      selectedDatasetLabels: [this.selectedDatasetLabels()],
      selectedChartType: [this.selectedChartType()],
      dataSetColors: this.getForGroupForColors(this.selectedDatasets() || [])
    })
  }

  close() {
    let result: AppChartSettingsDialogResult = {
      chartType: this.selectedChartType() as ChartType,
      datasets: this.selectedDatasets() as DatasetWithColor[],
      title: this.title() as string
    };
    this.dialogRef.close(result)
  }

  onDataSetSelect(selectedVal: string[]) {
    const selectedDatasets = this.selectedDatasets()?.filter(dataSet => selectedVal.includes(dataSet.label)) || [];
    selectedDatasets.push(...selectedVal.filter(val => !this.selectedDatasetLabels().includes(val)).map(val => ({label: val, color: ''})));

    this.selectedDatasets.set(selectedDatasets);
    this.formGroup.setControl('dataSetColors', this.getForGroupForColors(selectedDatasets));
  }


  private getForGroupForColors(selectedDataSets: DatasetWithColor[]): FormGroup {
    const group = this.formBuilder.group({});
    selectedDataSets.forEach(dataset => {
      group.addControl('datasetColor-' + dataset.label, this.formBuilder.control(dataset.color, this.validateColor()));
    });
    return group;
  }

  private validateColor(): ValidatorFn {
    return (control) => {
      // TODO: I have no idea how to do this, but validation is working :)
      return null;
    }
  }
}
