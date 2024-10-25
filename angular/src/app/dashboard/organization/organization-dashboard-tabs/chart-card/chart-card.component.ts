import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { LargeTextComponent } from '../../../../shared/components/large-text.component';
import { UserAccountService } from '../../../user/account.service';
import { Store } from '../../../../services/store/store';

interface ChartState {
  id: string;
  perDay: number;
  perMonth: number;
  perYear: number;
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  buildData: any;
  isLoading: boolean;
  isError: boolean;
  isDataPresent: boolean;
}

@Component({
  selector: 'app-chart-card',
  templateUrl: `./chart-card.component.html`,
  styleUrls: ['./chart-card.component.scss'],
})
export class ChartCardComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() title: string;
  @Input() height: number;
  @Input() orgId: number;
  @Input() chartState: Partial<ChartState>;
  @Output() expandCallBack = new EventEmitter();
  @Output() downloadCallBack = new EventEmitter();
  @ViewChild(LargeTextComponent) cardShrinkText: LargeTextComponent;
  isEditIconVisible = false;
  isEditHeaderVisible = false;
  newChartTitleCtrl = new UntypedFormControl('');
  cardStyle = { borderColor: '#e6e6e6', background: '#F0F1F2', color: '#000' };
  state;
  currentChartPreference = null;
  private readonly destroy$ = new Subject<void>();

  constructor(private renderer: Renderer2, private userAccountService: UserAccountService, private store: Store) {}

  ngOnInit() {
    this.getStoreUserStatus();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleEditIconVisibility() {
    if (this.isEditHeaderVisible || this.chartState?.isLoading) {
      return;
    }
    this.isEditIconVisible = !this.isEditIconVisible;
  }

  toggleEditHeader() {
    this.isEditHeaderVisible = !this.isEditHeaderVisible;
    if (this.isEditHeaderVisible) {
      this.isEditIconVisible = true;
    } else {
      if (this.isNewTitleValid()) {
        this.onSetNewCardTitle();
      } else if (this.isTitleFormValueEmpty) {
        this.newChartTitleCtrl.setValue(this.currentChartPreference.title || this.title);
      }
    }
  }

  isNewTitleValid() {
    return !this.isTitleFormValueEmpty() && this.newChartTitleCtrl.value !== this.currentChartPreference?.title;
  }

  isTitleFormValueEmpty() {
    return !this.newChartTitleCtrl.value.trim().length;
  }

  setOrUpdateCurrentPreferenceValue(keyValuePair: any[]) {
    const chartCardId = this.getChartIdBaseOnTitle();
    const state = this.state.modules[this.orgId].dashboard.charts?.length
      ? this.state.modules[this.orgId].dashboard.charts
      : [];
    const chartPreference = [...state];
    if (!!this.currentChartPreference) {
      this.currentChartPreference[keyValuePair[0]] = keyValuePair[1];
    } else {
      chartPreference.push({ id: chartCardId, [keyValuePair[0]]: keyValuePair[1] });
    }
    this.userAccountService.setDashboardCardColorPreset(this.orgId, chartPreference);
  }

  onSetNewCardTitle() {
    this.setOrUpdateCurrentPreferenceValue(['title', this.newChartTitleCtrl.value]);
  }

  onSetColor(color: string) {
    if (color === this.currentChartPreference?.color) {
      return;
    }
    this.setCardStyle(color);
    this.setOrUpdateCurrentPreferenceValue(['color', color]);
  }

  setCardStyle(colorSet?: string) {
    const { background, color, borderColor } = this.cardStyle;
    this.cardStyle = {
      borderColor: colorSet || borderColor,
      background: colorSet || background,
      color: ['rgb(223, 223, 223)', 'rgb(255, 209, 0)', '#F0F1F2'].includes(colorSet || color) ? 'black' : 'white',
    };
  }

  getChartIdBaseOnTitle() {
    return this.title.toLowerCase().split(' ').join('-');
  }

  onClickExpandBtn() {
    this.expandCallBack.emit(this.chartState);
  }
  onClickDownloadBtn() {
    this.downloadCallBack.emit(this.chartState);
  }
  get isExpandBtnVisible() {
    return !!this.expandCallBack.observers.length;
  }
  get isDownloadBtnVisible() {
    return !!this.downloadCallBack.observers.length;
  }
  get isDisabled() {
    return (
      this.chartState?.isError ||
      this.chartState?.isLoading ||
      !this.chartState?.isDataPresent ||
      this.isEditHeaderVisible
    );
  }

  getStoreUserStatus() {
    const chartCardId = this.getChartIdBaseOnTitle();
    this.store
      .select('userStateList')
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((state: any) => {
        this.state = state;
        this.currentChartPreference =
          state.modules[this.orgId]?.dashboard?.charts?.length &&
          state.modules[this.orgId]?.dashboard?.charts?.find((chart) => chart.id === chartCardId);
        this.setCardStyle(this.currentChartPreference?.color || this.cardStyle.background);
        this.newChartTitleCtrl.setValue(this.currentChartPreference?.title || this.title);
      });
  }

  ngAfterViewInit() {
    const cardTitleRef = this.cardShrinkText.textWrapper.nativeElement;
    this.renderer.listen(cardTitleRef, 'mouseenter', () => this.toggleEditIconVisibility());
    this.renderer.listen(cardTitleRef, 'mouseleave', () => this.toggleEditIconVisibility());
  }
}
