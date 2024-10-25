import { Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Edge, Node } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { NGX_COLOURS } from '../../styles/colours';

@Component({
  selector: 'visualization-tree',
  templateUrl: './visualization-tree.component.html',
  styleUrls: ['./visualization-tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VisualizationTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('tree_area') tree_area: ElementRef;
  @Input() graphData;
  @Input() settings;

  options = {
    showLegend: false,
    legendTitle: 'Legend',
    tooltipDisabled: true,
    colorSchemeName: 'flame',
    theme: 'light',
    width: 800,
    height: 500,
    minHeight: 600,
    realTimeData: false,
    fitContainer: true,
    orientation: 'LR',
    curveType: 'Linear',
    colorScheme: {
      domain: ['#428bca'],
    },
  };
  colorSets = NGX_COLOURS;
  chart;
  view: any[];
  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: this.options.orientation,
  };
  public curve: any = shape.curveLinear;
  constructor() {}

  public ngOnInit(): void {
    this.prepareSettings();
    this.setColorScheme();
  }

  ngAfterViewInit() {
    this.applyDimensions();
  }

  private prepareSettings() {
    for (const key in this.settings) {
      if (this.settings[key]) {
        this.options[key] = this.settings[key];
        if (key === 'orientation') {
          this.layoutSettings.orientation = this.options.orientation;
        }
      }
    }
  }

  setDynamicNodeClass(node) {
    const outvar = 'node';
    if (node) {
      return outvar + '-' + node.type;
    }
    return outvar;
  }

  applyDimensions() {
    this.view = [this.options.width, this.options.height];
    if (this.options.fitContainer) {
      // setting the view as undefined will take container full width by default
      // despite this option, the height is not set properly as wanted
      // we get the height and width from the container size
      const width = this.tree_area.nativeElement.offsetWidth - 10;
      const height = this.tree_area.nativeElement.offsetHeight - 10;
      if (width > 0 && height > 0) {
        this.view = [width, height];
      }
    }
  }

  private setColorScheme() {
    const name = this.options.colorSchemeName;
    this.options['colorScheme'] = this.colorSets.find((s) => s.name === name);
  }
}
