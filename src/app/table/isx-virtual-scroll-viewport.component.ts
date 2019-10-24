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
  resetDataSourceStream = new ReplaySubject<MatTableDataSource<T>>(1);
  scrollIntoViewStream = new Subject<T>();

  private scrollTop = 0;
  private headerElList: Element[];
  private footerElList: Element[];

  viewPort: CdkVirtualScrollViewport;
  scrolledDataSource = new MatTableDataSource<T>();

  @Input()
  set dataSource(source: MatTableDataSource<T>) {
    this.host.dataSource = this.scrolledDataSource;
    this.resetDataSourceStream.next(source);
  }

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

    let headerContainer = this.renderer.createElement('div');
    this.renderer.addClass(headerContainer, 'isx-table-header-container');
    this.renderer.insertBefore(this.el.nativeElement, headerContainer, cdkVirtualScrollViewportRef.location.nativeElement);
    this.renderer.appendChild(headerContainer, this.host._headerRowOutlet.elementRef.nativeElement);

    let footerContainer = this.renderer.createElement('div');
    this.renderer.addClass(footerContainer, 'isx-table-footer-container');
    this.renderer.appendChild(this.el.nativeElement, footerContainer);
    this.renderer.appendChild(footerContainer, this.host._footerRowOutlet.elementRef.nativeElement);


    this.viewPort = cdkVirtualScrollViewportRef.instance;
  }

  /*ngDoCheck() {
    console.log(performance.now());
  }*/

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      let resizeStream = fromEvent(window, 'resize')
        .pipe(
          startWith(null),
          takeUntil(this.unsubscribe),
          tap(() => this.scrollStrategy.updateContent())
        );

      let dataSource = this.resetDataSourceStream
        .pipe(
          takeUntil(this.unsubscribe),
          switchMap(source => source.connect()),
          takeUntil(this.unsubscribe)
        );

      combineLatest([dataSource, this.scrollStrategy.scrolledIndexChange, resizeStream])
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, scrolledindex]) => {
          this.scrolledDataSource.data = data.slice(this.scrollStrategy.start, this.scrollStrategy.end);
        });

      combineLatest([dataSource, this.scrollIntoViewStream])
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(([data, item]) => {
          setTimeout(() => {
            if(!this.scrolledDataSource.data.includes(item)) {
              this.viewPort.scrollToIndex(data.indexOf(item), 'auto');
            }

            setTimeout(() => {
              this.host._getRenderedRows(this.host._rowOutlet)[this.scrolledDataSource.data.indexOf(item)]
                .scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'nearest'});
            });
          });
        });

      fromEvent(this.viewPort.elementRef.nativeElement, 'scroll')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event) => {
          this.scrollTop = this.viewPort.elementRef.nativeElement.scrollTop;
          this.updateHeaderAndFooterScroll()
        });

      this.viewPort.scrolledIndexChange
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(val => this.fetchNextPage.next(val));
    });

    this.scrollTop = this.viewPort.elementRef.nativeElement.scrollTop;
    this.headerElList = this.el.nativeElement.getElementsByClassName('mat-header-row');
    this.footerElList = this.el.nativeElement.getElementsByClassName('mat-footer-row');
  }


  ngAfterContentChecked(): void {
    this.updateHeaderAndFooterScroll();
    this.viewPort.elementRef.nativeElement.scrollTop = this.scrollTop;
  }

  private updateRow(el: Element[]) {
    if(!el) {
      return;
    }

    Array.from<Element>(el)
      .forEach(el => this.renderer.setStyle(el, 'transform', `translateX(-${this.viewPort.elementRef.nativeElement.scrollLeft}px)`));
  }

  updateHeaderAndFooterScroll() {
    this.updateRow(this.headerElList);
    this.updateRow(this.footerElList);
  }

  scrollIntoView(item: T) {
    this.scrollIntoViewStream.next(item);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
