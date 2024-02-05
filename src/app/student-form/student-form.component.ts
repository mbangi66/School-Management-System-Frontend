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
  filterForm!: FormGroup;
  yearOptions: number[] = [];
  classOptions: string[] = [];
  selectedStudent: Student | undefined;

  constructor(
    private studentService: StudentService,
    private filterService: FilterService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<StudentFormComponent>,
    @Inject(MAT_DIALOG_DATA ) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.student) {
      console.log('Student data received:', this.data.student);
      this.student = { ...this.data.student };
    }
  
    // Subscribe to filter changes (if needed)
    this.filterService.typeFilter$.subscribe((type) => {
      console.log('Type Filter Changed:', type);
      // Add logic to handle filter changes if necessary
    });
  
    this.filterService.yearFilter$.subscribe((year) => {
      console.log('Year Filter Changed:', year);
      // Add logic to handle filter changes if necessary
    });
  
    this.filterService.classFilter$.subscribe((classNumber) => {
      console.log('Class Filter Changed:', classNumber);
      // Add logic to handle filter changes if necessary
    });
  
    this.initFilterForm();
    this.initForm();
  }
  

  initForm(): void {
    this.studentForm = this.fb.group({
      name: [this.student?.name || '', Validators.required],
      grade: [this.student?.grade || '', Validators.required],
      age: [this.student?.age || '', [Validators.required, Validators.min(0)]],
      subject: [this.student?.subject || '', Validators.required],
      year: [this.student?.year || null, Validators.required],
      classNumber: [this.student?.classNumber || null, Validators.required],
      type: [this.student?.type || '', Validators.required],
      photo: [this.student?.photo || ''],
    });
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
    this.filterForm.get('classNumber')?.setValue(null); // Corrected from 'class' to 'classNumber'
  }
  

  getYearOptions(): number[] {
    const yearOptions = this.filterForm.get('year')?.value;
    return Array.isArray(yearOptions) ? yearOptions : [];
  }

  getClassOptions(): string[] {
    const classOptions = this.filterForm.get('class')?.value;
    return Array.isArray(classOptions) ? classOptions : [];
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = this.studentForm.value;
  
      // Call the service method to add the student to the database
      this.studentService.addStudent(formData).subscribe(
        (response) => {
          console.log('Student added successfully:', response);
          // You can handle success as needed (e.g., show a success message)
          this.snackBar.open('Student added successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          // Close the dialog
          this.dialogRef.close();
          this.selectedStudent = undefined;
        },
        (error) => {
          console.error('Error adding student:', error);
          // You can handle the error (e.g., show an error message)
          this.snackBar.open('Error adding student', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      );
    }
  } 
  

  onCancel(): void {
    this.dialogRef.close();
    this.selectedStudent = undefined;
  }
}
