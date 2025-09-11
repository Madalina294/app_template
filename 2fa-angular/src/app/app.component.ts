import { Component } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {MatTooltip} from '@angular/material/tooltip';
import {StorageService} from './services/storage/storage.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, NgIf, MatMenuItem, RouterLink, MatDivider, MatButton, MatTooltip],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '2fa-angular';
  isAdminLoggedIn: boolean = false;
  isCustomerLoggedIn: boolean = false;
  userName: string | null = null;

  constructor(private router: Router, private snackBar: MatSnackBar) {
  }

  ngOnInit(){
    this.isAdminLoggedIn = StorageService.isAdminLoggedIn();
    this.isCustomerLoggedIn = StorageService.isCustomerLoggedIn();
    this.userName = StorageService.getUserName();
    this.router.events.subscribe(event => {
      if(event.constructor.name === "NavigationEnd"){
        this.isAdminLoggedIn = StorageService.isAdminLoggedIn();
        this.isCustomerLoggedIn = StorageService.isCustomerLoggedIn();
        this.userName = StorageService.getUserName();
      }
    })
  }

  logout(){
    StorageService.signout();
    this.router.navigateByUrl("/login");
  }

  shareSite(){
    //logic for sharing the site
  }
}
