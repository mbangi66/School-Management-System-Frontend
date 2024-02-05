import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Student } from '../student.model';
import { StudentFormComponent } from '../student-form/student-form.component';
import { StudentService } from '../student.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentListService } from '../student-list.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  students: Student[] = [];
  selectedStudent: Student | undefined;
  filterForm!: FormGroup;
  yearOptions: number[] = [];
  classOptions: string[] = [];
  selectedType: string | null = null;
  selectedYear: number | null = null;
  selectedClass: string | null = null;

  constructor(
    private fb: FormBuilder,
    private filterService: FilterService,
    private studentListService: StudentListService,
    private snackBar: MatSnackBar,
    private studentService: StudentService,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.studentListService.students$.subscribe((students) => {
      this.students = students;
    });
    this.filterForm.valueChanges.subscribe((values) => {
      this.ngZone.run(() => {
        this.selectedType = values.type;
        this.selectedYear = values.year;
        this.selectedClass = values.classNumber;
        console.log('Filter Values:', values); // Log the values to ensure they are changing
        // Other logic you might want to add
      });});
      this.filterForm.valueChanges.subscribe(() => {
        const filterValues = this.getFilterValues();
        console.log('Filter Values After Form Change:', filterValues);
      });
    
      this.filterForm.get('type')?.valueChanges.subscribe((type) => {
        this.updateYearAndClassOptions(type);
      });
    
      // Initialize options for the default type
      this.updateYearAndClassOptions('Primary');
    this.fetchStudents();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      type: ['Primary'],
      year: [null],
      classNumber: [null],
    });

    this.filterForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateYearAndClassOptions(type);
    });

    // Initialize options for the default type
    this.updateYearAndClassOptions('Primary');
  }

  updateYearAndClassOptions(type: string): void {
    this.yearOptions = this.filterService.getYears(type);
    this.classOptions = this.filterService.getClasses(type, this.filterForm.get('year')?.value);
  
    // Reset selected year and class when type changes
    this.filterForm.get('year')?.setValue(null);
    this.filterForm.get('classNumber')?.setValue(null); // Corrected property name
  }
  
  
  applyFilter(): void {
    const filterValues = this.getFilterValues();
  
    this.ngZone.run(() => {
      // Update the filter service with the new values
      this.filterService.updateTypeFilter(filterValues.type);
      this.filterService.updateYearFilter(filterValues.year);
      this.filterService.updateClassFilter(filterValues.classNumber);
    });
    console.log('Filter Values After Update:', this.getFilterValues());
  }
  
  
  getYearOptions(): number[] {
    const yearOptions = this.filterForm.get('year')?.value;
    return Array.isArray(yearOptions) ? yearOptions : [];
  }

  getClassOptions(): string[] {
    const classOptions = this.filterForm.get('classNumber')?.value;
    return Array.isArray(classOptions) ? classOptions : [];
  }

  fetchStudents(): void {
    this.studentService.getStudents().subscribe(
      (response) => {
        this.students = response.students;
      },
      (error) => {
        console.error('Error fetching students', error);
      }
    );
  }
  getFilterValues(): { type: string; year: number | null; classNumber: string | null } {
    const type: string = this.filterForm.get('type')?.value || 'Primary';
    const year: number | null = this.filterForm.get('year')?.value !== null ? +this.filterForm.get('year')?.value : null;
    const classNumber: string | null = this.filterForm.get('classNumber')?.value || null;
  
    console.log('Filter Values in Get:', { type, year, classNumber });
  
    return { type, year, classNumber };
  }  
  

  openStudentFormDialog(student?: Student): void {
    const dialogRef = this.dialog.open(StudentFormComponent, {
      width: '600px',
      data: student,
    });

    dialogRef.afterClosed().subscribe(() => {
      // Refresh students after closing the dialog
      this.fetchStudents();
    });
  }

  deleteStudent(studentId: number): void {
    this.studentService.deleteStudent(studentId).subscribe(
      () => {
        // Reload the student list or update the table after deletion
        this.fetchStudents(); // Implement this method to reload students
        this.snackBar.open('Student deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      (error) => {
        console.error('Error deleting student', error);
        this.snackBar.open('Error deleting student', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    );
  }

  handleStudentSaved(formData: any): void {
    // Logic to handle the updated student data
    console.log('Student saved in HomeComponent', formData);
    this.fetchStudents(); // Refresh the student list
  }
  
}
