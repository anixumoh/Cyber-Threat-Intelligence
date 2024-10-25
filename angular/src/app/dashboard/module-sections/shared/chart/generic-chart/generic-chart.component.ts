import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-generic-chart',
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.scss']
})
export class GenericChartComponent implements OnInit, AfterViewInit, OnDestroy {
  onChanges = new ReplaySubject(1);
  @ViewChild('chartDiv') private chartDiv: ElementRef;
  @Input()
  set chartData(its) {
    if (its) {
      this.onChanges.next(its);
    }
  }
  chart: am4charts.XYChart;

  ngOnInit(): void {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
  }

  ngAfterViewInit() {
    this.onChanges.subscribe((charData: any) => {
      this.destroyChart();
      if (charData.type === 'piano') {
        this.initPianoChart(charData);
      } else {
        // type : 'bar' | 'area' | 'hbar'
        this.initChart(charData);
      }
    });
  }

  ngOnDestroy() {
    this.destroyChart();
  }

  destroyChart() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  initChart(charData) {
    const chart = am4core.create(this.chartDiv.nativeElement, am4charts.XYChart);

    const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'key';
    xAxis.renderer.cellStartLocation = 0.1;
    xAxis.renderer.cellEndLocation = 0.9;
    xAxis.renderer.grid.template.location = 0;

    const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;
    yAxis.tooltip.disabled = true;

    charData.graph.forEach((graph) => {
      chart.series.push(this.createSeries(charData, graph));
    });

    const tooltipColumns = Math.ceil(chart.series.length / 15);
    const tooltipHtml = Array.from(chart.series)
      .map((serie) => {
        const key = serie.dataFields.valueY;
        const color = serie.realFill.toString();
        return `
        <div>
          <span style="color: ${color}">●</span>
          <span>${chart.series.length > 1 ? `${key}:` : ''} {${key}}</span>
        </div>`;
      })
      .reverse()
      .join('\n');

    // Only first serie have tooltip with all data
    const firstSerie = chart.series.getIndex(0);
    firstSerie.tooltipHTML = `
    <div>
      <strong>{categoryX}</strong>
    </div>
    <div style="display: grid;grid-template-columns: repeat(${tooltipColumns}, 1fr);">
      ${tooltipHtml}
    </div>`;
    firstSerie.tooltip.getFillFromObject = false;
    if (chart.series.length > 10) {
      firstSerie.tooltip.fontSize = 12;
    }
    firstSerie.tooltip.background.fill = am4core.color('#fff');
    firstSerie.tooltip.label.fill = am4core.color('#000');

    chart.cursor = new am4charts.XYCursor();
    chart.data = charData.data;
    this.chart = chart;
  }

  initPianoChart(charData) {
    const chart = am4core.create(this.chartDiv.nativeElement, am4charts.XYChart);
    chart.padding(0, 0, 0, 0);
    chart.maskBullets = false;
    chart.leftAxesContainer.layout = 'vertical';

    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'key';
    xAxis.renderer.grid.template.disabled = true;

    charData.graph.forEach((graph) => {
      const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      yAxis.dataFields.category = graph.title;
      yAxis.renderer.grid.template.disabled = true;
      yAxis.renderer.inversed = true;
      yAxis.renderer.minGridDistance = 0;
      charData.data = charData.data.map((data) => {
        data[graph.title] = graph.title;
        return data;
      });

      const series = chart.series.push(new am4charts.ColumnSeries());
      series.yAxis = yAxis;
      series.dataFields.categoryX = 'key';
      series.dataFields.categoryY = graph.title;
      series.dataFields.value = `value${graph.title}`;

      const color = am4core.color(charData.data[0][graph.colorField]);
      const minColor = color.lighten(0.9);

      const colorInterface = new am4core.InterfaceColorSet();
      colorInterface.setFor('background', am4core.color(minColor));
      const bgColor = colorInterface.getFor('background');

      const columnTemplate = series.columns.template;
      columnTemplate.strokeWidth = 1;
      columnTemplate.strokeOpacity = 0.2;
      columnTemplate.stroke = bgColor;
      columnTemplate.tooltipText = "{value.workingValue.formatNumber('#.')}";
      columnTemplate.width = am4core.percent(100);
      columnTemplate.height = am4core.percent(50);

      series.heatRules.push({
        target: columnTemplate,
        property: 'fill',
        min: minColor,
        max: color
      });
    });

    chart.cursor = new am4charts.XYCursor();
    chart.data = charData.data;
    this.chart = chart;
  }

  createSeries(charData, graph) {
    const map = {
      bar: am4charts.ColumnSeries,
      hbar: am4charts.ColumnSeries,
      area: am4charts.LineSeries
    };
    const TypeSeries = map[charData.type] || am4charts.ColumnSeries;

    const series = new TypeSeries();
    series.dataFields.valueY = graph.valueField;
    series.dataFields.categoryX = 'key';
    series.name = graph.title;
    series.sequencedInterpolation = true;
    series.stacked = true;

    if (charData.type === 'area') {
      const interfaceColors = new am4core.InterfaceColorSet();
      const bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.stroke = interfaceColors.getFor('background');
      bullet.circle.strokeWidth = 2;
    }
    return series;
  }
}
