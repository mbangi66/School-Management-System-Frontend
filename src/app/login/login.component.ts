import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppComponent } from '../app.component';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  isLoading: boolean = false;
  username = '';
  password = '';

  constructor(private snackBar: MatSnackBar,private router: Router,private authService: AuthService, private appComponent: AppComponent) {}

  login(): void {
    this.isLoading = true; // Add a loading state variable
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        if (response.success) {
          // Login successful, handle accordingly
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate(['/home']);
          console.log('Login successful');
          this.appComponent.updateLoginStatus(true);
        } else {
          // Login failed, handle accordingly
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          console.error('Login failed');
        }
      },
      (error) => {
        // Handle the error, e.g., show an error message
        console.error('Login failed', error);
      }
    ).add(() => {
      this.isLoading = false; // Set loading state to false when the request is complete
    });
  }  

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
