import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class LandlordServiceService {
  constructor(private http: HttpClient) {}

  getServices(filter: any): Observable<any> {
    let params = new HttpParams().set('page', filter.page).set('size', filter.size);
    if (filter.hostelId) params = params.set('hostelId', filter.hostelId);
    return this.http.get(`${enviroment.apiUrl}/landlord/services`, { params });
  }

  createServices(payload: any): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/landlord/services`, payload);
  }

  updateServices(id: number, payload: any): Observable<any> {
    return this.http.put(`${enviroment.apiUrl}/landlord/services/${id}`, payload);
  }

  deleteServices(id: number): Observable<any> {
    return this.http.delete(`${enviroment.apiUrl}/landlord/services/${id}`);
  }
}
