import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  isAuthenticated$: Observable<boolean>;
  user:any

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }
  ngOnInit(): void {
  
  }



  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/'], { 
      queryParams: { logout: 'true' },
      replaceUrl: true 
    });
  }
}