import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Student } from '../student.model';
import { FilterService } from '../filter.service';
import { StudentService } from '../student.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css'],
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student | undefined;
  studentForm!: FormGroup;
  yearOptions: number[] = [];
  classOptions: string[] = [];
  selectedStudent: Student | undefined;

  constructor(
    private studentService: StudentService,
    private filterService: FilterService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<StudentFormComponent>,
    @Inject(MAT_DIALOG_DATA ) public data: any,
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.student) {
      console.log('Student data received:', this.data.student);
      this.student = { ...this.data.student };
    }
  
    this.initFilterForm();
  }

  initFilterForm(): void {
    this.studentForm = this.fb.group({
      name: [this.student?.name || '', Validators.required],
      grade: [this.student?.grade || '', Validators.required],
      age: [this.student?.age || '', [Validators.required, Validators.min(0)]],
      subject: [this.student?.subject || '', Validators.required],
      photo: [this.student?.photo || null],
      filterForm: this.fb.group({
        type: ['Primary'],
        year: [null],
        classNumber: [null],
      }),
    });
  
    this.studentForm.get('filterForm')?.get('type')?.valueChanges.subscribe((type) => {
      this.updateYearAndClassOptions(type);
    });
  
    this.studentForm.get('filterForm')?.get('type')?.setValue('Primary');
  
    this.updateYearAndClassOptions('Primary');
  }
  

  updateYearAndClassOptions(type: string): void {
    // Access 'filterForm' through 'studentForm'
    let filterForm = this.studentForm.get('filterForm');
  
    this.yearOptions = this.filterService.getYears(type);
    this.classOptions = this.filterService.getClasses(type, filterForm?.get('year')?.value); // Pass null as the year initially
  
    // Reset selected year and class when type changes
    filterForm?.get('year')?.setValue(null);
    filterForm?.get('classNumber')?.setValue(null);
  }
  

  onSubmit(): void {
    if (this.studentForm.valid) {
      // Extract filterForm values
      const filterFormValues = this.studentForm.get('filterForm')?.value;
  
      // Prepare the student data
      const studentData = {
        ...this.studentForm.value,
        type: filterFormValues?.type,
        year: filterFormValues?.year,
        classNumber: filterFormValues?.classNumber,
      };
      // Add a new student
      this.studentService.addStudent(studentData).subscribe(
        (response) => {
          console.log('Student added successfully:', response);
          this.snackBar.open('Student added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close();
        },
        (error) => {
          console.error('Failed to add student', error);
          this.snackBar.open('Error adding student', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      );
    } else {
      console.log('Form is not valid', this.studentForm);
    }
  }  

  onCancel(): void {
    this.dialogRef.close();

  }
}
