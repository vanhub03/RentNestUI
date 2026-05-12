import { HttpClient, HttpParams } from '@angular/common/http';
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
  renewLandlordContract(contractId: number, months = 12): Observable<any> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.post(
      `${enviroment.apiUrl}/landlord/contracts/${contractId}/renew`,
      {},
      {
        params,
      },
    );
  }
  getLandlordContracts(filter: any): Observable<any> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('size', filter.size.toString());
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    return this.http.get(`${enviroment.apiUrl}/landlord/contracts`, { params });
  }
}
