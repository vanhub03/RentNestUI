import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';
import { Form } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class TenantService {
  constructor(private http: HttpClient) {}

  getLandlordTenants(params: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.keyword !== undefined) httpParams = httpParams.set('keyword', params.keyword);

    return this.http.get(enviroment.apiUrl + '/landlord/tenants', { params: httpParams });
  }

  onboardTenant(formData: FormData): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/landlord/contracts/onboard`, formData);
  }
}
