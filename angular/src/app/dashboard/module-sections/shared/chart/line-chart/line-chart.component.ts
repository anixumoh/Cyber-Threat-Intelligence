import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit
} from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { OrganizationService } from '../../../../organization/organization.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4plugins_annotation from '@amcharts/amcharts4/plugins/annotation';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnDestroy, OnInit, AfterViewInit {
  protected activeModule: any;
  protected activeOrganization: any;
  amchart: am4charts.XYChart;
  chartSubscription: Subscription;
  organizationSubscription: Subscription;
  isChartTransparent = false;

  @Input()
  set chartData(chartData) {
    this.onChanges.next(chartData?.length ? chartData : this.generateEmptyGraph());
  }

  @ViewChild('exportButton') exportButton: ElementRef;
  @ViewChild('chartDiv') chartDiv: ElementRef;

  onChanges = new ReplaySubject(1);

  constructor(private cd: ChangeDetectorRef, private organizationService: OrganizationService) {
    if (!this.cd.detectChanges['destroyed']) {
      this.cd.markForCheck();
    }
  }

  ngOnDestroy() {
    this.onChanges.complete();
    if (this.amchart) {
      this.amchart.dispose();
    }
    if (this.organizationSubscription) {
      this.organizationSubscription.unsubscribe();
    }
    if (this.chartSubscription) {
      this.chartSubscription.unsubscribe();
    }
  }

  setTransparent(value: boolean) {
    this.isChartTransparent = value;
  }

  ngAfterViewInit() {
    this.onChanges.subscribe((chartData: any) => this.initAmChart(chartData));
  }

  generateEmptyGraph() {
    const chartData = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date(new Date().setDate(new Date().getDate() - i));
      chartData.push({
        date,
        value: 0
      });
    }
    return chartData;
  }

  initAmChart(chartData: { date: Date; value: number }[]) {
    if (this.amchart) {
      // Destroy any previous chart
      this.amchart.dispose();
    }

    const chart = am4core.create(this.chartDiv.nativeElement, am4charts.XYChart);
    chartData = chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
    chart.data = chartData;

    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());

    const valueAxis = new am4charts.ValueAxis();
    valueAxis.min = 0;
    chart.yAxes.push(valueAxis);

    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.container = this.exportButton.nativeElement;
    chart.exporting.timeoutDelay = 10000;
    chart.plugins.push(new am4plugins_annotation.Annotation());

    // Create series
    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'date';
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = '{valueY}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding(12, 12, 12, 12);

    // Bullets
    const interfaceColors = new am4core.InterfaceColorSet();
    const bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.stroke = interfaceColors.getFor('background');
    bullet.circle.strokeWidth = 2;

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.parent = chart.bottomAxesContainer;

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.snapToSeries = series;

    this.amchart = chart;
  }

  ngOnInit(): void {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;

    this.organizationSubscription = this.organizationService.getCurrentContext().subscribe((context) => {
      if (context) {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      }
    });
  }
}
