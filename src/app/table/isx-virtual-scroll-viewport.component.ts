import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Host,
  Inject,
  Input,
  IterableDiffers,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {combineLatest, fromEvent, merge, Subject} from 'rxjs';
import {MatTable, MatTableDataSource} from '@angular/material';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {startWith, takeUntil, tap} from 'rxjs/operators';
import {TableVirtualScrollStrategy} from './isx-virtual-scroll-viewport.service';

@Directive({
  selector: '[isxVirtualScrollViewport]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})
export class IsxVirtualScrollViewportComponent<T> implements OnDestroy, AfterViewInit, OnInit, AfterContentInit, AfterContentChecked {
  private unsubscribe = new Subject();
  private updateStream = new Subject();

  viewPort: CdkVirtualScrollViewport;

  private range = 0;
  private _rowHeight = 55;
  private _headerHeight = 63;

  scrolledDataSource = new MatTableDataSource<T>();
  origDataSource = new MatTableDataSource<T>();

  @Input()
  set dataSource(source: MatTableDataSource<T>) {
    this.host.dataSource = this.scrolledDataSource;
    this.origDataSource = source;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private _viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private _differs: IterableDiffers,
              private renderer: Renderer2,
              private el: ElementRef,
              @Inject(VIRTUAL_SCROLL_STRATEGY) public readonly scrollStrategy: TableVirtualScrollStrategy,
              @Host() private host: MatTable<T>,
              protected ngZone: NgZone) {
  }

  ngOnInit(): void {
    let portal = new CdkPortalOutlet(this.componentFactoryResolver, this._viewContainerRef);
    let cdkVirtualScrollViewport = new ComponentPortal(CdkVirtualScrollViewport);
    let cdkVirtualScrollViewportRef = portal.attachComponentPortal(cdkVirtualScrollViewport);
    this.renderer.appendChild(this.el.nativeElement, cdkVirtualScrollViewportRef.location.nativeElement);
    this.renderer.appendChild(cdkVirtualScrollViewportRef.instance._contentWrapper.nativeElement, this.host._rowOutlet.elementRef.nativeElement);
    // this.renderer.appendChild(cdkVirtualScrollViewportRef.instance._contentWrapper.nativeElement, this.el.nativeElement);

    this.viewPort = cdkVirtualScrollViewportRef.instance;
  }

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let resizeStream = merge(fromEvent(window, 'resize'), this.updateStream)
        .pipe(
          startWith(null),
          takeUntil(this.unsubscribe),
          tap(() => {
            // let gridHeight= this.el.nativeElement.clientHeight;
            let gridHeight = this.viewPort.elementRef.nativeElement.clientHeight;

            this.range = Math.ceil(gridHeight / this._rowHeight) + TableVirtualScrollStrategy.BUFFER_SIZE / 2;
            this.scrollStrategy.setScrollHeight(this._rowHeight, this._headerHeight);
          })
        );

      combineLatest([this.origDataSource.connect(), this.scrollStrategy.scrolledIndexChange, resizeStream])
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, scrolledindex]) => {

          // Determine the start and end rendered range
          const start = Math.max(0, scrolledindex - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
          const end = Math.min(data.length, scrolledindex + this.range);

          // Update the datasource for the rendered range of data
          // return value[0].slice(start, end);
          this.scrolledDataSource.data = data.slice(start, end);
          this.changeDetectorRef.detectChanges();
        });

      fromEvent(this.viewPort.elementRef.nativeElement, 'scroll')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event) => this.updateHeaderAndFooterScroll());
    });
  }


  ngAfterContentChecked(): void {
    this.updateHeaderAndFooterScroll()
  }

  updateHeaderAndFooterScroll() {
    Array.from<Element>(this.el.nativeElement.getElementsByClassName('mat-header-row'))
      .forEach(el => el.scrollLeft = this.viewPort.elementRef.nativeElement.scrollLeft);
    Array.from<Element>(this.el.nativeElement.getElementsByClassName('mat-footer-row'))
      .forEach(el => el.scrollLeft = this.viewPort.elementRef.nativeElement.scrollLeft);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
