import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {

  user: any;
  constructor(private authService: AuthService) {}
  


  ngOnInit(): void {
    this.user = this.authService.getUser();
    const userRol = this.user?.rol;
  
    if (userRol) {
      this.cards = this.cards.filter(card => card.roles.includes(userRol));
    }
  }
  cards = [
    {
      title: 'Pedidos',
      image: 'https://static.vecteezy.com/ti/vetor-gratis/p1/11802262-modelo-de-avaliacao-de-restaurante-ilustracao-plana-de-desenho-animado-desenhado-a-mao-com-feedback-do-cliente-estrela-de-taxa-opiniao-de-especialistas-e-pesquisa-on-line-vetor.jpg',
      text: 'Realize Pedidos y gestione su proceso',
      link: '/pages/orders/pedidos',
      roles: ['Administrador','Mesero','Caja','Cocteles','Postres']
    },    
    {
      title: 'Caja',
      image: 'https://img.freepik.com/vector-premium/hombre-pagando-cafe-llevar-telefono-movil_81894-7059.jpg?semt=ais_hybrid&w=740&q=80',
      text: 'Realize Pedidos y gestione su proceso',
      link: '/pages/sales/ventas',
      roles: ['Administrador','Caja']
    },
    {
      title: 'Reporte',
      image: 'https://png.pngtree.com/png-clipart/20231002/original/pngtree-checklist-report-illustration-in-minimal-style-png-image_13066821.png',
      text: 'Observe las metricas de rendimiento del restaurante.',
      link: '/pages/dashboard',
      roles: ['Administrador','Caja']
    },
    {
      title: 'Productos',
      image: 'https://www.reshot.com/preview-assets/illustrations/2L7S4G9VXM/restaurant-service-2L7S4G9VXM-w600.jpg',
      text: 'Administra el catálogo completo de platillos, suministros y control de inventario.',
      link: '/pages/products/platos',
      roles: ['Administrador','Mesero','Caja','Cocteles','Postres']
    },
    {
      title: 'Personal',
      image: 'https://media.istockphoto.com/id/518716933/es/vector/avatars-de-caracteres.jpg?s=612x612&w=0&k=20&c=LW8bi76xXzLY5UYGLz2ivqbm2hk1jmvWum7UpeXz9yc=',
      text: 'Mantén actualizada la información del personal.',
      link: '/pages/staff/personal',
      roles: ['Administrador']
    }
    
  ];
  
}
