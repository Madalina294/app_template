import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {StorageService} from '../../services/storage/storage.service';
import {UserService} from '../../services/user/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  imports: [
    MatFormField,
    MatInput,
    MatButton,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user = {
    firstname: null,
    lastname: null,
    email: null,
    image: null,
    password: null
  };
  updateForm!: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private snackBar: MatSnackBar){
    this.updateForm = this.fb.group({
    })
  }

  logout() {
    StorageService.signout();
    this.router.navigateByUrl("/login");
  }

  deleteAccount() {
    const userId = StorageService.getUserId();
    if(userId! == -1){
      this.userService.deleteAccount(userId).subscribe({
        next: () => {
          this.snackBar.open("Account deleted successfully!",
            "Ok", {duration: 2000});
          this.router.navigateByUrl("/register");
        },
        error: () =>{
          this.snackBar.open("Something went wrong!", "Ok");
        }
      })
    }
    else{
      this.snackBar.open("Something went wrong!", "Ok");
    }
  }
}
