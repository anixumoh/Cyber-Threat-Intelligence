import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ColumnChartModel } from '../../../module-sections/shared/chart/generic-chart/models/column-chart.model';
import { LineChartModel } from '../../../module-sections/shared/chart/generic-chart/models/line-chart.model';
import { PieChartModel } from '../../../module-sections/shared/chart/generic-chart/models/pie-chart.model';
import { RadarChartModel } from '../../../module-sections/shared/chart/generic-chart/models/radar-chart.model';
import { PianoChartModel } from '../../../module-sections/shared/chart/generic-chart/models/piano-chart.model';
import { MapChartModel } from '../../../module-sections/shared/chart/generic-chart/models/map-chart.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrganizationDashboardTabsService } from '../organization-dashboard-tabs.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-dashboard-module-chart',
  templateUrl: `./dashboard-module-chart.component.html`,
  styleUrls: ['./dashboard-module-chart.component.scss']
})
export class DashboardModuleChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCard') chartCardEl: ElementRef;
  @Input() globalCharts: boolean;
  @Input() set childCharts(charts) {
    this.rawCharts = charts;
    if (charts?.some?.((chart) => Object.keys(chart.detail).length)) {
      this._childCharts = charts
        .map((chart, index) => {
          return this.getChart('actual', chart, index);
        })
        .filter(
          (chart) =>
            chart.detail.graph && chart.detail.data && chart.detail.graph.length > 0 && chart.detail.data.length > 0
        );
    } else if (Array.isArray(charts) && charts.length > 0 && charts[0].hasOwnProperty('globalChart')) {
      this._childCharts = charts;
    }
  }
  @Input() orgID: number;
  @Output() componentDidLoad = new EventEmitter();
  expandModal = false;
  chartHeight = 250;
  chartMapHeight = 500;
  marginsDefault = 15;
  isMultipleColor = true;
  columnChartModel: ColumnChartModel = new ColumnChartModel(false, this.isMultipleColor);
  isRotatedColumn = true;
  rotatedColumnChartModel: ColumnChartModel = new ColumnChartModel(this.isRotatedColumn, this.isMultipleColor);
  lineChartModel: LineChartModel = new LineChartModel();
  pieChartModel: PieChartModel = new PieChartModel();
  isAreaLine = true;
  areaLineChartModel: LineChartModel = new LineChartModel(this.isAreaLine);
  radarChartModel: RadarChartModel = new RadarChartModel();
  pianoChartModel: PianoChartModel = new PianoChartModel();
  mapChartModel: MapChartModel = new MapChartModel();
  chartsCached = [];
  expandChartData = {
    id: 'expandedChart',
    detail: null,
    title: '-',
    width: 0,
    marginLeft: 0,
    marginRight: 0,
    isLoading: true,
    isError: false,
    isDataPresent: false
  };
  _childCharts: any[];
  private rawCharts: any;
  private readonly destroy$ = new Subject<void>();

  constructor(private renderer: Renderer2, private organizationDashboardService: OrganizationDashboardTabsService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.componentDidLoad.emit(true);
  }

  getChart(chartType = 'actual', chart: any, index: number) {
    let chartExists = null;
    this.chartsCached.forEach((chartCopied: any, i) => {
      if (chartCopied.id === chart.id) {
        chartExists = i;
      }
    });
    const chartCache = this.setChartCache(chart.detail, chart.id, index);
    const chartUpdateDetail = {
      ...chart,
      ...{ detail: this.getDataFromCache(chartType, chartCache, [chart], chart.id, index) }
    };
    if (!chartExists) {
      this.chartsCached.unshift(chartCache);
    } else {
      this.chartsCached[chartExists] = chartCache;
    }
    return {
      ...chartUpdateDetail,
      ...(chartUpdateDetail.detail.buildData
        ? { isError: false, isDataPresent: true }
        : { isError: true, isDataPresent: false }),
      isLoading: false
    };
  }

  getDataFromCache(activeChartType = 'actual', chart, dataSet, id, index) {
    if (chart.chartType === 'bar') {
      const chartData = this.columnChartModel.getDataCache(chart, dataSet, { isActual: true });
      const config = this.setChartConfig(this.chartHeight, {
        categoryLabelsEnabled: true,
        autoWrap: true
      });
      const basicData = this.columnChartModel.setData(activeChartType, id, config, index);
      const buildData = this.columnChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'hbar') {
      const chartData = this.rotatedColumnChartModel.getDataCache(chart, dataSet);
      const config = this.setChartConfig(this.chartHeight, activeChartType);
      const basicData = this.rotatedColumnChartModel.setData(activeChartType, id, config, index);
      const buildData = this.rotatedColumnChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'line') {
      const config = this.setChartConfig(this.chartHeight, activeChartType);
      const chartData = this.lineChartModel.getDataCache(chart, dataSet, { isActual: true });
      const basicData = this.lineChartModel.setData(activeChartType, id, config, index);
      const buildData = this.lineChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'area') {
      const config = this.setChartConfig(this.chartHeight, activeChartType);
      const chartData = this.areaLineChartModel.getDataCache(chart, dataSet, { isActual: true });
      const basicData = this.areaLineChartModel.setData(activeChartType, id, config, index);
      const buildData = this.areaLineChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'pie') {
      const config = this.setChartConfig(this.chartHeight, { margins: 0 });
      const chartData = this.pieChartModel.getDataCache(chart, dataSet, { isActual: true });
      const basicData = this.pieChartModel.setData(activeChartType, id, config, index);
      const buildData = this.pieChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'radar') {
      const chartData = this.radarChartModel.getDataCache(chart, dataSet);
      const config = this.setChartConfig(this.chartHeight, activeChartType);
      const basicData = this.radarChartModel.setData(activeChartType, id, config, index);
      const buildData = this.radarChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'piano') {
      const chartData = this.pianoChartModel.getDataCache(chart, dataSet);
      const config = this.setChartConfig(this.chartHeight, {
        valueLabelsEnabled: true,
        categoryLabelsEnabled: true
      });
      const basicData = this.pianoChartModel.setData(activeChartType, id, config, index);
      const buildData = this.pianoChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else if (chart.chartType === 'zingchart.maps') {
      const chartData = this.mapChartModel.getDataCache(chart, dataSet);
      const config = this.setChartConfig(this.chartMapHeight, activeChartType);
      const basicData = this.mapChartModel.setData(activeChartType, id, config, index);
      const buildData = this.mapChartModel.buildData({ ...basicData, ...chartData });
      return { ...basicData, ...chartData, buildData };
    } else {
      return { id, index };
    }
  }

  setChartConfig(height = null, activeChartType = null, configArg: any = {}) {
    const {
      margins,
      marginLeft,
      marginRight,
      categoryLabelsEnabled,
      valueLabelsEnabled,
      categoryAxis,
      mapPadding,
      autoWrap,
      marginTop,
      marginBottom
    } = configArg;
    const marginsValue = margins != null ? margins : this.marginsDefault;
    const marginLeftValue = marginLeft != null ? marginLeft : marginsValue;
    const marginRightValue = marginRight != null ? marginRight : marginsValue;
    const marginTopValue = marginTop != null ? marginTop : marginsValue;
    const marginBottomValue = marginTop != null ? marginBottom : marginsValue;
    const categoryLabelsEnabledValue = categoryLabelsEnabled != null ? categoryLabelsEnabled : null;
    const valueLabelsEnabledValue = valueLabelsEnabled != null ? valueLabelsEnabled : null;
    const categoryAxisValue = categoryAxis != null ? categoryAxis : null;
    const mapPaddingValue = mapPadding != null ? mapPadding : null;
    const autoWrapValue = autoWrap != null ? autoWrap : null;
    if (activeChartType && activeChartType === 'actual') {
      const actualheaderWidth = this.getHeaderWidth(this.chartCardEl);
      return {
        height: '100%',
        marginTop: this.marginsDefault,
        marginBottom: 0,
        marginRight: marginRightValue,
        marginLeft: marginLeftValue,
        categoryLabelsEnabled: categoryLabelsEnabledValue,
        valueLabelsEnabled: valueLabelsEnabledValue,
        categoryAxis: categoryAxisValue,
        mapPadding: mapPaddingValue,
        balloonWidth: actualheaderWidth - 20,
        autoWrap: autoWrapValue
      };
    } else {
      return {
        height: (height - marginsValue).toString() + 'px',
        marginTop: marginTopValue,
        marginBottom: marginBottomValue,
        marginRight: marginsValue,
        marginLeft: marginsValue,
        mapPadding: mapPaddingValue,
        categoryLabelsEnabled: categoryLabelsEnabledValue,
        autoWrap: autoWrapValue
      };
    }
  }
  getHeaderHeight(header) {
    if (header && this.renderer.selectRootElement(header)) {
      return this.renderer.selectRootElement(header).nativeElement.offsetHeight;
    }
    return 0;
  }
  getHeaderWidth(header) {
    if (header && this.renderer.selectRootElement(header)) {
      return this.renderer.selectRootElement(header).nativeElement?.offsetWidth;
    }
    return 0;
  }
  setChartCache(chart, id, index) {
    let chartType;
    if (this.isGraphsetCorrect(chart)) {
      if (this.isShapesCorrect(chart)) {
        chartType = chart['graphset'][0]['shapes'][0]['type'];
        return this.copyDataChache(chartType, chart, id, index);
      } else {
        chartType = chart['graphset'][0]['type'];
        return this.copyDataChache(chartType, chart, id, index);
      }
    } else {
      return { id, index };
    }
  }

  isGraphsetCorrect(chart) {
    return chart['graphset'] && chart['graphset'].length === 1;
  }

  isShapesCorrect(chart) {
    return chart['graphset'][0]['shapes'] && chart['graphset'][0]['shapes'].length === 1;
  }

  copyDataChache(chartType, chart, id, index) {
    if (chartType === 'bar') {
      return this.columnChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'hbar') {
      return this.rotatedColumnChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'line') {
      return this.lineChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'area') {
      return this.areaLineChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'pie') {
      return this.pieChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'radar') {
      return this.radarChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'piano') {
      return this.pianoChartModel.copyDataCache(chart, id, index);
    } else if (chartType === 'zingchart.maps') {
      return this.mapChartModel.copyDataCache(chart, id, index);
    } else {
      return { id, index };
    }
  }

  openExpandModal(chart) {
    if (chart && !chart.isLoading && !chart.isError) {
      this.getChartForModal(chart.id, chart.title);
    }
  }

  closeExpandModal() {
    this.expandModal = false;
  }

  getChartForModal(id, title) {
    const chartCache = this.chartsCached.find((chart) => {
      return chart.id === id;
    });
    if (chartCache) {
      const chartUpdateDetail = {
        ...this.expandChartData,
        ...{ detail: this.getDataFromCache(null, chartCache, this.rawCharts, id, 'modal') }
      } as any;
      this.expandChartData = {
        ...chartUpdateDetail,
        title,
        ...(chartUpdateDetail.detail.buildData
          ? { isError: false, isDataPresent: true }
          : { isError: true, isDataPresent: false }),
        isLoading: false
      };
      this.expandModal = true;
    }
  }

  downloadChart(chart) {
    const id = chart.id;
    const name = chart.title ? chart.title.replace(/ /g, '_') : 'Untitled_chart';
    this.organizationDashboardService
      .downloadChart(this.orgID, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          FileSaver.saveAs(blob, `${name}.csv`);
        },
        (e) => {
          console.error('error', e);
        }
      );
  }
}
