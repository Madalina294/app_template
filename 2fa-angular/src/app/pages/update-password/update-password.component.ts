import { Component } from '@angular/core';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-update-password',
  imports: [
    MatFormField,
    MatInput,
    MatButton
  ],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent {

  resetForgottenPassword() {
    // sending an email with a pin to reset old password
  }
}
