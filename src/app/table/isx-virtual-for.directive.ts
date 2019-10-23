import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  DoCheck,
  Input,
  IterableDiffers,
  NgIterable,
  NgZone,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {CdkVirtualForOf, CdkVirtualForOfContext} from '@angular/cdk/scrolling';
import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {Observable, Subject} from 'rxjs';
import {IsxVirtualScrollViewportComponent} from './isx-virtual-scroll-viewport.component';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[isxVirtualFor]',
})
export class IsxVirtualForDirective<T> implements CollectionViewer, DoCheck, OnDestroy, AfterViewInit {
  private unsubscribe = new Subject();

  private virtualForDirective: CdkVirtualForOf<T>;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private _viewContainerRef: ViewContainerRef,
              private _template: TemplateRef<CdkVirtualForOfContext<T>>,
              private _differs: IterableDiffers,
              @Optional() private viewScroll: IsxVirtualScrollViewportComponent<T>,
              protected ngZone: NgZone) {
  }

  viewChange: Observable<ListRange>;

  ngAfterViewInit(): void {
    this.virtualForDirective = new CdkVirtualForOf<T>(this._viewContainerRef, this._template, this._differs, this.viewScroll.viewPort, this.ngZone);

    this.viewScroll.resetDataSourceStream
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((source) => {
        this.virtualForDirective.cdkVirtualForOf = source;
      });

  }

  ngDoCheck(): void {
    this.virtualForDirective && this.virtualForDirective.ngDoCheck();
  }

  ngOnDestroy(): void {
    this.virtualForDirective && this.virtualForDirective.ngOnDestroy();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
