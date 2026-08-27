import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadService, DocumentosUpload } from './file-upload.service';
import { CommonModule } from '@angular/common';

interface DocumentoRequerido {
  key: keyof DocumentosUpload;
  label: string;
  description?: string;
  file: File | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  uploadForm: FormGroup;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';

  documentosList: DocumentoRequerido[] = [
    { key: 'doc_cedula', label: 'Cédula por ambos lados', file: null },
    { key: 'doc_bachi_media', label: 'Título de Bachillerato en Educación Media', file: null },
    { key: 'doc_bachi_uni', label: 'Título de Bachillerato Universitario', file: null },
    { key: 'doc_licenciatura', label: 'Título de Licenciatura', file: null },
    { key: 'doc_maestria', label: 'Título de Maestría', file: null },
    { key: 'doc_comprobante', label: 'Comprobante de pago', file: null }
  ];

  constructor(
    private fb: FormBuilder,
    private fileUploadService: FileUploadService
  ) {
    this.uploadForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required]
    });
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentosList[index].file = input.files[0];
    }
  }

  removeFile(index: number): void {
    this.documentosList[index].file = null;
  }

  // Verifica si al menos un archivo fue seleccionado (o si se requieren todos, se ajustaría aquí)
  get hasAnyFile(): boolean {
    return this.documentosList.some(doc => doc.file !== null);
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.documentosList.forEach(doc => doc.file = null);
    this.uploadStatus = 'idle';
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.hasAnyFile) {
      this.uploadStatus = 'uploading';
      const { nombre, apellidos } = this.uploadForm.value;

      const payload: DocumentosUpload = {};
      this.documentosList.forEach(doc => {
        if (doc.file) {
          payload[doc.key] = doc.file;
        }
      });

      this.fileUploadService.uploadFiles(nombre, apellidos, payload).subscribe({
        next: () => {
          this.uploadStatus = 'success';
          setTimeout(() => {
            this.resetForm();
          }, 4000);
        },
        error: (err) => {
          console.error('Error al subir los archivos:', err);
          this.uploadStatus = 'error';
          // Permitir reintento después de un tiempo
          setTimeout(() => {
            this.uploadStatus = 'idle';
          }, 5000);
        }
      });
    } else {
      this.uploadForm.markAllAsTouched();
    }
  }
}
