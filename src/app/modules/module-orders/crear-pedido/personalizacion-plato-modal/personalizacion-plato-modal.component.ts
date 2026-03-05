import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Plato, Sabor } from '../../interface/Items';
import { PlatosServiceService } from 'src/app/modules/module-products/services/platos-service.service';

export interface DetallePersonalizado {
  comentario: string;
  idSabor?: number;
  nombreSabor?: string;
  tipoPapas?: 'fritas' | 'al hilo';
  adicionalesSeleccionados: number[];
  adicionalesCantidad: { [idAdicional: number]: number };
}

@Component({
  selector: 'app-personalizacion-plato-modal',
  templateUrl: './personalizacion-plato-modal.component.html',
  styleUrls: ['./personalizacion-plato-modal.component.css']
})
export class PersonalizacionPlatoModalComponent implements OnInit {
  
  plato!: Plato;
  cantidad: number = 1;
  comentario: string = '';
  sabores: Sabor[] = [];
  idSaborSeleccionado?: number;
  tipoPapas: 'fritas' | 'al hilo' = 'fritas';
  adicionalesSeleccionados: number[] = [];
  
  // Ahora guardamos la cantidad POR PLATO (no total)
  adicionalesCantidadPorPlato: { [idAdicional: number]: number } = {};

  constructor(
    private dialogRef: MatDialogRef<PersonalizacionPlatoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plato: Plato },
    private platosService: PlatosServiceService
  ) {}

  ngOnInit(): void {
    this.plato = this.data.plato;

    // Inicializar cantidades de adicionales POR PLATO
    this.plato.detalleAdicional.forEach(ad => {
      this.adicionalesCantidadPorPlato[ad.idAdicional] = 0;
    });

    // Cargar sabores si aplica
    this.platosService.obtenerSaboresPorPlato(this.plato.idPlato).subscribe(sabores => {
      if (sabores.length > 0) {
        this.sabores = sabores;
        this.idSaborSeleccionado = sabores[0].idSabor;
      }
    });
  }

  incrementarAdicional(idAdicional: number): void {
    this.adicionalesCantidadPorPlato[idAdicional]++;
    
    if (!this.adicionalesSeleccionados.includes(idAdicional)) {
      this.adicionalesSeleccionados.push(idAdicional);
    }
  }

  decrementarAdicional(idAdicional: number): void {
    if (this.adicionalesCantidadPorPlato[idAdicional] > 0) {
      this.adicionalesCantidadPorPlato[idAdicional]--;
      
      if (this.adicionalesCantidadPorPlato[idAdicional] === 0) {
        const index = this.adicionalesSeleccionados.indexOf(idAdicional);
        if (index > -1) {
          this.adicionalesSeleccionados.splice(index, 1);
        }
      }
    }
  }

  // Obtener cantidad TOTAL de un adicional (por plato * cantidad de platos)
  getCantidadTotalAdicional(idAdicional: number): number {
    return this.adicionalesCantidadPorPlato[idAdicional] * this.cantidad;
  }

  // Obtener precio TOTAL de un adicional
  getPrecioTotalAdicional(idAdicional: number): number {
    const ad = this.plato.detalleAdicional.find(a => a.idAdicional === idAdicional);
    return (ad?.precio || 0) * this.getCantidadTotalAdicional(idAdicional);
  }

  get subtotal(): number {
    const precioBase = this.plato.precio * this.cantidad;
    const precioExtras = this.adicionalesSeleccionados.reduce((acc, idAd) => {
      return acc + this.getPrecioTotalAdicional(idAd);
    }, 0);
    return precioBase + precioExtras;
  }

  confirmar(): void {
    const detalle: DetallePersonalizado = {
      comentario: this.comentario,
      adicionalesSeleccionados: [...this.adicionalesSeleccionados],
      // Guardamos la cantidad POR PLATO, no la total
      adicionalesCantidad: { ...this.adicionalesCantidadPorPlato }
    };
    const saborSeleccionado = this.sabores.find(s => s.idSabor === this.idSaborSeleccionado);
        if (this.idSaborSeleccionado && saborSeleccionado) {  
      detalle.idSabor = this.idSaborSeleccionado;
      detalle.nombreSabor = saborSeleccionado.nombre; // ⭐ AGREGADO
    }

    if (this.plato.categoria.toLowerCase() === 'hamburguesa') {
      detalle.tipoPapas = this.tipoPapas;
    }

    this.dialogRef.close({ cantidad: this.cantidad, detalle });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}