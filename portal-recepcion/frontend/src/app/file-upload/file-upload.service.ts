import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private http: HttpClient) { }

  /**
   * Envía un único archivo a su webhook específico junto con los datos personales.
   */
  uploadSingleFile(url: string, file: File, key: string, nombre: string, apellidos: string): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);

    // Adjuntamos el archivo con su clave única requerida por n8n
    formData.append(key, file);

    return this.http.post(url, formData);
  }
}
