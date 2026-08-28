import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { FileUploadComponent } from './app/file-upload/file-upload.component';

bootstrapApplication(FileUploadComponent, {
    providers: [
        provideHttpClient(),
        provideRouter([]) // Habilitamos router para leer query params
    ]
})
  .catch(err => console.error(err));
