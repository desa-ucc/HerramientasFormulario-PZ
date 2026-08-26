import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FileUploadComponent } from './app/file-upload/file-upload.component';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(FileUploadComponent, {
    providers: [
        provideHttpClient()
    ]
})
  .catch(err => console.error(err));
