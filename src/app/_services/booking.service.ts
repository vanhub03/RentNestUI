import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';
import { Form } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  postRequestRentRoom(params: any): Observable<any> {
    return this.http.post(enviroment.apiUrl + '/public/request-rooms', params);
  }
}
