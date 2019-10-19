import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatTable} from '@angular/material';
import {CDK_TABLE_TEMPLATE} from '@angular/cdk/table';

@Component({
  selector: 'isx-table, table[isx-table]',
  exportAs: 'isxTable',
  template: CDK_TABLE_TEMPLATE,
  styleUrls: ['./table.component.scss'],
  host: {
    'class': 'mat-table isx-table',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T> extends MatTable<T> {

}
