import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit, AfterViewInit, OnDestroy {
  amchart: am4charts.GaugeChart;
  onChanges = new ReplaySubject(1);

  @ViewChild('chartDiv') chartDiv: ElementRef;

  @Input()
  set gaugeData(it) {
    this.onChanges.next(it?.score || 0);
  }

  ngOnInit() {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
  }

  ngAfterViewInit() {
    this.onChanges.subscribe((score: number) => {
      this.initAmChart(score);
    });
  }

  ngOnDestroy() {
    this.onChanges.complete();
    this.destroyChart();
  }

  destroyChart() {
    if (this.amchart) {
      this.amchart.dispose();
    }
  }

  initAmChart(score: number) {
    this.destroyChart();

    const chart = am4core.create(this.chartDiv.nativeElement, am4charts.GaugeChart);
    chart.padding(0, 0, 0, 0);
    chart.hiddenState.properties.opacity = 0;
    chart.fontSize = 11;
    chart.innerRadius = am4core.percent(75);
    chart.startAngle = -90;
    chart.endAngle = 270;

    const axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    axis.min = 0;
    axis.max = 10;
    axis.renderer.inside = true;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(100);
    axis.renderer.labels.template.disabled = true;
    axis.renderer.ticks.template.disabled = true;
    axis.renderer.axisFills.template.disabled = true;
    axis.renderer.grid.template.disabled = true;

    const color = am4core.color(this.setGaugeColor(score));

    const range = axis.axisRanges.create();
    range.grid.disabled = true;
    range.axisFill.fill = color;
    range.axisFill.fillOpacity = 1;
    range.axisFill.zIndex = -1;
    range.value = 0;
    range.endValue = 10;

    const label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = '30px';
    label.fontWeight = 'bold';
    label.fontFamily = 'Open-sans';
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'middle';
    label.text = `[${color}]${score.toFixed(1)}[/]\n[font-size: 16px]Score[/]`;
    label.textAlign = 'middle';

    this.amchart = chart;
  }

  setGaugeColor(gaugeScore) {
    if (gaugeScore < 4 && gaugeScore >= 0) {
      return '#00B18F';
    } else if (gaugeScore < 7 && gaugeScore >= 4) {
      return '#EBCB00';
    } else {
      return '#DC665A';
    }
  }
}
