import { Component } from '@angular/core';
import { SseServiceService } from '../core/services/sse-service.service';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent {
  constructor(private sseService: SseServiceService, private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      this.sseService.establecerConexion(token);
    }
  }
}
