import {
  formatValue,
  GenericChartModel
} from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class LineChartModel extends GenericChartModel {
  constructor(private isArea: boolean = false) {
    super();
  }

  buildData(data) {
    const chart: any = {
      type: 'serial',
      hideCredits: true,
      theme: 'light',
      marginTop: data.marginTop,
      marginBottom: data.marginBottom,
      marginRight: data.marginRight,
      marginLeft: data.marginLeft,
      valueAxes: [
        {
          axisAlpha: data.valueAxisAlpha,
          gridAlpha: data.valueGridAlpha,
          labelsEnabled: data.valueLabelsEnabled,
          unit: data.valueAxisUnit ? data.valueAxisUnit : '',
          unitPosition: data.valueAxisUnitPosition ? data.valueAxisUnitPosition : '',
          usePrefixes: true
        }
      ],
      categoryField: data.categoryField,
      categoryAxis: {
        axisAlpha: data.categoryAxisAlpha,
        gridAlpha: data.categoryGridAlpha,
        labelsEnabled: data.categoryLabelsEnabled,
        labelRotation: data.categoryAxis && data.categoryAxis.labelRotation ? data.categoryAxis.labelRotation : 0
      }
    };

    chart.dataProvider = data.data;
    chart.graphs = data.graph;

    chart.valueAxes[0].labelFunction = formatValue;

    if (!data.categoryLabelsColor) {
      chart.categoryAxis.color = 'transparent';
    }

    if (data.valueAxisValueMin || data.valueAxisValueMin === 0) {
      chart.valueAxes[0].minimum = data.valueAxisValueMin;
    }

    if (data.valueAxisValueMax) {
      chart.valueAxes[0].maximum = data.valueAxisValueMax;
    }

    if (data.balloonPointerOrientation) {
      chart.chartCursor = {
        valueLineEnabled: false,
        valueLineAlpha: 0,
        cursorColor: 'transparent',
        balloonPointerOrientation: 'horizontal'
      };
    }

    if (data.valueScrollbar) {
      chart.valueScrollbar = {
        oppositeAxis: false,
        offset: 50,
        scrollbarHeight: 20,
        dragIconWidth: 30,
        dragIconHeight: 30,
        backgroundAlpha: 0,
        selectedBackgroundAlpha: 0.1,
        selectedBackgroundColor: '#888888',
        graphFillAlpha: 0,
        graphLineAlpha: 0.5,
        selectedGraphFillAlpha: 0,
        selectedGraphLineAlpha: 1,
        autoGridCount: true
      };
    }

    if (data.chartScrollbar) {
      chart.chartScrollbar = {
        oppositeAxis: false,
        offset: 40,
        scrollbarHeight: 20,
        dragIconWidth: 30,
        dragIconHeight: 30,
        backgroundAlpha: 0,
        selectedBackgroundAlpha: 0.1,
        selectedBackgroundColor: '#888888',
        graphFillAlpha: 0,
        graphLineAlpha: 0.5,
        selectedGraphFillAlpha: 0,
        selectedGraphLineAlpha: 1,
        autoGridCount: true
      };
    }

    if (data.legend && Object.keys(data.legend).length) {
      chart.legend = data.legend;
    }

    return chart;
  }

  setData(activeChartType, id, config, index) {
    const configDefault = {
      categoryAxisAlpha: config.categoryAxisAlpha != null ? config.categoryAxisAlpha : 0,
      categoryGridAlpha: config.categoryGridAlpha != null ? config.categoryGridAlpha : 0,
      categoryLabelsEnabled: config.categoryLabelsEnabled != null ? config.categoryLabelsEnabled : false,
      categoryLabelsColor: config.categoryLabelsColor != null ? config.categoryLabelsColor : true,
      valueScrollbar: config.valueScrollbar != null ? config.valueScrollbar : false,
      valueAxisAlpha: config.valueAxisAlpha != null ? config.valueAxisAlpha : 0,
      valueGridAlpha: config.valueGridAlpha != null ? config.valueGridAlpha : 0.1,
      valueLabelsEnabled: config.valueLabelsEnabled != null ? config.valueLabelsEnabled : true,
      valueAxisUnit: config.valueAxisUnit != null ? config.valueAxisUnit : '',
      valueAxisUnitPosition: config.valueAxisUnitPosition != null ? config.valueAxisUnitPosition : 'right',
      chartCursor: config.chartCursor != null ? config.chartCursor : false,
      categoryField: config.categoryField != null ? config.categoryField : 'key',
      categoryAxis: config.categoryAxis != null ? config.categoryAxis : { labelRotation: 0 },
      marginTop: config.marginTop != null ? config.marginTop : 0,
      marginBottom: config.marginBottom != null ? config.marginBottom : 0,
      marginRight: config.marginRight != null ? config.marginRight : 0,
      marginLeft: config.marginLeft != null ? config.marginLeft : 0,
      width: config.width != null ? config.width : '100%',
      height: config.height != null ? config.height : '160px',
      legend: config.legend != null ? config.legend : null,
      id,
      divId: id.toString() + activeChartType,
      index
    };
    return configDefault;
  }

  getDataCache(chart, dataSet, config: any = {}) {
    const { isActual } = config;
    const chartCopy = JSON.parse(JSON.stringify(chart));
    const chartData = [];
    const graphData = [];
    const legendDataChart = [];
    let legendData;
    const isMultiple = chartCopy.yValues.length > 1;
    const values = chartCopy.yValues.map((superElement) => {
      return superElement.values.map((element) => {
        return element;
      });
    });
    const mergedValues = [].concat.apply([], values);
    const valueAxisLogarithmic = this.isLogarithmic(mergedValues);
    let isText = false;
    chartCopy.yValues.forEach((superElement, j) => {
      const valueField = superElement.text ? superElement.text : j.toString();
      if (j === 0) {
        isText = superElement.text ? true : false;
      }
      legendDataChart.push({
        title:
          chartCopy.yValues.length >= 10
            ? valueField.length >= 20
              ? valueField.substr(0, 20) + '...'
              : valueField
            : valueField,
        color: this.CSS_FOUR_COLORS_NAMES[j % this.CSS_FOUR_COLORS_NAMES.length]
      });
      superElement.values.forEach((element, i) => {
        if (chartData.length <= i) {
          const tempObj = {};
          (tempObj as any).key = chartCopy.xValues[i];
          tempObj[valueField] = element;
          chartData.push(tempObj);
        } else {
          chartData[i][valueField] = element;
        }
      });
      graphData.push({
        id: 'g' + valueField,
        bullet: 'round',
        bulletBorderAlpha: 1,
        bulletSize: 5,
        bulletAlpha: 0,
        useLineColorForBulletBorder: true,
        lineColor: valueField && this.CSS_FOUR_COLORS_NAMES[j % this.CSS_FOUR_COLORS_NAMES.length],
        fillAlphas: this.isArea ? 0.5 : 0, // FOR AREA OR LINE
        title: valueField,
        valueField,
        // colorField: 'color' + valueField,
        lineThickness: 2,
        balloonText: isText
          ? `<span style='font-size:12px;'>[[category]], [[title]]: <b>[[value]]</b>`
          : `<span style='font-size:12px;'>[[category]]: <b>[[value]]</b>`
      });
    });
    if (isMultiple && graphData.length <= 10 && isActual) {
      legendData = {
        align: 'left',
        position: 'bottom',
        markerSize: 10,
        marginTop: 20,
        valueWidth: 120,
        valueText: ``
      } as any;
      if (legendDataChart && legendDataChart.length > 0) {
        legendData.data = legendDataChart;
      }
    }
    const basicData = dataSet.find((chartDataSet) => {
      return chartDataSet.id === chartCopy.id;
    });
    const name = basicData ? basicData.title : '';
    return {
      name,
      data: chartData,
      graph: graphData,
      type: chartCopy.chartType,
      valueAxisLogarithmic,
      legend: legendData ? legendData : null
    };
  }

  copyDataCache(chart, id, index) {
    try {
      const yValues = chart['graphset'][0]['series'];
      const xValues = chart['graphset'][0]['scaleX']['values'];
      const chartType = chart['graphset'][0]['type'];
      return { yValues, xValues, chartType, id, index };
    } catch (error) {
      return { id, index };
    }
  }
}
