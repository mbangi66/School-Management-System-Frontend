import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { StudentService } from './student.service';
import { Student } from './student.model';
import { StudentFormComponent } from './student-form/student-form.component';
import { MatDialog } from '@angular/material/dialog';
import { StudentListService } from './student-list.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'School-Management-System';
  isLoggedIn: boolean = false;
  students: Student[] = [];

  constructor(private router:Router,private studentListService:StudentListService,private studentService: StudentService, private authService: AuthService, public dialog: MatDialog) {}
  ngOnInit(): void {
    this.fetchStudents();
    this.studentListService.students$.subscribe((students) => {
      this.students = students;
    });
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }
  updateLoginStatus(isLoggedIn: boolean): void {
    this.isLoggedIn = isLoggedIn;
    if (isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
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
}
