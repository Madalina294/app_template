import { Injectable } from '@angular/core';


const TOKEN = "token";
const USER = "user";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }


  static getToken(): string | null{
    if (!this.isBrowser()) return null;
    const token = window.localStorage.getItem(TOKEN);
    console.log('Retrieved token from localStorage:', token);
    return token;
  }

  static getUser(): any{
    if (!this.isBrowser()) return null;
    const rawUser = window.localStorage.getItem(USER);
    if (!rawUser) return null;
    try{
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }

  static getUserRole() : string{
    const user = this.getUser();
    if(user == null) return '';
    return user.role;
  }

  static isAdminLoggedIn(): boolean{
    if (!this.isBrowser()) return false;
    if(this.getToken() === null) return false;
    const role:string = this.getUserRole();
    return role === "ADMIN";
  }

  static isCustomerLoggedIn(): boolean{
    if (!this.isBrowser()) return false;
    if(this.getToken() == null) return false;
    const role:string = this.getUserRole();
    return role === "USER";
  }

  static signout(): void{
    if (!this.isBrowser()) return;
    window.localStorage.removeItem(USER);
    window.localStorage.removeItem(TOKEN);
  }

}
