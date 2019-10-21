import {
  AfterContentInit,
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  IterableDiffers,
  NgZone,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material';
import {Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {IsxVirtualScrollViewportContainerComponent} from './isx-virtual-scroll-viewport-container.component';

@Component({
  selector: 'isx-table, table[isx-table]',
  exportAs: 'isxTable',
  template: `
    <ng-content select="caption"></ng-content>
    <ng-container headerRowOutlet></ng-container>
    <isx-virtual-scroll-viewport-container [dataSource]="originalDataSource" [headerHeight]="headerHeight" [rowHeight]="rowHeight">
      <cdk-virtual-scroll-viewport (scrolledIndexChange)="fetchNextPage.next($event)">
        <ng-container rowOutlet></ng-container>
      </cdk-virtual-scroll-viewport>
    </isx-virtual-scroll-viewport-container>
    <ng-container footerRowOutlet></ng-container>
  `,
  styleUrls: ['./table.component.scss'],
  host: {
    'class': 'mat-table isx-table',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> extends MatTable<T> implements AfterViewInit, AfterContentInit {

  @ViewChild(CdkVirtualScrollViewport, {static: true}) viewPort: CdkVirtualScrollViewport;
  @ViewChild(IsxVirtualScrollViewportContainerComponent, {static: true}) viewPortContainer: IsxVirtualScrollViewportContainerComponent;

  @Output() fetchNextPage = new EventEmitter();
  @Input() rowHeight = 20;
  @Input() headerHeight = 22;
  @Input() originalDataSource: MatTableDataSource<T>;

  constructor(protected readonly _differs: IterableDiffers,
              protected readonly _changeDetectorRef: ChangeDetectorRef,
              protected readonly _elementRef: ElementRef, @Attribute('role') role: string,
              protected ngZone: NgZone,
              protected el: ElementRef,
              @Optional() protected readonly _dir: Directionality, @Inject(DOCUMENT) _document: any,
              _platform: Platform) {
    super(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, _platform);
  }

  ngAfterContentInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource = this.viewPortContainer.scrolledDataSource;
  }
}
