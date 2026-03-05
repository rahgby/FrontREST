import { Component } from '@angular/core';
import { AuditLog, AuditoriaService } from '../services/auditoria.service';
import { PageEvent } from '@angular/material/paginator';
import { UsuarioService } from '../../module-staff/services/usuario.service';

@Component({
  selector: 'app-vista-auditoria',
  templateUrl: './vista-auditoria.component.html',
  styleUrls: ['./vista-auditoria.component.css']
})
export class VistaAuditoriaComponent {

dataSource: AuditLog[] = [];
displayedColumns: string[] = ['id', 'fecha', 'usuario', 'accion', 'entidad', 'idRef', 'ip'];
totalRegistros = 0;
paginaActual = 0; 
tamanoPagina = 10;
opcionesTamano = [5, 10, 25, 50];
filtroEntidad: string = '';
listaEntidades: string[] = ['PEDIDO', 'USUARIO', 'PLATO', 'MESA', 'CAJA']; // Tus entidades fijas

dataSourceUsuarios: any[] = [];
  displayedColumnsUsuarios: string[] = ['avatar', 'nombre', 'codigo', 'rol', 'version', 'acciones'];

constructor(private auditService: AuditoriaService, private usuarioService: UsuarioService) { }
ngOnInit(): void {
  this.cargarAuditoria();
  this.cargarUsuariosActivos();
}
cargarAuditoria() {
  const apiPage = this.paginaActual + 1;
  this.auditService.getLogs(this.filtroEntidad, apiPage, this.tamanoPagina)
    .subscribe({
      next: (res) => {
        if (res.success) {
          this.dataSource = res.data;
          this.totalRegistros = res.total;
        }
      },
      error: (err) => console.error('Error cargando auditoría:', err)
    });
}

cambiarPagina(e: PageEvent) {
  this.paginaActual = e.pageIndex;
  this.tamanoPagina = e.pageSize;
  this.cargarAuditoria();
}

aplicarFiltro() {
  this.paginaActual = 0;
  this.cargarAuditoria();
  this.cargarUsuariosActivos();
}

cargarUsuariosActivos() {
  this.usuarioService.getUsuariosActivos().subscribe({
    next: (data) => {
      // La API devuelve un array directo según tu JSON ejemplo
      this.dataSourceUsuarios = data; 
    },
    error: (err) => console.error('Error cargando usuarios:', err)
  });
}

darPatada(usuario: any) {
  // 1. Confirmación de seguridad (usando window.confirm básico o SweetAlert)
  if (!confirm(`quieres expulsar a ${usuario.nombre}? Esto cerrará su sesión inmediatamente.`)) {
    return;
  }

  // 2. Ejecutar la patada
  // IMPORTANTE: deleteUsuario espera un ID, lo sacamos del objeto usuario
  this.usuarioService.deleteUsuario(usuario.idUsuario).subscribe({
    next: (res) => {
      if (res.success) {
        // 3. Éxito: Recargamos ambas tablas
        // Recargamos usuarios para que desaparezca de la lista
        this.cargarUsuariosActivos(); 
        // Recargamos auditoría para ver el log de "ELIMINAR USUARIO" que acabas de crear
        this.cargarAuditoria(); 
        
        alert(`¡${usuario.nombre} a tomar por c chaval!`);
      } else {
        alert('No se pudo expulsar: ' + res.message);
      }
    },
    error: (err) => alert('Error en el servidor al intentar expulsar.')
  });
}
}


