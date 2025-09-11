import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthenticationRequest} from '../../models/authentication-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import {AuthenticationService} from '../../services/auth/authentication.service';
import {Router, RouterLink} from '@angular/router';
import {VerificationRequest} from '../../models/verification-request';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormControlComponent, NzFormDirective} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzMessageService} from 'ng-zorro-antd/message';
import {StorageService} from '../../services/storage/storage.service';

@Component({
  selector: 'app-login',
  imports: [
    NgIf,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    NzSpinComponent,
    NzRowDirective,
    NzColDirective,
    NzFormDirective,
    NzFormControlComponent,
    NzInputDirective,
    NzButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authRequest: AuthenticationRequest = {};
  otpCode = '';
  authResponse: AuthenticationResponse = {};
  loginForm!: FormGroup;
  isSpinning: boolean = false;
  private message : NzMessageService;


  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
     message: NzMessageService
  ) {
    this.message = message;
    this.router = router;
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
      ]],
    });
  }


  ngOnInit() {
    this.authResponse = {}; // Reset state
    this.otpCode = '';
    this.authRequest = {};
  }


  login(){
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => control.markAsDirty());
      this.loginForm.updateValueAndValidity();
      return;
    }
    this.isSpinning = true;

    // Populez authRequest din form
    this.authRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(this.authRequest).subscribe({
      next: (res): any => {
      console.log('Login response:', res);
      this.authResponse = res; // Setez authResponse pentru a afișa QR code-ul

      if(res.userId !== null){
        if (res.mfaEnabled) {
          this.isSpinning = false;
          // Nu salvez token-ul și nu navighează - afișez QR code-ul
          return;
        }

        const user ={
          id: res.userId,
          role: res.userRole,
          firstname: res.userFirstName,
          lastname: res.userLastName,
          image: res.image
        };

        StorageService.saveUser(user);
        StorageService.saveToken(res.accessToken as string);

        if(StorageService.isAdminLoggedIn()){
          this.router.navigateByUrl("/welcome");
        }
        else if(StorageService.isCustomerLoggedIn()){
          this.router.navigateByUrl("/welcome");
        }
      }
      else{
        this.isSpinning = false;
        return this.message.error("Bad credentials", {nzDuration: 5000});
      }
      this.isSpinning = false;
    },
      error: (err) => {
      this.isSpinning = false;
      if (err && (err.status === 401 || err.status === 403)) {
        this.message.error("Email or password is incorrect", { nzDuration: 5000 });
      } else {
        this.message.error("Error at authentication. Try again.", { nzDuration: 5000 });
      }
    }
    });
  }

  verifyCode() {
    const verifyRequest: VerificationRequest = {
      email: this.authRequest.email,
      code: this.otpCode
    };
    this.isSpinning = true;

    this.authService.verifyCode(verifyRequest)
      .subscribe({
        next: (response) => {
          const user = {
            id: response.userId,
            role: response.userRole,
            firstname: response.userFirstName,
            lastname: response.userLastName,
            image: response.image
          };

          StorageService.saveUser(user);
          StorageService.saveToken(response.accessToken as string);
          this.isSpinning = false;
          this.router.navigate(['welcome']);
        },
        error: (err) => {
          this.isSpinning = false;
          this.message.error("Verification code is incorrect!", { nzDuration: 5000 });
        }
      });
  }
}
