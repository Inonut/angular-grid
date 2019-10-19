import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {TableVirtualScrollStrategy} from './table-vs-strategy';
import {combineLatest, fromEvent, Subject} from 'rxjs';
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

  static BUFFER_SIZE = 3;
  private range = 0;

  scrolledDataSource = new MatTableDataSource();

  @Input() dataSource: MatTableDataSource<any>;
  @Input() rowHeight = 30;
  @Input() headerHeight = 32;

  constructor(@Inject(VIRTUAL_SCROLL_STRATEGY) private readonly scrollStrategy: TableVirtualScrollStrategy,
              private changeDetectorRef: ChangeDetectorRef,
              private el: ElementRef) {}

  ngAfterViewInit(): void {
    let resizeStream = fromEvent(window, 'resize')
      .pipe(
        startWith(null),
        takeUntil(this.unsubscribe),
        tap(() => {
          let gridHeight= this.el.nativeElement.clientHeight;

          this.range = Math.ceil(gridHeight / this.rowHeight) + IsxVirtualScrollViewportContainerComponent.BUFFER_SIZE;
          this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);
        })
      );

    combineLatest([this.dataSource.connect(), this.scrollStrategy.scrolledIndexChange, resizeStream])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((value: any) => {

        // Determine the start and end rendered range
        const start = Math.max(0, value[1] - IsxVirtualScrollViewportContainerComponent.BUFFER_SIZE);
        const end = Math.min(value[0].length, value[1] + this.range);

        // Update the datasource for the rendered range of data
        // return value[0].slice(start, end);
        this.scrolledDataSource.data = value[0].slice(start, end);
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
