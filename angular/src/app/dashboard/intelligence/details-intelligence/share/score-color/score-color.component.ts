import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-score-color',
  templateUrl: './score-color.component.html',
  styleUrls: ['./score-color.component.scss'],
})

export class ScoreColorComponent implements OnInit {

  representedData: string;
  @Input() scoreData: number = 0;
  @Input() fixedDecimals: number = 0;
  @Input() rangeAndColor: any[] = [
    {
      range: [0, 4],
      color: '#00B18F'
    }, {
      range: [4, 7],
      color: '#EBCB00'
    }, {
      range: [7, 10],
      color: '#DC665A'
    },
  ]
  @Input() colors: any[] = []

  ngOnInit() {
    this.representedData = this.scoreData.toFixed(this.fixedDecimals)
  }

  setColor() {
    return this.rangeAndColor.find((element, index) => {
      if (index !== this.rangeAndColor.length - 1) {
        return this.scoreData < element.range[1] && this.scoreData >= element.range[0];
      }else{
        return this.scoreData <= element.range[1] && this.scoreData >= element.range[0];
      }
    }).color;


  }
}
