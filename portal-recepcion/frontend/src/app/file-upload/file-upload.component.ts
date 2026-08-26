import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadService } from './file-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';

  constructor(
    private fb: FormBuilder,
    private fileUploadService: FileUploadService
  ) {
    this.uploadForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadForm.reset();
    this.uploadStatus = 'idle';
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploadStatus = 'uploading';
      const { nombre, apellidos } = this.uploadForm.value;

      this.fileUploadService.uploadFile(this.selectedFile, nombre, apellidos).subscribe({
        next: () => {
          this.uploadStatus = 'success';
          // Reiniciamos el formulario después de un éxito
          setTimeout(() => {
            this.removeFile();
          }, 3000);
        },
        error: (err) => {
          console.error('Error al subir el archivo:', err);
          this.uploadStatus = 'error';
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación
      this.uploadForm.markAllAsTouched();
    }
  }
}
