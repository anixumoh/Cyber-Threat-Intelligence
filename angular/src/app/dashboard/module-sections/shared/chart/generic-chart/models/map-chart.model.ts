import {
  GenericChartModel,
  formatValue,
} from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class MapChartModel extends GenericChartModel {
  buildData(data) {
    const chart: any = {
      type: 'map',
      theme: 'light',
      hideCredits: true,
      getAreasFromMap: true,
      dataProvider: { map: 'worldHigh', getAreasFromMap: true, areas: data.data },
      areasSettings: {
        rollOverOutlineColor: '#FFFFFF',
        rollOverColor: '#CC0000',
        alpha: 0.8,
        color: '#B4B4B7',
        autoZoom: true,
      },
    };

    return chart;
  }

  setData(activeChartType, id, config, index = null, labelRotation = 0, unit = null) {
    const configDefault = {
      isMap: true,
      width: config.width != null ? config.width : '100%',
      height: config.height != null ? config.height : '160px',
      legend: config.legend != null ? config.legend : null,
      id,
      divId: id.toString() + activeChartType,
      index,
    };
    return configDefault;
  }

  getDataCache(chart, dataSet) {
    const chartCopy = JSON.parse(JSON.stringify(chart));
    const chartData = chartCopy.areas;

    const basicData = dataSet.find((chartDataSet) => {
      return chartDataSet.id === chartCopy.id;
    });
    const name = basicData ? basicData.title : '';
    return { name, data: chartData, type: chartCopy.chartType };
  }

  convertWhiteToGrey(value) {
    if (value === '#ffffff') {
      return '#dddddd';
    }
    return value;
  }

  copyDataCache(chart, id, index) {
    try {
      const areasObj = chart['graphset'][0]['shapes'][0]['options']['style']['items'];
      let j = 0;
      const areas = [];
      for (const i in areasObj) {
        j++;
        areas.push({ id: i, color: this.convertWhiteToGrey(areasObj[i].backgroundColor) });
      }
      const chartType = chart['graphset'][0]['shapes'][0]['type'];
      return { areas, chartType, id, index };
    } catch (error) {
      return { id, index };
    }
  }
}
