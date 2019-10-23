import {getMultipleValuesInSingleSelectionError, SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {IsxSelectionModel} from './selection.model';
import {MatTable, MatTableDataSource} from '@angular/material';

export class TableSelectionModel<T> extends IsxSelectionModel<T> {
  private isLineSelected = false;
  private lastElement: T;
  private sourceData: MatTableDataSource<T>;

  private firstLineUp = new Subject();

  withData(sourceData: MatTableDataSource<T>) {
    this.sourceData = sourceData;
    return this;
  }

  selectLine(item: T) {
    this.toggleSelect([item]);
    this.isLineSelected = true;
    this.lastElement = item;
  }

  toggleAllCheck(checked: boolean) {
    if (checked) {
      this.select([...this.sourceData.data]);
    } else {
      this.clear();
    }
    this.isLineSelected = false;
  }

  toggleCheck(item: T) {
    if(this.isLineSelected) {
      this.toggleSelect([item]);
    } else {
      this.toggle(item);
    }
    this.isLineSelected = false;
    this.lastElement = item;
  }

  selectPrevElement() {
    let index = this.sourceData.data.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sourceData.data[0]);
    } else {
      if(index == 0) {
        this.firstLineUp.next();
      } else {
        this.selectLine(this.sourceData.data[index - 1]);
      }
    }
  }

  selectNextElement() {
    let index = this.sourceData.data.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sourceData.data[0]);
    } else {
      if(index != this.sourceData.data.length - 1) {
        this.selectLine(this.sourceData.data[index + 1]);
      }
    }
  }

  isSelectedCheck(row: T) {
    return this.isSelected(row) && !this.isLineSelected;
  }

  isSelectedLine(row: T) {
      return this.isSelected(row) && this.isLineSelected;
  }

  get isSelectedAll() {
    if (this.sourceData.data.length == 0) {
      return false;
    }

    return this.selected.length == this.sourceData.data.length && !this.isLineSelected;
  }

  get isSelectedPartial() {
    return this.selected.length != this.sourceData.data.length && this.selected.length > 0 && !this.isLineSelected;
  }

  get isData() {
    return this.sourceData && this.sourceData.data && this.sourceData.data.length != 0;
  }
}
