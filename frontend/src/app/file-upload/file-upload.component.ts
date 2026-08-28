import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadService } from './file-upload.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

export interface DocConfig {
  key: string;
  fileKey: string;
  title: string;
  url: string;
}

// URL maestra de Power Automate
const baseUrl = 'https://defaultf86f8805ad1443439a0edc1c0ff7a4.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/01/workflows/9f05005def66407699c8ce85fe91e5dc/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aczxmthnBdgWmaVGuIOEXh9ZNSqU-1m-eCrLe-axK8w';

// Diccionario de configuración de documentos unificado
const DOC_DICTIONARY: { [key: string]: DocConfig } = {
  'cedula': {
    key: 'cedula',
    fileKey: 'doc_cedula',
    title: 'Cédula por ambos lados',
    url: `${baseUrl}&tipo=cedula`
  },
  'bachi_media': {
    key: 'bachi_media',
    fileKey: 'doc_bachi_media',
    title: 'Título de Bachillerato en Educación Media',
    url: `${baseUrl}&tipo=bachi_media`
  },
  'bachi_uni': {
    key: 'bachi_uni',
    fileKey: 'doc_bachi_uni',
    title: 'Título de Bachillerato Universitario',
    url: `${baseUrl}&tipo=bachi_uni`
  },
  'licenciatura': {
    key: 'licenciatura',
    fileKey: 'doc_licenciatura',
    title: 'Título de Licenciatura',
    url: `${baseUrl}&tipo=licenciatura`
  },
  'maestria': {
    key: 'maestria',
    fileKey: 'doc_maestria',
    title: 'Título de Maestría',
    url: `${baseUrl}&tipo=maestria`
  },
  'comprobante': {
    key: 'comprobante',
    fileKey: 'doc_comprobante',
    title: 'Comprobante de pago del documento',
    url: `${baseUrl}&tipo=comprobante`
  }
};

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

  currentDoc: DocConfig | null = null;
  selectedFile: File | null = null;
  isInvalidLink: boolean = false;

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
    this.route.queryParams.subscribe(params => {
      const docParam = params['doc'];

      if (docParam && DOC_DICTIONARY[docParam.toLowerCase()]) {
        this.currentDoc = DOC_DICTIONARY[docParam.toLowerCase()];
        this.isInvalidLink = false;
      } else {
        this.currentDoc = null;
        this.isInvalidLink = true;
      }
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
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.removeFile();
    this.uploadStatus = 'idle';
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile && this.currentDoc) {
      this.uploadStatus = 'uploading';
      const { nombre, apellidos } = this.uploadForm.value;

      // ESTA ES LA LÍNEA CLAVE QUE FALTABA:
      const fileExtension = this.selectedFile.name.split('.').pop() || 'pdf';

      this.fileUploadService.uploadSingleFile(
        this.currentDoc.url,
        this.selectedFile,
        this.currentDoc.fileKey,
        nombre,
        apellidos,
        fileExtension
      ).subscribe({
        next: () => {
          this.uploadStatus = 'success';
          setTimeout(() => {
            this.resetForm();
          }, 4000);
        },
        error: (err) => {
          console.error('Error al subir el archivo:', err);
          this.uploadStatus = 'error';
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