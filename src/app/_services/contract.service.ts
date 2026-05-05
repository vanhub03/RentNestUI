import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(private http: HttpClient) {}
  getLandlordPreviewByRequest(requestId: number): Observable<any> {
    return this.http.get(`${enviroment.apiUrl}/landlord/contracts/by-request/${requestId}/preview`);
  }
  getTenantPreviewByRequest(requestId: number): Observable<any> {
    return this.http.get(`${enviroment.apiUrl}/tenant/contracts/by-request/${requestId}/preview`);
  }
}
