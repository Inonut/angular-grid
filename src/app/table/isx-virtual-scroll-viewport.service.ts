import { Injectable } from '@angular/core';
import {VirtualScrollStrategy, CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy} from '@angular/cdk/scrolling';
import { Subject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class TableVirtualScrollStrategy implements VirtualScrollStrategy {

  static BUFFER_SIZE = 20;

  private scrollHeight!: number;
  private readonly indexChange = new Subject<number>();

  private viewport: CdkVirtualScrollViewport;

  public scrolledIndexChange: Observable<number>;

  constructor() {
    this.scrolledIndexChange = this.indexChange.asObservable().pipe(distinctUntilChanged());
  }

  public attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.onDataLengthChanged();
    this.updateContent(viewport);
  }

  public detach(): void {
    this.indexChange.complete();
    this.viewport = null;
  }

  public onContentScrolled(): void {
    this.updateContent(this.viewport);
  }

  public onDataLengthChanged(): void {
    if (this.viewport) {
      this.viewport.setTotalContentSize(this.viewport.getDataLength() * this.scrollHeight);
    }
  }

  public onContentRendered(): void {
    // no-op
  }

  public onRenderedOffsetChanged(): void {
    // no-op
  }

  public scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this.viewport) {
      this.viewport.scrollToOffset(index * this.scrollHeight, behavior);
    }
  }

  public setScrollHeight(rowHeight: number) {
    this.scrollHeight = rowHeight;
    this.updateContent(this.viewport);
  }

  public getOffsetToRenderedContentStart() {
    if(this.viewport == null) {
      return 0;
    }

    return this.viewport.getOffsetToRenderedContentStart();
  }

  private updateContent(viewport: CdkVirtualScrollViewport) {
    if (this.viewport) {
      const newIndex = Math.max(0, Math.round(viewport.measureScrollOffset() / this.scrollHeight) - TableVirtualScrollStrategy.BUFFER_SIZE / 2);
      viewport.setRenderedContentOffset(this.scrollHeight * newIndex);
      this.indexChange.next(Math.round(viewport.measureScrollOffset() / this.scrollHeight) + 1);
    }
  }
}
