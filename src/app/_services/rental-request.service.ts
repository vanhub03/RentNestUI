import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class RentalRequestService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(enviroment.apiUrl + '/landlord/rental-requests/stats');
  }
  getRequests(filter: any): Observable<any> {
    let params = new HttpParams().set('page', filter.page).set('size', filter.size);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.roomId) params = params.set('roomId', filter.roomId);
    if (filter.tenantName) params = params.set('tenantName', filter.tenantName);
    return this.http.get(enviroment.apiUrl + '/landlord/rental-requests', { params });
  }
}
