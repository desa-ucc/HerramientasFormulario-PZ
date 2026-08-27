import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient) { }

  /**
   * Envía el archivo y los datos al webhook específico.
   */
  uploadSingleFile(url: string, file: File, fileKey: string, nombre: string, apellidos: string): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);

    // Adjuntamos el archivo con su clave única requerida por n8n (ej. doc_cedula)
    formData.append(fileKey, file);

    return this.http.post(url, formData);
  }
}
