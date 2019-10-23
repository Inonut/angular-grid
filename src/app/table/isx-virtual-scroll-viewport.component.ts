import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Inject,
  Input,
  IterableDiffers,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {combineLatest, fromEvent, merge, ReplaySubject, Subject} from 'rxjs';
import {MatTable, MatTableDataSource} from '@angular/material';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {TableVirtualScrollStrategy} from './isx-virtual-scroll-viewport.service';

@Directive({
  selector: '[isxVirtualScrollViewport]',
  exportAs: 'isxVirtualScrollViewport',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})
export class IsxVirtualScrollViewportComponent<T> implements OnDestroy, AfterViewInit, OnInit, AfterContentInit, AfterContentChecked {
  private unsubscribe = new Subject();
  private updateGridStream = new Subject();
  resetDataSourceStream = new ReplaySubject<MatTableDataSource<T>>(1);

  private scrollTop = 0;
  private headerElList: Element[];
  private footerElList: Element[];

  viewPort: CdkVirtualScrollViewport;

  private range = 0;

  scrolledDataSource = new MatTableDataSource<T>();

  @Input()
  set dataSource(source: MatTableDataSource<T>) {
    this.host.dataSource = this.scrolledDataSource;
    this.resetDataSourceStream.next(source);
  }

  @Input() rowHeight = 30;

  @Output() fetchNextPage = new EventEmitter();

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

    this.viewPort = cdkVirtualScrollViewportRef.instance;
  }

/*  ngDoCheck() {
    console.log(performance.now());
  }*/

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let resizeStream = merge(fromEvent(window, 'resize'), this.updateGridStream)
        .pipe(
          startWith(null),
          takeUntil(this.unsubscribe),
          tap(() => {
            let gridHeight = this.viewPort.elementRef.nativeElement.clientHeight;

            this.range = Math.ceil(gridHeight / this.rowHeight) + TableVirtualScrollStrategy.BUFFER_SIZE / 2;
            this.scrollStrategy.setScrollHeight(this.rowHeight);
          })
        );

      let dataSource = this.resetDataSourceStream
        .pipe(
          takeUntil(this.unsubscribe),
          switchMap(source => source.connect()),
          takeUntil(this.unsubscribe),
        );

      combineLatest([dataSource, this.scrollStrategy.scrolledIndexChange, resizeStream])
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, scrolledindex]) => {

          // Determine the start and end rendered range
          const start = Math.max(0, scrolledindex - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
          const end = Math.min(data.length, scrolledindex + this.range);

          this.scrolledDataSource.data = data.slice(start, end);
          this.changeDetectorRef.detectChanges();
        });

      fromEvent(this.viewPort.elementRef.nativeElement, 'scroll')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event) => {
          this.scrollTop = this.viewPort.elementRef.nativeElement.scrollTop;
          this.updateHeaderAndFooterScroll()
        });

      this.scrollTop = this.viewPort.elementRef.nativeElement.scrollTop;

      this.viewPort.scrolledIndexChange
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(val => this.fetchNextPage.next(val));
    });

    this.headerElList = this.el.nativeElement.getElementsByClassName('mat-header-row');
    this.footerElList = this.el.nativeElement.getElementsByClassName('mat-header-row');
  }


  ngAfterContentChecked(): void {
    this.updateHeaderAndFooterScroll();
    this.viewPort.elementRef.nativeElement.scrollTop = this.scrollTop;
  }

  private updateRow(el: Element[]) {
    Array.from<Element>(el)
      .forEach(el => {
        // TODO: do it with transform on headers and content too; put headers into a div
        // el.style.transform = `translateX(-${this.viewPort.elementRef.nativeElement.scrollLeft}px)`
        el.scrollLeft = this.viewPort.elementRef.nativeElement.scrollLeft
      });
  }

  updateHeaderAndFooterScroll() {
    setTimeout(() => {
      this.updateRow(this.headerElList);
      this.updateRow(this.footerElList);
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
