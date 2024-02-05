import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Student } from './student.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<{ students: Student[] }> {
    return this.http.get<{ students: Student[] }>(`${this.apiUrl}/students`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching students', error);
          return throwError(error);
        })
      );
  }

  addStudent(student: Student): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/students`, student);
  }

  updateStudent(student: Student): Observable<{ success: boolean }> {
    const { id, name, grade, age, subject, year, classNumber, type, photo } = student;
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/students/${id}`, {
      id,
      name,
      grade,
      age,
      subject,
      year,
      classNumber,
      type,
      photo
    });
  }
  
  deleteStudent(studentId: number): Observable<{ success: boolean }> {
    const url = `${this.apiUrl}/students/${studentId}`;
    return this.http.delete<{ success: boolean }>(url);
  }
  getYears(selectedFilter: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/years?filter=${selectedFilter}`);
  }

  getClasses(selectedFilter: string, selectedYear: number | undefined): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/classes?filter=${selectedFilter}&year=${selectedYear}`);
  }

  getFilteredStudents(
    selectedFilter: string, 
    selectedYear: number | null, 
    selectedClass: string | null
  ): Observable<Student[]> {
    const encodedFilter = encodeURIComponent(selectedFilter);
    const encodedYear = encodeURIComponent(selectedYear?.toString() || '');
    const encodedClass = encodeURIComponent(selectedClass || '');
  
    const url = `${this.apiUrl}/filtered-students?filter=${selectedFilter}&year=${selectedYear}&classNumber=${selectedClass}`;
    
    return this.http.get<Student[]>(url);
  }  
}
