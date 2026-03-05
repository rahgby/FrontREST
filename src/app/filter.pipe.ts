import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], terminoBusqueda: string, criterio: string = 'cliente'): any[] {
    if (!items || !terminoBusqueda) {
      return items;
    }

    terminoBusqueda = terminoBusqueda.toLowerCase();

    return items.filter(item => {
      if (criterio === 'cliente') {
        return item.cliente.toLowerCase().includes(terminoBusqueda);
      } else if (criterio === 'orden') {
        return item.id.toString().includes(terminoBusqueda);
      } else if (criterio === 'monto') {
        return item.monto && item.monto.toString().includes(terminoBusqueda);
      }
      return false;
    });
  }
}