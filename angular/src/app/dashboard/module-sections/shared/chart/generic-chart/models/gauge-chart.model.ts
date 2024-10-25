import {
  GenericChartModel,
  formatValue,
} from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class GaugeChartModel extends GenericChartModel {
  yDatachart: any[] = [];

  buildData(data) {
    const chart: any = { type: 'gauge', hideCredits: true, height: '100%', balloon: { maxWidth: 100 } };
    chart.axes = [
      {
        axisAlpha: 0,
        tickAlpha: 0,
        labelsEnabled: false,
        startValue: 0,
        endValue: 100,
        startAngle: 0,
        endAngle: 360,
        bands: [
          { color: '#eee', startValue: 0, endValue: 100, radius: '100%', innerRadius: '75%' },
          {
            color: this.CSS_COLOR_CORPORATIVE[0],
            startValue: 0,
            endValue: data.percentage,
            radius: '100%',
            innerRadius: '75%',
            balloonText: data.tooltipText,
          },
        ],
      },
    ];
    chart.allLabels = [
      {
        text: `${data.data.toFixed(0)}`,
        y: '35%',
        size: data.data.toFixed(0) > 99999 ? 23 : 30,
        bold: true,
        color: this.CSS_COLOR_CORPORATIVE[0],
        align: 'center',
      },
      { text: data.text, y: '55%', size: 16, bold: true, color: '#1B2734', align: 'center' },
    ];

    return chart;
  }

  setData(activeChartType, id, config, index = null, unit = null) {
    const configDefault = {
      isMap: true,
      width: config.width != null ? config.width : '150px',
      height: config.height != null ? config.height : '150px',
      id,
      divId: id.toString() + activeChartType,
      index,
    };
    return configDefault;
  }

  getData(partOfTotal, percentage, text, tooltipText) {
    return {
      data: partOfTotal,
      percentage,
      text,
      tooltipText,
    };
  }
}
