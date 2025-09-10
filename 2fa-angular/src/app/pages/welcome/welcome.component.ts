import { Component } from '@angular/core';
import {StorageService} from '../../services/storage/storage.service';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  constructor() {
  }

  logout(){
    StorageService.signout();
  }

}
