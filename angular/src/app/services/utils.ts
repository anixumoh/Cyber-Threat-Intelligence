import * as _ from 'lodash';
import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const { clone } = _;
/**
 * Convert number to hexadecimal color
 */
export const toHexColor = (number) => {
  let HTMLcolor;
  let intnumber = number - 0;
  const template = '#000000';
  const red = (intnumber & 0x0000ff) << 16;
  const green = intnumber & 0x00ff00;
  const blue = (intnumber & 0xff0000) >>> 16;

  intnumber = red | green | blue;
  HTMLcolor = intnumber.toString(16);
  HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;

  return HTMLcolor;
};

@Pipe({
  name: 'toHexColor',
})
export class ToHexColorPipe implements PipeTransform {
  transform(color: string): string {
    return toHexColor(color);
  }
}

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    this.sanitized.bypassSecurityTrustStyle(value);
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'safeHtmlStyle' })
export class SafeHtmlStylePipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustStyle(value);
  }
}

// export let ellipseString = (name: string,l:number) => {
//   if(name.length>l){
//       var sp = name.split("");
//       var lleft = Math.floor(l/2)-3;
//       var lright = Math.floor(l/2);
//       return sp.slice(0,lleft).join("")+"..."+sp.slice((sp.length-lright),sp.length).join("");
//     }
//     else{
//       return url;
//     }
// }

// @Pipe({
//   name: 'ellipseString'
// })
// export class EllipseStringPipe implements PipeTransform {
//   transform(name: string, l: number): string {

//   }
// }

/**
 * Zingchart to Chart.js PIE chart
 */
const convertToPieChart = (chart) => ({
  type: 'pie',
  data: {
    labels: chart.series.map((o) => o.text),
    datasets: [
      {
        data: chart.series.map((o) => o.values[0]),
        backgroundColor: chart.series.map((o) => o.backgroundColor),
      },
    ],
  },
  options: {
    responsive: false,
    mantainAspectRatio: true,
    legend: {
      display: true,
      position: 'left',
    },
    animation: {
      animateScale: true,
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const cData = data.datasets[tooltipItem.datasetIndex].data;
          const _meta = data.datasets[tooltipItem.datasetIndex]._meta;
          const meta = _meta[Object.keys(_meta)[0]];
          const ttLbl = data.labels[tooltipItem.index];
          const ttData = cData[tooltipItem.index];
          const ttPct = Math.round((ttData / meta.total) * 10000) / 100;

          return ttLbl + ': ' + ttData + ' (' + ttPct + '%)';
        },
      },
    },
  },
});

/**
 *  Zingchart to Chart.js chart
 */
const convertToChart = (chart) => ({
  type: changeType(chart),
  data: {
    labels: chart.scaleX.values ? chart.scaleX.values : chart.scaleX.labels,
    datasets: chart.series.map((o) => ({
      fill: true,
      backgroundColor: chart.type === 'bar' ? o.backgroundColor : o.backgroundColor + '50',
      borderColor: o.lineColor ? o.lineColor : o.backgroundColor,
      borderWidth: 1,
      borderJoinStyle: 'miter',
      lineTension: 0,
      pointBorderWidth: 0,
      pointHoverRadius: 0,
      pointHoverBorderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 10,
      data: o.values,
      label: chart.type === 'bar' || chart.type === 'area' ? o.text : null,
    })),
  },
  options: {
    legend: {
      //display: (chart.series.length > 1),
      display: false,
      position: 'right',
      labels: {
        boxWidth: 10,
        fontSize: 10,
        padding: 5,
      },
    },
    // aspectRatio: 2,
    animation: {
      animateScale: true,
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: false,
            fontSize: 2,
            fontColor: 'red',
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            fontSize: 2,
            fontColor: 'red',
          },
        },
      ],
    },
    responsive: true,
    mantainAspectRatio: true,
  },
});

function changeType(chart) {
  if (chart.type === 'area') {
    return (chart.type = 'line');
  }
  if (chart.type === 'hbar') {
    return (chart.type = 'bar');
  } else {
    return chart.type;
  }
}

/**
 * ZingChart to ChartJS
 */
export const zingchartToChartJS = (raw) =>
  raw.graphset[0].type === 'pie' ? convertToPieChart(raw.graphset[0]) : convertToChart(raw.graphset[0]);

// export const isLocalhost = window.location.hostname === 'localhost';
export const isLocalhost = false;
//export const isDevelopment = window.location.hostname === 'localhost';
/**
 * Move item in an array from index to index (Immutable way)
 * @param array
 * @param fromIndex
 * @param toIndex
 */
export const move = (array, fromIndex, toIndex) => {
  const arrayCopy = clone(array);
  arrayCopy.splice(toIndex, 0, arrayCopy.splice(fromIndex, 1)[0]);
  return arrayCopy;
};

export var getOrganizationAndModule = (url) => {
  var organizationId = url.split('/')[3];
  var moduleId = url.split('/')[5];
  if (moduleId && moduleId.indexOf('?') >= 0) {
    moduleId = moduleId.split('?')[0];
  }
  return { organizationId: organizationId, moduleId: moduleId };
};

@NgModule({
  declarations: [ToHexColorPipe],
  exports: [ToHexColorPipe],
})
export class UtilsModule {}
