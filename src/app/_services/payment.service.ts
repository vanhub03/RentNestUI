import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}
  createDepositMomoUrl(requestId: number): Observable<any> {
    return this.http.post(
      `${enviroment.apiUrl}/tenant/payments/deposit/by-request/${requestId}/momo`,
      { requestId },
    );
  }
  confirmDepositMomoReturn(momoParams: Record<string, string>): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/tenant/payments/deposit/momo-return`, momoParams);
  }

  createInvoiceMomoUrl(invoiceId: number): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/tenant/payments/invoice/${invoiceId}/momo`, {});
  }
  confirmInvoiceMomoReturn(momoParams: Record<string, string>): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/tenant/payments/invoice/momo-return`, momoParams);
  }
}
