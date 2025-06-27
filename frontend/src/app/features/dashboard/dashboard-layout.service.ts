import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardLayoutService {
  private layoutSubject = new BehaviorSubject<any[]>([]);
  private draggingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  get layout$() {
    return this.layoutSubject.asObservable();
  }

  get dragging$() {
    return this.draggingSubject.asObservable();
  }

  setLayout(layout: any[]): void {
    this.layoutSubject.next(layout);
  }

  updateLayout(layout: any): void {
    const currentLayout = this.layoutSubject.value;
    const updatedLayout = currentLayout.map(l => {
      if (l.i === layout.i) {
        return layout;
      }
      return l;
    });
    this.layoutSubject.next(updatedLayout);
  }

  setDragging(isDragging: boolean): void {
    this.draggingSubject.next(isDragging);
  }

  getLayout(): any[] {
    return this.layoutSubject.value;
  }

  isDragging(): boolean {
    return this.draggingSubject.value;
  }
}
