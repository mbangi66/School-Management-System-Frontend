import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './Token.services'; // Ensure the correct import path

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private apiUrl = "http://localhost:3000";

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // Check if the user is already authenticated (you might have a more sophisticated logic here)
    const token = this.tokenService.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(username: string, password: string): Observable<{ success: boolean; token?: string }> {
    const loginData = { username, password };
    return this.http.post<{ success: boolean; token?: string }>(`${this.apiUrl}/users/login`, loginData)
      .pipe(
        catchError((error) => {
          console.error('Login failed', error);
          throw error; // Rethrow the error for the component to handle
        })
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    // Check if the user is authenticated (e.g., by verifying the presence of a valid token)
    const token = this.tokenService.getToken();
    return !!token; // Return true if the token exists, otherwise false
  }

  register(username: string, password: string): Observable<boolean> {
    const registrationData = { username, password };

    return this.http.post<boolean>(`${this.apiUrl}/users/register`, registrationData)
      .pipe(
        catchError((error) => {
          console.error('Registration failed', error);
          throw error;
        })
      );
  }

  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/users/check-username`, { username });
  }
}
