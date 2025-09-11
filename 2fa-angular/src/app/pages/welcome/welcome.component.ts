import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [NgIf],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  user: any = null;
  userImage: string | null = null;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.user = StorageService.getUser();
    this.userImage = this.user?.image || null;
  }

  logout(){
    StorageService.signout();
    this.router.navigateByUrl("/login")
  }

}
