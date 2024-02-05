import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import { Student } from '../student.model';
import { StudentListService } from '../student-list.service';
import { FilterService } from '../filter.service';
import { MatDialog } from '@angular/material/dialog';
import { EditStudentFormComponent } from '../edit-student-form/edit-student-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit {
  @Input() students: Student[] = [];
  @Output() onDeleteStudent = new EventEmitter<number>();

  selectedStudent: Student | undefined;
  selectedType: string | null = null;
  selectedYear: number | null = null;
  selectedClass: string | null = null;
  dataSource: MatTableDataSource<Student> = new MatTableDataSource<Student>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id','name', 'grade', 'age', 'subject', 'year','classNumber','type', 'actions'];

  constructor(
    public dialog: MatDialog,
    private studentService: StudentService,
    private studentListService: StudentListService, 
    private filterService: FilterService) {}

  ngOnInit(): void {
    this.getStudents();
    
    this.filterService.typeFilter$.subscribe((type) => {
      console.log('Type Filter Changed:', type);
      this.fetchStudents();
    });
    
    this.filterService.yearFilter$.subscribe((year) => {
      console.log('Year Filter Changed:', year);
      this.fetchStudents();
    });
    
    this.filterService.classFilter$.subscribe((classNumber) => {
      console.log('Class Filter Changed:', classNumber);
      this.fetchStudents();
    });
    
    console.log('Paginator:', this.paginator);
  }

  getStudents(): void {
    this.studentService.getStudents().subscribe((response) => {
      this.students = response.students;
    });
  }

  editStudent(student: Student): void {
    console.log('Selected Student:', student);
    this.openStudentFormDialog(student);
  }
  
  
  openStudentFormDialog(student?: Student): void {
    const dialogRef = this.dialog.open(EditStudentFormComponent, {
      width: '600px',
      data: { student },
    });
  
    dialogRef.afterClosed().subscribe(() => {
      // Refresh students after closing the dialog
      this.fetchStudents();
    });
  }  

  deleteStudentById(studentId: number): void {
  this.onDeleteStudent.emit(studentId);
}

  saveStudent(student: Student): void {
    this.studentService.updateStudent(student).subscribe(
      (response) => {
        if (response.success) {
          this.refreshStudentList();
        } else {
          console.error('Failed to update student');
        }
      }
    );
  }
  
  fetchStudents(): void {
    const filterValues = this.getFilterValues();
    console.log('Filter Values in Fetch:', filterValues);
  
    this.studentService.getFilteredStudents(filterValues.type, filterValues.year, filterValues.classNumber).subscribe(
      (response: Student[]) => {
        console.log('Response:', response);
        this.dataSource.data = response;
        this.dataSource.paginator = this.paginator;  // Set paginator if using it
      },
      (error) => {
        console.error('Error fetching students', error);
      }
    );
  }
  
  

  getFilterValues(): { type: string, year: number | null, classNumber: string | null } {
    const type: string = this.selectedType || 'Primary';
    const year: number | null = this.selectedYear !== null && !isNaN(this.selectedYear as number) ? +this.selectedYear : null;
    const classNumber: string | null = this.selectedClass || null;

    console.log('Filter Values in Get:', { type, year, classNumber });

    return { type, year, classNumber };
}
  
  
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.fetchStudents(); // Make sure to fetch students after setting the paginator
  }

  private refreshStudentList(): void {
    this.studentService.getStudents().subscribe(
      (response) => {
        if (Array.isArray(response.students)) {
          this.students = response.students;
          this.studentListService.updateStudents(response.students); 
        } else {
          console.error('Invalid response format: students array is missing.');
        }
      },
      (error) => {
        console.error('Error refreshing student list:', error);
      }
    );
  }
  handleStudentSaved(formData: any): void {
    // Logic to handle the updated student data
    console.log('Student saved in HomeComponent', formData);
    this.fetchStudents(); // Refresh the student list
  }
}
