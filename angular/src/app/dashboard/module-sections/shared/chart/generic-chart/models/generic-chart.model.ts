export class GenericChartModel {
  CSS_FOUR_COLORS_NAMES = ['#327ABD', '#DC665A', '#EBCB00', '#00B18F', '#1B2734', '#2E9EB8'];

  CSS_COLOR_CORPORATIVE = ['#2e9eb8', '#5cb4c8', '#8ac9d7'];

  constructor() {}

  isLogarithmic(values) {
    let maxValue = 0;
    let minValue = Infinity;

    values.forEach((value) => {
      if (maxValue < value) {
        maxValue = value;
      }
      if (minValue > value) {
        minValue = value;
      }
    });
    return maxValue / minValue >= 100;
  }
}

export function formatValue(value, formattedValue, valueAxis) {
  return value + (valueAxis.unit || '');
}

export function labelTextFormat(item, value) {
  const columnWidth = item.columnWidth;
  if (columnWidth <= 20) {
    return '';
  } else {
    return value;
  }
}

export function labelCategoryAxis(label, item, axis) {
  const chartTemp = axis.chart;
  if (chartTemp.realWidth <= 300 && label.length > 5) {
    return label.substr(0, 5) + '...';
  }
  if (chartTemp.realWidth <= 500 && label.length > 10) {
    return label.substr(0, 10) + '...';
  }
  return label;
}
