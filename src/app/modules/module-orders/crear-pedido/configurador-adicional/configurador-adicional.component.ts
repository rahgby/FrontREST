import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Plato } from '../../interface/Items';


export interface ConfiguracionInstancia {
  instanciaIndex: number;
  adicionales: any[]; 

}

@Component({
  selector: 'app-configurador-adicional',
  templateUrl: './configurador-adicional.component.html',
  styleUrls: ['./configurador-adicional.component.css']
})

export class ConfiguradorAdicionalComponent {

  instancias: ConfiguracionInstancia[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConfiguradorAdicionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { plato: Plato, cantidad: number }
  ) { }

  ngOnInit(): void {
    for (let i = 0; i < this.data.cantidad; i++) {
      this.instancias.push({
        instanciaIndex: i + 1,
        adicionales: [],

      });
    }
  }

  estaSeleccionado(instancia: ConfiguracionInstancia, adicional: any): boolean {
    return instancia.adicionales.some(a => a.idAdicional === adicional.idAdicional);
  }

  toggleAdicional(instancia: ConfiguracionInstancia, adicional: any) {
    const index = instancia.adicionales.findIndex(a => a.idAdicional === adicional.idAdicional);

    if (index > -1) {
      instancia.adicionales.splice(index, 1);
    } else {
      instancia.adicionales.push({
        idAdicional: adicional.idAdicional,
        nombre: adicional.nombre,
        precio: adicional.precio,

      });
    }
  }

  getAdicionalCantidad(instancia: ConfiguracionInstancia, adicional: any): number {
    const found = instancia.adicionales.find(a => a.idAdicional === adicional.idAdicional);
    return found ? found.cantidad : 0;
  }

  cambiarCantidadAdicional(instancia: ConfiguracionInstancia, adicional: any, cambio: number) {
    const index = instancia.adicionales.findIndex(a => a.idAdicional === adicional.idAdicional);

    if (index > -1) {
      instancia.adicionales[index].cantidad += cambio;

      if (instancia.adicionales[index].cantidad <= 0) {
        instancia.adicionales.splice(index, 1);
      }
    } else if (cambio > 0) {
      instancia.adicionales.push({
        idAdicional: adicional.idAdicional,
        adicional: adicional.nombre, 
        precio: adicional.precio,
        cantidad: 1
      });
    }
  }


  confirmar() {
    const resultado = this.instancias.map(ins => {
    
      const totalExtras = ins.adicionales.reduce((acc, ad) => acc + (ad.precio * ad.cantidad), 0);
      
    
      const subtotalCalculado = this.data.plato.precio + totalExtras;
  
      return {
        idPlato: this.data.plato.idPlato,
        nombre: this.data.plato.nombre,
        precio: this.data.plato.precio,
        categoria: this.data.plato.categoria,
        detalleSabores: this.data.plato.detalleSabores,
        cantidad: 1, // Cada instancia es 1 unidad
        detallePedidoAdicional: ins.adicionales.map(ad => ({
          idAdicional: ad.idAdicional,
          adicional: ad.adicional,
          cantidad: ad.cantidad,
          precio: ad.precio 
        })),
        esPersonalizado: true,
        imgRuta: this.data.plato.imgRuta,
        descripcion: this.data.plato.descripcion,
        subtotal: subtotalCalculado
      };
    });
  
    this.dialogRef.close(resultado);
  }
}
