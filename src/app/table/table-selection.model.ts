import {getMultipleValuesInSingleSelectionError, SelectionChange, SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {IsxSelectionModel} from './selection.model';
import {MatTable, MatTableDataSource} from '@angular/material';

export class TableSelectionModel<T> extends IsxSelectionModel<T> {
  private isLineSelected = false;
  private lastElement: T;
  private sourceData: T[];

  private firstLineUp = new Subject();

  withData(sourceData: T[]) {
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
      this.select([...this.sourceData]);
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
    let index = this.sourceData.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sourceData[0]);
    } else {
      if(index == 0) {
        this.firstLineUp.next();
      } else {
        this.selectLine(this.sourceData[index - 1]);
      }
    }
  }

  selectNextElement() {
    let index = this.sourceData.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sourceData[0]);
    } else {
      if(index != this.sourceData.length - 1) {
        this.selectLine(this.sourceData[index + 1]);
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
    if (this.sourceData.length == 0) {
      return false;
    }

    return this.selected.length == this.sourceData.length && !this.isLineSelected;
  }

  get isSelectedPartial() {
    return this.selected.length != this.sourceData.length && this.selected.length > 0 && !this.isLineSelected;
  }

  get isData() {
    return this.sourceData && this.sourceData && this.sourceData.length != 0;
  }

  get lastSelected() {
    return this.lastElement;
  }
}
