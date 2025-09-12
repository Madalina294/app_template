import { Component, ChangeDetectionStrategy } from '@angular/core';
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
import { UserStateService } from './services/user-state/user-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbar, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, NgIf, MatMenuItem, RouterLink, MatDivider, MatButton, MatTooltip],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = '2fa-angular';
  
  // Signals din UserStateService - vor fi inițializate în constructor
  isAdminLoggedIn!: any;
  isCustomerLoggedIn!: any;
  userName!: any;
  userImage!: any;

  constructor(
    private router: Router, 
    private snackBar: MatSnackBar,
    private userStateService: UserStateService
  ) {
    // Inițializez signals după ce userStateService este disponibil
    this.isAdminLoggedIn = this.userStateService.isAdmin;
    this.isCustomerLoggedIn = this.userStateService.isCustomer;
    this.userName = this.userStateService.userName;
    this.userImage = this.userStateService.userImage;
  }

  ngOnInit(){
    // Nu mai e nevoie de updateUserData() - signals se actualizează automat
    this.router.events.subscribe(event => {
      if(event.constructor.name === "NavigationEnd"){
        // Reîncarcă datele din storage la navigare (pentru cazurile când se schimbă din exterior)
        this.userStateService.loadUserFromStorage();
      }
    })
  }

  logout(){
    this.userStateService.clearUser();
    this.router.navigateByUrl("/login");
  }

  shareSite(){
    //logic for sharing the site
  }
}
