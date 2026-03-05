export interface BoletaData {
  nombreRestaurante: string;
  direccion: string;
  ruc: string;
  numeroBoleta: string;
  documentoCliente?: string;
  tipoDocumentoCliente?: string; 
  fecha: string;
  items: BoletaItem[];
  subtotal: number;       // Subtotal con IGV incluido
  subtotalNeto: number;   // Subtotal sin IGV (nuevo campo)
  igv: number;
  total: number;
  metodoPago: string;
  nombreCliente: string;
  mesa: string;
  usuario: string;
  comisionTarjeta?: number;
  propina?: number;
  totalNetoConIgv: number;
}
export interface BoletaItem {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
  adicionales?: AdicionalItem[];
  comentario?: string;
}

export interface AdicionalItem {
  nombre: string;
  cantidad: number;
  precio: number;
}