import { Component, ChangeDetectionStrategy, effect, ChangeDetectorRef } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {StorageService} from '../../services/storage/storage.service';
import {UserService} from '../../services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatLabel } from '@angular/material/form-field';
import { OnInit } from '@angular/core';
import {NgIf} from '@angular/common';
import { UserStateService } from '../../services/user-state/user-state.service';

@Component({
  selector: 'app-profile',
  imports: [
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatCheckbox,
    NgIf
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  updateForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  hasNewImageSelected: boolean = false;

  // Signals din UserStateService - vor fi inițializate în constructor
  user!: any;
  userName!: any;
  userImage!: any;

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private userStateService: UserStateService,
              private cdr: ChangeDetectorRef){
    // Inițializez signals după ce userStateService este disponibil
    this.user = this.userStateService.user;
    this.userName = this.userStateService.userName;
    this.userImage = this.userStateService.userImage;

    this.updateForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.email],
      mfaEnabled: [false]
    });

    // Effect pentru actualizarea formularului când se schimbă datele utilizatorului
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.updateForm.patchValue({
          firstName: currentUser.firstname,
          lastName: currentUser.lastname,
          email: currentUser.email,
          mfaEnabled: currentUser.mfaEnabled
        });
        // Setez imagePreview doar dacă utilizatorul nu a selectat o imagine nouă
        if (!this.hasNewImageSelected) {
          this.imagePreview = currentUser.image;
          console.log('Effect updated imagePreview from user:', this.imagePreview ? 'Present' : 'Null');
        } else {
          console.log('Effect skipped imagePreview update - user has new image selected');
        }
      }
    });
  }

  ngOnInit() {
    // Nu mai e nevoie de loadUserData() - effect-ul se ocupă de actualizare
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.hasNewImageSelected = true;

      // Create preview for image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        // Forțez detectarea schimbărilor pentru OnPush strategy
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  logout() {
    this.userStateService.clearUser();
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

  async updateProfile() {
    if (this.updateForm.invalid) {
      this.snackBar.open("Please fill the fields correctly!", "Ok");
      return;
    }

    const formData = this.updateForm.value;
    let imageBase64 = null;

    if (this.selectedFile) {
      try {
        imageBase64 = await this.convertFileToBase64(this.selectedFile);
      } catch (error) {
        this.snackBar.open("Error processing image!", "Ok");
        return;
      }
    }

    const currentUser = this.user();
    if (!currentUser) return;

    const updateData = {
      userId: currentUser.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      image: imageBase64,
      mfaEnabled: formData.mfaEnabled
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        this.snackBar.open("Profile updated successfully!", "Ok", { duration: 2000 });
        
        // Convertește imaginea din backend (byte array) în base64 string dacă există
        let imageBase64String = null;
        if (response.image) {
          // Dacă backend returnează byte array, convertește la base64
          if (Array.isArray(response.image)) {
            imageBase64String = `data:image/jpeg;base64,${btoa(String.fromCharCode(...response.image))}`;
          } else {
            // Dacă este deja string base64
            imageBase64String = response.image;
          }
        }

        // Actualizează imaginea cu noua imagine dacă a fost încărcată una
        const finalImage = imageBase64String || (imageBase64 ? imageBase64 : currentUser.image);
        
        // Actualizează starea prin UserStateService
        this.userStateService.updateUser({
          firstname: response.firstname || formData.firstName,
          lastname: response.lastname || formData.lastName,
          email: response.email || formData.email,
          image: finalImage,
          mfaEnabled: response.mfaEnabled || formData.mfaEnabled
        });

        // Resetează preview-ul și fișierul selectat
        this.selectedFile = null;
        this.hasNewImageSelected = false;
        this.imagePreview = finalImage;
        
        // Forțez detectarea schimbărilor
        this.cdr.markForCheck();

        if (formData.mfaEnabled && !currentUser.mfaEnabled) {
          this.snackBar.open("2FA enabled! Please login again.", "Ok", { duration: 3000 });
          setTimeout(() => {
            this.userStateService.clearUser();
            this.router.navigateByUrl("/login");
          }, 3000);
        }
      },
      error: (error) => {
         if (error.error?.message) {
          this.snackBar.open(error.error.message, "Ok");
        } else {
          this.snackBar.open("Something went wrong!", "Ok");
        }
      }
    })
  }
}
