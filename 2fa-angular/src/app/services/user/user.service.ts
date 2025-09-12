import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {StorageService} from '../storage/storage.service';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:8080/api/user'
  constructor(
    private http: HttpClient
  ) { }

  deleteAccount(userId: number) {
    return this.http.delete(this.baseUrl + `/delete/${userId}`, {headers: this.createAuthorizationHeader()});
  }

  updateProfile(updateData: any): Observable<Object>{
    return this.http.put(this.baseUrl + `/update-infos`, updateData, {headers: this.createAuthorizationHeader()});
  }

  createAuthorizationHeader(): HttpHeaders{
    const token = StorageService.getToken();
    if (!token) {
      console.error('No token found in storage');
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
  }
}
