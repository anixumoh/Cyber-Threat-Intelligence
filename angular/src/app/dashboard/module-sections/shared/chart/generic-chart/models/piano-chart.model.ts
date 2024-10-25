import {
	GenericChartModel,
	formatValue
} from 'app/dashboard/module-sections/shared/chart/generic-chart/models/generic-chart.model';

export class PianoChartModel extends GenericChartModel {
	yDatachart: any[] = [];
	limits: number[] = [0.25, 0.5, 0.75, 1];
	alphaChannel: number[] = [0.25, 0.4, 0.55, 0.7, 0.85];

	buildData(data) {
		let chart: any = {
			type: 'serial',
			hideCredits: true,
			columnWidth: 1,
			categoryField: 'key',
			marginTop: 0,
			marginBottom: data.marginBottom,
			marginRight: data.marginRight,
			marginLeft: data.marginLeft,
			valueAxes: [
				{
					stackType: 'regular',
					axisAlpha: 0,
					axisColor: '#FFFFFF',
					gridAlpha: 0,
					gridColor: '#FFFFFF',
					gridThickness: 20,
					maximum: this.yDatachart.length,
					minimum: 0,
					labelsEnabled: data.valueLabelsEnabled,
					labelFunction: data => this.labelFunction(data)
				}
			],
			categoryAxis: {
				gridPosition: 'start',
				axisAlpha: 0,
				axisColor: '#FFFFFF',
				gridAlpha: 0,
				gridColor: '#FFFFFF',
				position: 'left',
				gridThickness: 20,
				labelsEnabled: data.categoryLabelsEnabled
			}
		};

		chart.dataProvider = data.data;
		chart.graphs = data.graph;
		return chart;
	}

	labelFunction(data) {
		return this.yDatachart[data] ? this.yDatachart[data] : '';
	}

	setData(activeChartType, id, config, index = null, labelRotation = 0, unit = null) {
		let configDefault = {
			categoryLabelsEnabled: config.categoryLabelsEnabled != null ? config.categoryLabelsEnabled : false,
			valueLabelsEnabled: config.valueLabelsEnabled != null ? config.valueLabelsEnabled : false,
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

	colorCondition(value) {
		let index = this.limits.findIndex((limit, i) => {
			if (i == 0) {
				return value >= 0 && value < limit;
			} else {
				return value >= this.limits[i - 1] && value < limit;
			}
		});
		if (index == -1) {
			index = value >= this.limits[this.limits.length - 1] ? this.limits.length : -1;
		}
		return index != null ? index : 0;
	}

	setConditions(args) {
		this.limits = this.limits.map((limit, i) => {
			return args[i] ? args[i] : limit;
		});
	}

	getDataCache(chart, dataSet) {
		let chartCopy = JSON.parse(JSON.stringify(chart));
		let chartData = [];
		let graphData = [];
		this.yDatachart = chartCopy.yValues;
		this.setConditions(chartCopy.limits);
		chartCopy.xValues.forEach((xElement, j) => {
			let tempObj = {};
			(<any>tempObj).key = xElement;
			chartCopy.yValues.forEach((yElement, i) => {
				tempObj['value' + yElement] = chartCopy.values[i].values[j];
				tempObj['columnKey' + yElement] = 1;
				tempObj['color' + yElement] = this.CSS_FOUR_COLORS_NAMES[i % this.CSS_FOUR_COLORS_NAMES.length];
				tempObj['alpha' + yElement] = this.alphaChannel[this.colorCondition(chartCopy.values[i].values[j])];
			});
			chartData.push(tempObj);
		});
		chartCopy.yValues.forEach(yElement => {
			graphData.push({
				lineAlpha: 0,
				type: 'column',
				title: yElement,
				valueField: 'columnKey' + yElement,
				alphaField: 'alpha' + yElement,
				colorField: 'color' + yElement,
				balloonText: `<span style='font-size:12px;'>[[title]] [[category]]: <b>[[value${yElement}]]</b>`
			});
		});

		let basicData = dataSet.find(chartDataSet => {
			return chartDataSet.id == chartCopy.id;
		});
		let name = basicData ? basicData.title : '';
		return { name, data: chartData, graph: graphData, type: chartCopy.chartType };
	}

	getMaxValueDividedBy4(series: any[]): number {
		let maxValue = 0;
		series.forEach(serie => {
			serie.values.forEach(value => {
				if (maxValue < value) {
					maxValue = value;
				}
			});
		});
		return maxValue / 4;
	}

	copyDataCache(chart, id, index) {
		try {
			let values = chart['graphset'][0]['series'];
			let limitBase = this.getMaxValueDividedBy4(values);
			let limits = [limitBase, limitBase * 2, limitBase * 3, limitBase * 4];
			let xValues = chart['graphset'][0]['scaleX']['labels'];
			let yValues = chart['graphset'][0]['scaleY']['values'];
			let chartType = chart['graphset'][0]['type'];
			return { values, xValues, yValues, limits, chartType, id, index };
		} catch (error) {
			return { id, index };
		}
	}
}
