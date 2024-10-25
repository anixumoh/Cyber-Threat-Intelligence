import { GenericChartModel } from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class RadarChartModel extends GenericChartModel {
  buildData(data) {
    let chart: any = {
      type: 'radar',
      theme: 'light',
      hideCredits: true,
      marginTop: data.marginTop,
      marginBottom: data.marginBottom,
      marginRight: data.marginRight,
      marginLeft: data.marginLeft,
      colors: this.CSS_COLOR_CORPORATIVE,
      valueAxes: [
        {
          axisTitleOffset: 20,
          minimum: 0,
          axisAlpha: data.valueAxisAlpha,
        },
      ],
      categoryField: 'key',
    };

    chart.dataProvider = data.data;
    chart.graphs = data.graph;
    return chart;
  }

  setData(activeChartType, id, config, index) {
    let configDefault = {
      marginTop: config.marginTop != null ? config.marginTop : 0,
      marginBottom: config.marginBottom != null ? config.marginBottom : 0,
      marginRight: config.marginRight != null ? config.marginRight : 0,
      marginLeft: config.marginLeft != null ? config.marginLeft : 0,
      width: config.width != null ? config.width : '100%',
      height: config.height != null ? config.height : '160px',
      legend: config.legend != null ? config.legend : null,
      valueAxisAlpha: config.valueAxisAlpha != null ? config.valueAxisAlpha : 0,
      id,
      divId: id.toString() + activeChartType,
      index,
    };
    return configDefault;
  }

  getDataCache(chart, dataSet) {
    let chartCopy = JSON.parse(JSON.stringify(chart));
    let chartData = [];
    let graphData = [];
    if (chartCopy.yValues) {
      if (chartCopy.yValues[0].values) {
        chartCopy.yValues[0].values.forEach((element, i) => {
          let tempObj = {};
          (<any>tempObj).key = chartCopy.xValues[i];
          tempObj[chartCopy.id.toString()] = element;
          chartData.push(tempObj);
        });
      }
    }
    graphData.push({
      id: 'g' + chartCopy.id.toString(),
      title: chartCopy.id.toString(),
      valueField: chartCopy.id.toString(),
      lineThickness: 2,
      bullet: 'round',
      bulletBorderAlpha: 1,
      bulletSize: 5,
      bulletAlpha: 0,
      useLineColorForBulletBorder: true,
      balloonText: `<span style='font-size:12px;'>[[category]]: <b>[[value]]</b>`,
    });

    let basicData = dataSet.find((chartDataSet) => {
      return chartDataSet.id == chartCopy.id;
    });
    let name = basicData ? basicData.title : '';
    return { name, data: chartData, graph: graphData, type: chartCopy.chartType };
  }

  copyDataCache(chart, id, index) {
    try {
      let yValues = chart['graphset'][0]['series'];
      let xValues = chart['graphset'][0]['scaleK']['values']
        ? chart['graphset'][0]['scaleK']['values']
        : chart['graphset'][0]['scaleK']['labels'];
      let chartType = chart['graphset'][0]['type'];
      return { yValues, xValues, chartType, id, index };
    } catch (error) {
      return { id, index };
    }
  }
}
