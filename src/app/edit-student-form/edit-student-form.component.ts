import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Student } from '../student.model';
import { StudentService } from '../student.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-edit-student-form',
  templateUrl: './edit-student-form.component.html',
  styleUrls: ['./edit-student-form.component.css'],
})
export class EditStudentFormComponent implements OnInit {
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
    public dialogRef: MatDialogRef<EditStudentFormComponent>
  ,@Inject(MAT_DIALOG_DATA ) public data: any
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
      year: [this.student?.year || null, Validators.required],
      classNumber: [this.student?.classNumber || null, Validators.required],
      type: [this.student?.type || '', Validators.required],
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
     // Extract filterForm values
     const filterFormValues = this.studentForm.get('filterForm')?.value;
  
     // Prepare the student data
     const studentData = {
       ...this.studentForm.value,
       type: filterFormValues?.type,
       year: filterFormValues?.year,
       classNumber: filterFormValues?.classNumber,
     };
      if (this.student) {
        // Editing existing student
        studentData.id = this.student.id;
        this.studentService.updateStudent(studentData).subscribe(
          (response) => {
            console.log('Student updated successfully:', response);
            this.snackBar.open('Student updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.dialogRef.close();
          },
          (error) => {
            console.error('Failed to update student', error);
          }
        );
      }
    }
    
  onCancel(): void {
    this.dialogRef.close();
  }
}
