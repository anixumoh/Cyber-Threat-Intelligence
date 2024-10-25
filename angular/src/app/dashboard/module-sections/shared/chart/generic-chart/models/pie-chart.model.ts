import { GenericChartModel } from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';
import { quantityConvert } from 'app/utils/functions';

export class PieChartModel extends GenericChartModel {
  buildData(data) {
    const comaReturn = (indexComa) => {
      return indexComa !== data.chartGroup.length - 1 ? ', ' : '';
    };
    const description =
      `<span style='font-size:12px;'>, composed by <br>` +
      data.chartGroup.reduce((acc, chart, index) => {
        return (
          acc +
          `<span style='font-size:12px;'>${chart.label}: <b>${quantityConvert(
            chart.value
          )}</b> (${chart.customPercent.toFixed(2)}%)` +
          comaReturn(index)
        );
      }, '');

    const chart: any = {
      type: 'pie',
      theme: 'light',
      hideCredits: true,
      marginTop: data.marginTop,
      marginBottom: data.marginBottom,
      marginRight: data.marginRight,
      marginLeft: data.marginLeft,
      startAngle: 90,
      groupPercent: data.percentLimit,
      groupedDescription: description,
      valueField: data.valueField,
      titleField: data.titleField,
      balloonText: data.balloonText,
      labelText: data.labelText,
      color: this.CSS_FOUR_COLORS_NAMES,
      outlineAlpha: 0.5,
      verticalPadding: 1,
      outlineColor: this.CSS_FOUR_COLORS_NAMES[this.CSS_FOUR_COLORS_NAMES.length - 1],
      brightnessStep: data.brightnessStep,
      pullOutOnlyOne: true,
      sequencedAnimation: false,
      balloon: { fixedPosition: true, maxWidth: data.balloonWidth != null ? data.balloonWidth : 200 },
    };
    chart.dataProvider = data.data;
    if (data.legend && Object.keys(data.legend).length) {
      chart.legend = data.legend;
    }
    return chart;
  }

  setData(activeChartType, id, config, index) {
    return {
      valueField: 'value',
      titleField: 'label',
      balloonText: `<span style='font-size:12px;'>[[title]]: <b>[[value]]</b> ([[percents]]%) [[description]]`,
      labelText: `[[percents]]%`,
      marginTop: config.marginTop != null ? config.marginTop : 0,
      marginBottom: config.marginBottom != null ? config.marginBottom : 0,
      marginRight: config.marginRight != null ? config.marginRight : 0,
      marginLeft: config.marginLeft != null ? config.marginLeft : 0,
      balloonWidth: config.balloonWidth != null ? config.balloonWidth : null,
      width: config.width != null ? config.width : '100%',
      height: config.height != null ? config.height : '160px',
      id,
      divId: id.toString() + activeChartType,
      index,
    };
  }

  getDataCache(chart, dataSet, config: any = {}) {
    const { isActual } = config;
    const chartCopy = JSON.parse(JSON.stringify(chart));
    const chartData = [];
    const chartGroup = [];
    let totalSum = 0;
    let legendData;
    const percentLimit = 5;
    chartCopy.values.forEach((superElement) => {
      totalSum += superElement.values[0];
    });

    chartCopy.values.forEach((superElement) => {
      const tempObj = {};
      ((tempObj as any).label =
        superElement.text.length < 15 ? superElement.text : superElement.text.substr(0, 15) + '...'),
        ((tempObj as any).value = superElement.values[0]);
      (tempObj as any).customPercent = (superElement.values[0] / totalSum) * 100;
      if ((tempObj as any).customPercent <= percentLimit) {
        chartGroup.push(tempObj);
      }
      chartData.push(tempObj);
    });

    chartData.sort((elementA, elementB) => {
      return elementB.value - elementA.value;
    });
    const basicData = dataSet.find((chartDataSet) => {
      return chartDataSet.id === chartCopy.id;
    });
    const name = basicData ? basicData.title : '';
    if (chartData.length - chartGroup.length + 1 <= 7 || (isActual && chartData.length - chartGroup.length + 1 <= 18)) {
      legendData = {
        position: 'absolute',
        bottom: 0,
        right: isActual ? -10 : 0,
        align: 'left',
        maxColumns: 1,
        markerSize: 10,
        marginTop: 20,
        valueWidth: 120,
        valueText: ``,
        autoMargins: false,
        marginRight: 150,
      } as any;
    }
    return {
      name,
      data: chartData,
      type: chartCopy.chartType,
      brightnessStep: (100 / chartCopy.values.length).toFixed(0),
      chartGroup,
      percentLimit,
      legend: legendData ? legendData : null,
    };
  }

  copyDataCache(chart, id, index) {
    try {
      const values = chart['graphset'][0]['series'];
      const chartType = chart['graphset'][0]['type'];
      return { values, chartType, id, index };
    } catch (error) {
      return { id, index };
    }
  }
}
