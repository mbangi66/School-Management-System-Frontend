import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ClassStructure {
  [key: string]: {
    [key: number]: string;
  };
}

const classes: ClassStructure = {
  KG: {
    1: 'Class 1 KG',
    2: 'Class 2 KG',
    3: 'Class 3 KG',
  },
  Primary: {
    1: 'Class 1 Primary',
    2: 'Class 2 Primary',
    3: 'Class 3 Primary',
    4: 'Class 4 Primary',
    5: 'Class 5 Primary',
  },
  Secondary: {
    1: 'Class 1 Secondary',
    2: 'Class 2 Secondary',
    3: 'Class 3 Secondary',
    4: 'Class 4 Secondary',
  },
};

@Injectable({
  providedIn: 'root',
})
export class FilterService {
    private typeFilter = new BehaviorSubject<string>('Primary');
    private yearFilter = new BehaviorSubject<number | null>(null);
    private classFilter = new BehaviorSubject<string | null>(null);

    typeFilter$ = this.typeFilter.asObservable();
    yearFilter$ = this.yearFilter.asObservable();
    classFilter$ = this.classFilter.asObservable();
    updateTypeFilter(type: string): void {
        this.typeFilter.next(type);
      }
    
      updateYearFilter(year: number | null): void {
        this.yearFilter.next(year);
      }
    
      updateClassFilter(classNumber: string | null): void {
        this.classFilter.next(classNumber);
      }
    
  getYears(selectedFilter: string): number[] {
    return Object.keys(classes[selectedFilter]).map(Number);
  }

  getClasses(selectedFilter: string, selectedYear: number | undefined): string[] {
    return Object.values(classes[selectedFilter]);
  }  
}
