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
  getLandlordRooms(params: any): Observable<any> {
    return this.http.get(enviroment.apiUrl + '/landlord/rooms', { params });
  }
  createRoom(data: FormData): Observable<any> {
    return this.http.post(enviroment.apiUrl + '/rooms', data, {
      responseType: 'text',
    });
  }
}
