import {MatSort, MatTableDataSource} from '@angular/material';
import {IsxSelectionModel} from './selection.model';
import {Subject} from 'rxjs';

export class IsxTableDataSource<T> extends MatTableDataSource<T>{
  private isLineSelected = false;
  private lastElement: T;
  private selectionModel: IsxSelectionModel<T>;

  private _sortedData = [];
  private _filteredData = [];

  firstLineUp = new Subject();

  constructor() {
    super();

    let oldSortData = this.sortData;
    this.sortData = (data: T[], sort: MatSort): T[] => {
      this.sortedData = oldSortData(data, sort);
      return this.sortedData;
    };
  }
  withSelectionModel(selectionModel: IsxSelectionModel<T>): IsxTableDataSource<T> {
    this.selectionModel = selectionModel;
    return this;
  }

  selectLine(item: T) {
    this.selectionModel.toggleSelect([item]);
    this.isLineSelected = true;
    this.lastElement = item;
  }

  toggleAllCheck(checked: boolean) {
    if (checked) {
      this.selectionModel.select([...this.filteredData]);
    } else {
      this.selectionModel.clear();
    }
    this.isLineSelected = false;
  }

  toggleCheck(item: T) {
    if(this.isLineSelected) {
      this.selectionModel.toggleSelect([item]);
    } else {
      this.selectionModel.toggle(item);
    }
    this.isLineSelected = false;
    this.lastElement = item;
  }

  selectPrevElement() {
    let index = this.sortedData.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sortedData[0]);
    } else {
      if(index == 0) {
        this.firstLineUp.next();
      } else {
        this.selectLine(this.sortedData[index - 1]);
      }
    }
  }

  selectNextElement() {
    let index = this.sortedData.indexOf(this.lastElement);
    if(index == -1) {
      this.selectLine(this.sortedData[0]);
    } else {
      if(index != this.sortedData.length - 1) {
        this.selectLine(this.sortedData[index + 1]);
      }
    }
  }

  isSelectedCheck(row: T) {
    return this.selectionModel.isSelected(row) && !this.isLineSelected;
  }

  isSelectedLine(row: T) {
    return this.selectionModel.isSelected(row) && this.isLineSelected;
  }

  get isSelectedAll() {
    if (this.filteredData.length == 0) {
      return false;
    }

    return this.selectionModel.selected.length == this.filteredData.length && !this.isLineSelected;
  }

  get isSelectedPartial() {
    return this.selectionModel.selected.length != this.filteredData.length && this.selectionModel.selected.length > 0 && !this.isLineSelected;
  }

  get isData() {
    return this.filteredData && this.filteredData && this.filteredData.length != 0;
  }

  get lastSelected() {
    return this.lastElement;
  }

  get filteredData() {
    if(this._filteredData.length) {
      return this._filteredData
    } else {
      return this.data;
    }
  }

  get sortedData() {
    if(this._sortedData.length) {
      return this._sortedData
    } else {
      return this.data;
    }
  }

  set filteredData(val: T[]) {
    this._filteredData = val;
  }

  set sortedData(val: T[]) {
    this._sortedData = val;
  }
}
