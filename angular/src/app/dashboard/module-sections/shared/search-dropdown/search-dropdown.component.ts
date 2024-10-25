import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

export interface Options {
  value: string | number;
  label: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDropdownComponent implements OnInit, OnChanges {
  public isDropDownOpen: boolean = false;
  public dropdown: string = '';

  @Input() options: Options[] = [
    { value: '1', label: 'label 1' },
    { value: '2', label: 'label 2' }
  ];
  @Input() isPositionAbsolute = false;
  @Input() isLoading = false;
  @Input() isDisabled = false;
  @Input() placeholder = 'Select a element';
  @Input() labelText = '';
  @Input() set selected(user) {
    if (user) {
      const { username } = user;
      this.options.forEach((opt: any) => {
        opt.isActive = opt.label === username;
        if (opt.isActive) {
          this.ngZone.run(() => {
            this.selectedEvent.emit(opt.value);
          });
        }
      });
      this.dropdown = username;
    }
  }
  @Output() debounceSearchEvent = new EventEmitter();
  @Output() selectedEvent = new EventEmitter();

  constructor(private ngZone: NgZone, private eRef: ElementRef) {}

  ngOnInit() {
    this.initOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { options } = changes;
    if (options?.previousValue && options.currentValue.length !== options.previousValue.length) {
      this.initOptions();
    }
  }

  initOptions() {
    this.options?.forEach?.((opt) => {
      opt.isActive = false;
    });
  }

  debounceSearch($event) {
    this.ngZone.run(() => {
      // Bring event back inside Angular's zone
      this.debounceSearchEvent.emit($event);
    });
  }

  toggleDropdown() {
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  selectOption(evt: any, optionIndex: number) {
    this.options.forEach((opt: any, index: number) => {
      opt.isActive = optionIndex === index;
      if (opt.isActive) {
        this.ngZone.run(() => {
          // Bring event back inside Angular's zone
          this.selectedEvent.emit(opt.value);
        });
      }
    });
    this.toggleDropdown();
    this.dropdown = evt.target.innerHTML;
  }

  onFocus() {
    if (!this.isDropDownOpen) {
      this.toggleDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.isDropDownOpen) {
        this.toggleDropdown();
      }
    }
  }
}
