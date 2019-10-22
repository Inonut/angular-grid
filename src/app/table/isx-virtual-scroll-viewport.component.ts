import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef, ComponentFactoryResolver, ContentChild, ContentChildren,
  Directive, ElementRef,
  Host,
  IterableDiffers,
  NgZone,
  OnDestroy,
  OnInit, QueryList, Renderer2,
  ViewContainerRef
} from '@angular/core';
import {Subject} from 'rxjs';
import {MatTable} from '@angular/material';
import {CdkPortalOutlet, ComponentPortal, PortalOutlet} from '@angular/cdk/portal';
import {CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {CDK_TABLE_TEMPLATE, DataRowOutlet} from '@angular/cdk/table';
import {TableVirtualScrollStrategy} from './table-vs-strategy';

@Directive({
  selector: '[isxVirtualScrollViewport]',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})
export class IsxVirtualScrollViewportComponent<T> implements OnDestroy, AfterViewInit, OnInit, AfterContentInit {
  private unsubscribe = new Subject();
  viewPort: CdkVirtualScrollViewport;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private _viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private _differs: IterableDiffers,
              private renderer: Renderer2,
              private el: ElementRef,
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

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
