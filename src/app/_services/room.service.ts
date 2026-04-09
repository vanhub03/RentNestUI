import { HttpClient, HttpParams } from '@angular/common/http';
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

  getPublicRooms(filter: any): Observable<any> {
    let params = new HttpParams();
    if (filter.cityCode) {
      params = params.set('cityCode', filter.cityCode); // ?cityCode=...
    }
    if (filter.wardCode) {
      params = params.set('wardCode', filter.wardCode);
    }
    if (filter.minPrice !== null && filter.minPrice !== undefined) {
      params = params.set('minPrice', filter.minPrice.toString());
    }
    if (filter.maxPrice !== null && filter.maxPrice !== undefined) {
      params = params.set('maxPrice', filter.maxPrice.toString());
    }
    if (filter.sort) {
      params = params.set('sort', filter.sort);
    }
    if (filter.page !== undefined) {
      params = params.set('page', filter.page);
    }
    if (filter.size !== undefined) {
      params = params.set('size', filter.size);
    }
    return this.http.get(enviroment.apiUrl + '/public/rooms', { params });
  }
}
