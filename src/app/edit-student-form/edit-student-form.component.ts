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
  filterForm!: FormGroup;
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
    this.filterForm.get('type')?.setValue('Primary');

    // Initialize options for the default type
    this.updateYearAndClassOptions('Primary');
  }

  updateYearAndClassOptions(type: string): void {
    this.yearOptions = this.filterService.getYears(type);
    this.classOptions = this.filterService.getClasses(type, this.filterForm.get('year')?.value); // Pass null as the year initially
  
    // Reset selected year and class when type changes
    this.filterForm.get('year')?.setValue(null);
    this.filterForm.get('classNumber')?.setValue(null);
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

      if (this.student) {
        // Editing existing student
        formData.id = this.student.id;
        this.studentService.updateStudent(formData).subscribe(
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
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
