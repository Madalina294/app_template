import { Component, OnInit } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [NgIf],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  user: any = null;
  userImage: string | null = null;

  constructor() {
  }

  ngOnInit() {
    this.user = StorageService.getUser();
    this.userImage = this.user?.image || null;
  }

  logout(){
    StorageService.signout();
  }

}
