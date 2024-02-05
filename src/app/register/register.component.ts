import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(private snackBar: MatSnackBar,private router: Router ,private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { username, password } = this.registrationForm.value;
  
      this.authService.checkUsernameAvailability(username).subscribe(
        (isAvailable) => {
          if (isAvailable) {
            // Proceed with registration
            this.authService.register(username, password).subscribe(
              () => {
                // Registration successful
                this.snackBar.open('Registration successful!', 'Close', {
                  duration: 3000,
                  panelClass: ['success-snackbar'],
                });
                console.log('Registration successful');
                // Redirect or perform other actions after successful registration
              },
              (error) => {
                // Handle registration error
                const errorMessage = error.error ? error.error.message || 'Registration failed' : 'Registration failed';
                if (errorMessage.includes('Username is already taken')) {
                  // Display an error message indicating that the username is not available
                  this.snackBar.open(errorMessage, 'Close', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                  });
                } else {
                  // Handle other registration errors
                  this.snackBar.open('Registration failed', 'Close', {
                    duration: 3000,
                    panelClass: ['error-snackbar'],
                  });
                }
                console.error('Registration failed', error);
              }
            );
          } else {
            // Display an error message indicating that the username is not available
            this.snackBar.open('Username is already taken. Please choose a different username.', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          }
        },
        (error) => {
          console.error('Error checking username availability', error);
          // Log more details about the error
        }
      );
    }
  }  
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
