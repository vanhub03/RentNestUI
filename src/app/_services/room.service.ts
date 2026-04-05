import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';
import { Form } from '@angular/forms';

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
  createHostel(data: FormData): Observable<any> {
    return this.http.post(enviroment.apiUrl + '/hostels', data, {
      responseType: 'text',
    });
  }
  updateRoom(id: number, room: FormData): Observable<any> {
    return this.http.put(enviroment.apiUrl + `/rooms/${id}`, room);
  }
  deleteRoom(id: number): Observable<any> {
    return this.http.delete(enviroment.apiUrl + `/rooms/${id}`);
  }
  updateHostel(id: number, hostel: FormData): Observable<any> {
    return this.http.put(enviroment.apiUrl + `/hostels/${id}`, hostel);
  }
  deleteHostel(id: number): Observable<any> {
    return this.http.delete(enviroment.apiUrl + `/hostels/${id}`);
  }
  getLatestRooms(): Observable<any> {
    return this.http.get(enviroment.apiUrl + '/public/latest-rooms');
  }
  getAvailableLocations(): Observable<string[]> {
    return this.http.get<string[]>(enviroment.apiUrl + '/public/locations');
  }
  getAvailableRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${enviroment.apiUrl}/landlord/available`);
  }
}
