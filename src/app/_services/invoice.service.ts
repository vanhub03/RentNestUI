import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

  getInvoices(filter: any): Observable<any> {
    let params = new HttpParams()
      .set('invoiceMonth', filter.invoiceMonth)
      .set('page', filter.page)
      .set('size', filter.size);
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    return this.http.get(`${enviroment.apiUrl}/landlord/invoices`, { params });
  }

  getStats(invoiceMonth: string): Observable<any> {
    const params = new HttpParams().set('invoiceMonth', invoiceMonth);
    return this.http.get(`${enviroment.apiUrl}/landlord/invoices/stats`, { params });
  }

  generateInvoices(payload: any): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/landlord/invoices/generate`, payload);
  }

  markPaid(id: number): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/landlord/invoices/${id}/mark-paid`, {});
  }

  getTenantInvoices(filter: any): Observable<any> {
    // Tạo query param cho API tenant: lọc theo năm và phân trang.
    let params = new HttpParams()
      .set('year', filter.year)
      .set('page', filter.page)
      .set('size', filter.size);
    // Gọi endpoint tenant, khác endpoint landlord để backend tự kiểm tra user hiện tại.
    return this.http.get(`${enviroment.apiUrl}/tenant/invoices`, { params });
  }

  getTenantCurrentUnpaid(): Observable<any> {
    // Lấy hóa đơn chưa thanh toán gần nhất để hiển thị card cảnh báo trên màn tenant.
    return this.http.get(`${enviroment.apiUrl}/tenant/invoices/current-unpaid`);
  }

  getTenantInvoiceDetail(id: number): Observable<any> {
    // Lấy chi tiết một hóa đơn; backend chỉ trả nếu hóa đơn thuộc tenant đang đăng nhập.
    return this.http.get(`${enviroment.apiUrl}/tenant/invoices/${id}`);
  }
}
