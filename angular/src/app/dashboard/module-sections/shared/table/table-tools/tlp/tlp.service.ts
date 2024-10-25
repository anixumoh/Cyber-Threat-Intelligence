import { HttpUtilsService } from 'app/services/http-utils.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class TlpService {
  constructor(private httpUtils: HttpUtilsService) {}
}
