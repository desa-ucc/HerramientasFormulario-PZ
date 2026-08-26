import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // URL del Webhook inyectada mediante variables de entorno (Angular enviroments)
  private webhookUrl = environment.webhookUrl;

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos del formulario y el archivo al webhook de n8n.
   * @param file El archivo seleccionado por el usuario.
   * @param nombre Nombre del usuario.
   * @param apellidos Apellidos del usuario.
   */
  uploadFile(file: File, nombre: string, apellidos: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);

    // Hacemos el POST al Webhook
    return this.http.post(this.webhookUrl, formData);
  }
}
