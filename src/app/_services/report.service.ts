import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getLandlordOverview(invoiceMonth: string): Observable<any> {
    const params = new HttpParams().set('invoiceMonth', invoiceMonth);
    return this.http.get(`${enviroment.apiUrl}/landlord/reports/overview`, { params });
  }
}
