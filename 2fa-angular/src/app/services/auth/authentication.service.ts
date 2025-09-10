import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RegisterRequest} from '../../models/register-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import {Observable} from 'rxjs';
import {VerificationRequest} from '../../models/verification-request';
import {AuthenticationRequest} from '../../models/authentication-request';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private baseUrl = 'http://localhost:8080/api/auth'
  constructor(
    private http: HttpClient
  ) { }

  register(registerRequest : RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/register`, registerRequest);
  }

  login(authRequest: AuthenticationRequest):Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/login`, authRequest);
  }

  verifyCode(verificationRequest: VerificationRequest):Observable<AuthenticationResponse>{
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/verify`, verificationRequest);
  }
}
