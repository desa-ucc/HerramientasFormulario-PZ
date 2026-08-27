import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentosUpload {
  doc_cedula?: File;
  doc_bachi_media?: File;
  doc_bachi_uni?: File;
  doc_licenciatura?: File;
  doc_maestria?: File;
  doc_comprobante?: File;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private webhookUrl = environment.webhookUrl;

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos personales y los múltiples archivos al webhook de n8n.
   */
  uploadFiles(nombre: string, apellidos: string, documentos: DocumentosUpload): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellidos', apellidos);

    // Iteramos sobre las claves exactas requeridas para n8n
    if (documentos.doc_cedula) formData.append('doc_cedula', documentos.doc_cedula);
    if (documentos.doc_bachi_media) formData.append('doc_bachi_media', documentos.doc_bachi_media);
    if (documentos.doc_bachi_uni) formData.append('doc_bachi_uni', documentos.doc_bachi_uni);
    if (documentos.doc_licenciatura) formData.append('doc_licenciatura', documentos.doc_licenciatura);
    if (documentos.doc_maestria) formData.append('doc_maestria', documentos.doc_maestria);
    if (documentos.doc_comprobante) formData.append('doc_comprobante', documentos.doc_comprobante);

    return this.http.post(this.webhookUrl, formData);
  }
}
