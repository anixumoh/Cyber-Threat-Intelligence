import {
  formatValue,
  GenericChartModel,
  labelCategoryAxis,
  labelTextFormat,
} from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class ColumnChartModel extends GenericChartModel {
  constructor(private isRotated: boolean = false, private multipleColors: boolean = false) {
    super();
  }

  buildData(data) {
    const chart: any = {
      type: 'serial',
      hideCredits: true,
      rotate: this.isRotated,
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
          usePrefixes: true,
        },
      ],
      categoryField: data.categoryField,
      categoryAxis: {
        axisAlpha: data.categoryAxisAlpha,
        gridAlpha: data.categoryGridAlpha,
        labelsEnabled: data.categoryLabelsEnabled,
        labelRotation: data.categoryAxis && data.categoryAxis.labelRotation ? data.categoryAxis.labelRotation : 0,
        autoWrap: data.autoWrap,
      },
      chartCursor: {
        categoryBalloonEnabled: false,
        cursorAlpha: 0,
        zoomable: false,
      },
    };

    chart.dataProvider = data.data;
    chart.graphs = data.graph;

    chart.valueAxes[0].labelFunction = formatValue;

    if (data.categoryAxis && data.categoryAxis.fontSize) {
      chart.categoryAxis.fontSize = data.categoryAxis.fontSize;
      chart.categoryAxis.labelFunction = labelCategoryAxis;
    }

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
        balloonPointerOrientation: 'horizontal',
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
        autoGridCount: true,
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
        autoGridCount: true,
      };
    }

    if (data.legend && Object.keys(data.legend).length) {
      chart.legend = data.legend;
    }
    return chart;
  }

  setData(activeChartType, id, config, index = null) {
    return {
      categoryAxisAlpha: config.categoryAxisAlpha != null ? config.categoryAxisAlpha : 1,
      categoryGridAlpha: config.categoryGridAlpha != null ? config.categoryGridAlpha : 0.07,
      categoryLabelsEnabled: config.categoryLabelsEnabled != null ? config.categoryLabelsEnabled : false,
      categoryLabelsColor: config.categoryLabelsColor != null ? config.categoryLabelsColor : true,
      valueLabelsEnabled: config.valueLabelsEnabled != null ? config.valueLabelsEnabled : true,
      valueScrollbar: config.valueScrollbar != null ? config.valueScrollbar : false,
      valueAxisAlpha: config.valueAxisAlpha != null ? config.valueAxisAlpha : 1,
      valueGridAlpha: config.valueGridAlpha != null ? config.valueGridAlpha : 0.07,
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
      autoWrap: config.autoWrap != null ? config.autoWrap : false,
      id,
      divId: id.toString() + activeChartType,
      index,
    };
  }

  getData(chart) {
    const chartCopy = JSON.parse(JSON.stringify(chart));
    const chartData = [];
    const graphData = [];

    const values = chartCopy.charts.map((element) => {
      return element.value;
    });
    const valueAxisLogarithmic = this.isLogarithmic(values);

    chartCopy.charts.forEach((element, i) => {
      const tempObj = {};
      (tempObj as any).key = element.key;
      (tempObj as any).color = this.CSS_FOUR_COLORS_NAMES[i % this.CSS_FOUR_COLORS_NAMES.length];
      tempObj[chartCopy.id.toString()] = element.value;
      chartData.push(tempObj);
    });

    graphData.push({
      id: 'g' + chartCopy.id.toString(),
      fillAlphas: 1,
      labelText: '[[value]]',
      labelFunction: labelTextFormat,
      lineAlpha: 0,
      lineColor: 'transparent',
      title: chartCopy.id.toString(),
      type: 'column',
      valueField: chartCopy.id.toString(),
      balloonText: `<span style='font-size:12px;'>[[category]]: <b>[[value]]</b>`,
      fillColorsField: 'color',
    });

    return { name, data: chartData, graph: graphData, valueAxisLogarithmic };
  }

  getDataCache(chart, dataSet, config: any = {}) {
    const { isActual } = config;
    const chartCopy = JSON.parse(JSON.stringify(chart));
    const chartData = [];
    const graphData = [];
    const legendDataChart = [];
    let legendData;
    let valueAxisLogarithmic = null;
    if (chartCopy.xValuesLabels) {
      valueAxisLogarithmic = false;
      let isText = false;
      if (chartCopy.yValues) {
        chartCopy.yValues.forEach((superElement, j) => {
          const valueField = superElement.text ? superElement.text : j.toString();
          if (j === 0) {
            isText = !!superElement.text;
          }
          legendDataChart.push({
            title:
              chartCopy.yValues.length >= 10
                ? valueField.length >= 20
                  ? valueField.substr(0, 20) + '...'
                  : valueField
                : valueField,
            color: this.CSS_FOUR_COLORS_NAMES[j % this.CSS_FOUR_COLORS_NAMES.length],
          });
          if (superElement.values) {
            superElement.values.forEach((element, i) => {
              if (chartData.length <= i) {
                const tempObj = {};
                (tempObj as any).key = chartCopy.xValuesLabels[i];
                tempObj[valueField] = valueAxisLogarithmic ? (element === 0 ? 1 : element) : element;
                tempObj['color' + valueField] = this.CSS_FOUR_COLORS_NAMES[j % this.CSS_FOUR_COLORS_NAMES.length];
                chartData.push(tempObj);
              } else {
                chartData[i][valueField] = valueAxisLogarithmic ? (element === 0 ? 1 : element) : element;
                chartData[i]['color' + valueField] = this.CSS_FOUR_COLORS_NAMES[j % this.CSS_FOUR_COLORS_NAMES.length];
              }
            });
          }

          graphData.push({
            id: 'g' + valueField,
            fillAlphas: 1,
            labelText: '[[value]]',
            labelFunction: labelTextFormat,
            lineAlpha: 0,
            title: valueField,
            type: 'column',
            valueField,
            colorField: 'color' + valueField,
            balloonText: isText
              ? `<span style='font-size:12px;'>[[category]] [[title]]: <b>[[value]]</b>`
              : `<span style='font-size:12px;'>[[category]]: <b>[[value]]</b>`,
          });
        });
        if (graphData.length <= 10 && isActual) {
          legendData = {
            align: 'left',
            position: 'bottom',
            markerSize: 10,
            marginTop: 20,
            valueWidth: 120,
            valueText: ``,
          } as any;
          if (legendDataChart && legendDataChart.length > 0) {
            legendData.data = legendDataChart;
          }
        }
      }
    } else {
      const values = chartCopy.yValues[0].values.map((element) => {
        return element;
      });
      valueAxisLogarithmic = this.isLogarithmic(values);

      chartCopy.yValues[0].values.forEach((element, i) => {
        const tempObj = {};
        (tempObj as any).key = chartCopy.xValuesValues[i];
        (tempObj as any).color = this.CSS_FOUR_COLORS_NAMES[i % this.CSS_FOUR_COLORS_NAMES.length];
        tempObj[chartCopy.id.toString()] = valueAxisLogarithmic ? (element === 0 ? 1 : element) : element;
        chartData.push(tempObj);
      });

      graphData.push({
        id: 'g' + chartCopy.id.toString(),
        fillAlphas: 1,
        labelText: '[[value]]',
        labelFunction: labelTextFormat,
        labelPosition: 'top',
        lineAlpha: 0,
        title: chartCopy.id.toString(),
        type: 'column',
        valueField: chartCopy.id.toString(),
        balloonText: `<span style='font-size:12px;'>[[category]]: <b>[[value]]</b>`,
        fillColorsField: 'color',
      });
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
      legend: legendData ? legendData : null,
    };
  }

  copyDataCache(chart, id, index) {
    try {
      const yValues = chart['graphset'][0]['series'];
      const xValuesValues = chart['graphset'][0]['scaleX']['values'];
      const xValuesLabels = chart['graphset'][0]['scaleX']['labels'];
      const chartType = chart['graphset'][0]['type'];
      return { yValues, xValuesValues, xValuesLabels, chartType, id, index };
    } catch (error) {
      return { id, index };
    }
  }
}
