import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../env';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post(enviroment.apiUrl + '/auth/login', { username, password });
  }

  register(userData: any): Observable<any> {
    return this.http.post(enviroment.apiUrl + '/auth/register', userData);
  }

  logout(): Observable<any> {
    return this.http.post(enviroment.apiUrl + '/auth/logout', {});
  }
}
