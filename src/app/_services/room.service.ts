import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private http: HttpClient) {}

  getLandlordHostels(params: any): Observable<any> {
    return this.http.get(enviroment.apiUrl + '/landlord/hostels', { params });
  }
}
