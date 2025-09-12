import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import {RegisterRequest} from '../../models/register-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import {RouterLink, Router} from '@angular/router';
import {AuthenticationService} from '../../services/auth/authentication.service';
import {VerificationRequest} from '../../models/verification-request';
import {NgIf} from '@angular/common';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent} from 'ng-zorro-antd/form';
import {NzMessageService} from 'ng-zorro-antd/message';
import {StorageService} from '../../services/storage/storage.service';
import { UserStateService } from '../../services/user-state/user-state.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    NzSpinComponent,
    NzButtonComponent,
    NzInputDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  registerRequest: RegisterRequest = {};
  authResponse: AuthenticationResponse | null = null;
  otpCode = '';
  isSpinning: boolean = false;
  isVerifying: boolean = false;
  imagePreview: string | null = null;
  selectedImageBase64: string | null = null;
  private message: NzMessageService;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    message: NzMessageService,
    private userStateService: UserStateService
  ) {
    this.message = message;
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      mfaEnabled: [false]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validare tip fișier
    if (!file.type.startsWith('image/')) {
      this.message.error('Please select a valid image file', { nzDuration: 3000 });
      return;
    }

    // Validare mărime (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.message.error('Image size must be less than 5MB', { nzDuration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      this.selectedImageBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedImageBase64 = null;
  }

  private async getDefaultUserImage(): Promise<string> {
    try {
      const response = await fetch('/user.png');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Could not load default user image:', error);
      // Return a simple default base64 image if user.png is not found
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VVNFUjwvdGV4dD48L3N2Zz4=';
    }
  }

  async registerUser() {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(control => control.markAsDirty());
      this.registerForm.updateValueAndValidity();
      return;
    }

    this.isSpinning = true;
    
    // Determină imaginea de utilizat (selectată sau default)
    let imageToUse = this.selectedImageBase64;
    if (!imageToUse) {
      imageToUse = await this.getDefaultUserImage();
    }
    
    // Populez registerRequest din form
    this.registerRequest = {
      firstname: this.registerForm.get('firstname')?.value,
      lastname: this.registerForm.get('lastname')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      role: 'USER',
      mfaEnabled: this.registerForm.get('mfaEnabled')?.value,
      image: imageToUse
    };

    this.authService.register(this.registerRequest)
      .subscribe({
        next: (response) => {
          console.log('Register response:', response); // Debug log
          
          if (response && response.mfaEnabled) {
            // Utilizatorul are 2FA activat - afișează QR code pentru setup
            this.authResponse = response;
            this.isSpinning = false;
            this.message.success('Account created! Please set up 2FA.', { nzDuration: 3000 });
          } else if (response) {
            // Utilizatorul nu are 2FA activat - loghează automat și redirectează
            this.isSpinning = false;
            
            // Verificăm că toate câmpurile necesare sunt prezente
            if (response.userId && response.userRole && response.userFirstName && response.userLastName) {
              const user = {
                id: response.userId,
                role: response.userRole,
                firstname: response.userFirstName,
                lastname: response.userLastName,
                email: this.registerRequest.email || '',
                image: response.image || null,
                mfaEnabled: response.mfaEnabled || false
              };
              
              this.userStateService.setUser(user);
              StorageService.saveToken(response.accessToken as string);
              
              this.message.success('Account created successfully! Welcome!', { nzDuration: 2000 });
              setTimeout(() => {
                this.router.navigate(['welcome']);
              }, 1000);
            } else {
              this.isSpinning = false;
              this.message.error('Registration completed but user data is incomplete. Please try logging in.', { nzDuration: 5000 });
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
          } else {
            // Response este null sau undefined
            this.isSpinning = false;
            this.message.success('Account created successfully! Please log in.', { nzDuration: 3000 });
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        },
        error: (err) => {
          this.isSpinning = false;
          if (err.status === 400) {
            this.message.error('Email already exists or invalid data', { nzDuration: 5000 });
          } else {
            this.message.error('Registration failed. Please try again.', { nzDuration: 5000 });
          }
        }
      });
  }

  verifyTfa() {
    if (this.otpCode.length !== 6) {
      this.message.error('Code must be 6 digits', { nzDuration: 3000 });
      return;
    }

    this.isVerifying = true;
    
    const verifyRequest: VerificationRequest = {
      email: this.registerRequest.email,
      code: this.otpCode
    };
    
    this.authService.verifyCode(verifyRequest)
      .subscribe({
        next: (response) => {
          // Salvez datele utilizatorului din response (care conține toate datele după verificare)
          const user = {
            id: response.userId,
            role: response.userRole,
            firstname: response.userFirstName,
            lastname: response.userLastName,
            email: this.registerRequest.email || '',
            image: response.image || null,
            mfaEnabled: true
          };
          
          this.userStateService.setUser(user);
          StorageService.saveToken(response.accessToken as string);
          
          this.message.success('2FA verified successfully! Welcome!', { nzDuration: 2000 });
          
          setTimeout(() => {
            this.isVerifying = false;
            this.router.navigate(['welcome']);
          }, 1000);
        },
        error: (err) => {
          this.isVerifying = false;
          if (err.status === 400 || err.status === 401) {
            this.message.error('Verification code is incorrect', { nzDuration: 5000 });
          } else {
            this.message.error('Verification failed. Please try again.', { nzDuration: 5000 });
          }
          this.otpCode = '';
        }
      });
  }

}
