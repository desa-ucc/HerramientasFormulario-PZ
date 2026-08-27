import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadService } from './file-upload.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface DocumentConfig {
  key: string;
  label: string;
  url: string;
  file: File | null;
}

const ALL_DOCUMENTS: DocumentConfig[] = [
  { key: 'doc_cedula', label: 'Cédula por ambos lados', url: 'http://localhost:5678/webhook/cedula', file: null },
  { key: 'doc_bachi_media', label: 'Título de Bachillerato en Educación Media', url: 'http://localhost:5678/webhook/bachi-media', file: null },
  { key: 'doc_bachi_uni', label: 'Título de Bachillerato Universitario', url: 'http://localhost:5678/webhook/bachi-uni', file: null },
  { key: 'doc_licenciatura', label: 'Título de Licenciatura', url: 'http://localhost:5678/webhook/licenciatura', file: null },
  { key: 'doc_maestria', label: 'Título de Maestría', url: 'http://localhost:5678/webhook/maestria', file: null },
  { key: 'doc_comprobante', label: 'Comprobante de pago del documento', url: 'http://localhost:5678/webhook/comprobante', file: null }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  uploadForm: FormGroup;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  documentosList: DocumentConfig[] = [];

  constructor(
    private fb: FormBuilder,
    private fileUploadService: FileUploadService,
    private route: ActivatedRoute
  ) {
    this.uploadForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Leemos los query params para el renderizado dinámico
    this.route.queryParams.subscribe(params => {
      const reqParam = params['req'];

      // Creamos copias profundas de la configuración base para no mutarla accidentalmente
      const allDocs = ALL_DOCUMENTS.map(doc => ({ ...doc }));

      if (reqParam) {
        // Ejemplo de URL: ?req=cedula,maestria
        const requestedKeys = reqParam.split(',').map((k: string) => k.trim().toLowerCase());
        this.documentosList = allDocs.filter(doc =>
          requestedKeys.some((reqKey: string) => doc.key.toLowerCase().includes(reqKey))
        );

        // Fallback: si se manda basura en req, mostramos todos
        if (this.documentosList.length === 0) {
          this.documentosList = allDocs;
        }
      } else {
        // Sin query param, mostramos todos los documentos
        this.documentosList = allDocs;
      }
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

  get hasAnyFile(): boolean {
    return this.documentosList.some(doc => doc.file !== null);
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.documentosList.forEach(doc => doc.file = null);
    this.uploadStatus = 'idle';
  }

  async onSubmit(): Promise<void> {
    if (this.uploadForm.valid && this.hasAnyFile) {
      this.uploadStatus = 'uploading';
      const { nombre, apellidos } = this.uploadForm.value;

      // Construimos el array de peticiones de manera independiente
      const uploadPromises = this.documentosList
        .filter(doc => doc.file !== null)
        .map(doc => {
          return firstValueFrom(
            this.fileUploadService.uploadSingleFile(doc.url, doc.file!, doc.key, nombre, apellidos)
          );
        });

      try {
        // Usamos Promise.all para manejar subidas simultáneas
        await Promise.all(uploadPromises);
        this.uploadStatus = 'success';
        setTimeout(() => {
          this.resetForm();
        }, 4000);
      } catch (err) {
        console.error('Error al subir los archivos:', err);
        this.uploadStatus = 'error';
        setTimeout(() => {
          this.uploadStatus = 'idle';
        }, 5000);
      }
    } else {
      this.uploadForm.markAllAsTouched();
    }
  }
}
