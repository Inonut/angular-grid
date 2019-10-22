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
import {Observable} from 'rxjs';
import {IsxVirtualScrollViewportComponent} from './isx-virtual-scroll-viewport.component';

@Directive({
  selector: '[isxVirtualFor]',
})
export class IsxVirtualForDirective<T> implements CollectionViewer, DoCheck, OnDestroy, AfterViewInit {

  private dataSource: DataSource<T>;
  private virtualForDirective: CdkVirtualForOf<T>;
  private _isxVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined;

  @Input()
  set isxVirtualForOf(value: DataSource<T> | Observable<T[]> | NgIterable<T> | null | undefined) {
    this._isxVirtualForOf = value;
  }

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
    this.virtualForDirective.cdkVirtualForOf = this._isxVirtualForOf;
  }

  ngDoCheck(): void {
    this.virtualForDirective && this.virtualForDirective.ngDoCheck();
  }

  ngOnDestroy(): void {
    this.virtualForDirective && this.virtualForDirective.ngOnDestroy();
  }
}
