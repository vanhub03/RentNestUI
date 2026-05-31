import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class TenantRoomService {
  constructor(private http: HttpClient) {}
  getMyRoom(): Observable<any> {
    return this.http.get(`${enviroment.apiUrl}/tenant/rooms`);
  }

  addCoOccupant(roomId: number, payload: any): Observable<any> {
    return this.http.post(`${enviroment.apiUrl}/tenant/rooms/${roomId}/occupants`, payload);
  }
}
