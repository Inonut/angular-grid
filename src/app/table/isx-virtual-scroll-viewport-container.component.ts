import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input, NgZone,
  OnDestroy, Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {TableVirtualScrollStrategy} from './table-vs-strategy';
import {combineLatest, fromEvent, merge, Subject} from 'rxjs';
import {startWith, takeUntil, tap} from 'rxjs/operators';

@Component({
  selector: 'isx-virtual-scroll-viewport-container',
  exportAs: 'isxVirtualScrollViewportContainer',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./isx-virtual-scroll-viewport-container.component.scss'],
  host: {
    'class': 'isx-virtual-scroll-viewport-container',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})
export class IsxVirtualScrollViewportContainerComponent implements AfterViewInit, OnDestroy {
  private unsubscribe = new Subject();
  private updateStream = new Subject();

  private range = 0;
  private _rowHeight = 30;
  private _headerHeight = 32;

  scrolledDataSource = new MatTableDataSource<any>();
  @Input() dataSource: MatTableDataSource<any>;

  @Input()
  set rowHeight(val: number) {
    this._rowHeight = val;
    this.updateStream.next();
  }

  @Input()
  set headerHeight(val: number) {
    this._headerHeight = val;
    this.updateStream.next();
  }

  constructor(@Inject(VIRTUAL_SCROLL_STRATEGY) public readonly scrollStrategy: TableVirtualScrollStrategy,
              private changeDetectorRef: ChangeDetectorRef,
              protected ngZone: NgZone,
              public renderer: Renderer2,
              private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let resizeStream = merge(fromEvent(window, 'resize'), this.updateStream)
        .pipe(
          startWith(null),
          takeUntil(this.unsubscribe),
          tap(() => {
            let gridHeight= this.el.nativeElement.clientHeight;

            this.range = Math.ceil(gridHeight / this._rowHeight) + TableVirtualScrollStrategy.BUFFER_SIZE / 2;
            this.scrollStrategy.setScrollHeight(this._rowHeight, this._headerHeight);
          })
        );

      combineLatest([this.dataSource.connect(), this.scrollStrategy.scrolledIndexChange, resizeStream])
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, scrolledindex]) => {

          // Determine the start and end rendered range
          const start = Math.max(0, scrolledindex - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
          const end = Math.min(data.length, scrolledindex + this.range);

          // Update the datasource for the rendered range of data
          // return value[0].slice(start, end);
          this.scrolledDataSource.data = data.slice(start, end);
        });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getOffsetToRenderedContentStart() {
    return this.scrollStrategy.getOffsetToRenderedContentStart();
  }
}
