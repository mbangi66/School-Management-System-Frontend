import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student } from './student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentListService {
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  students$ = this.studentsSubject.asObservable();

  updateStudents(students: Student[]): void {
    this.studentsSubject.next(students);
  }
}
