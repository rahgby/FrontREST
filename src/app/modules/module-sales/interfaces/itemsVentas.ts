

export interface ResponseCommonDTO<T = any> {
    success: boolean;
    message: string;
    data: T | null;
  }
  
  export interface CajaDTO {
    idCaja?: number;
    fechaCierre?: string | Date; // Puede ir como string ISO o Date
    monto?: number;
    fechaInicio?: string | Date;
    estado?: boolean;
    montoInicial?: number;
    montoPropina?: number;
    ventaNeta?: number;
    montoYape?: number;
    montoEfectivo?: number;
    montoTarjeta?: number;
    montoPlin?: number;
}

  export interface MesaMapaCaja {
    idMesa: number;
    nombre: string;
    meseroAsignado: string;
    estadoMapa: 'LIBRE' | 'PREPARANDO' | 'ABONABLE';
  }
  
  export interface AreaMapaCaja {
    idArea: number;
    nombreArea: string;
    mesas: MesaMapaCaja[];
  }

  export interface DetalleAdicionalDTO {
    idDetallePedidoAdicional: number;
    cantidad: number;
    adicional?: string; 
    precio: number;
}

export interface ItemPedidoDTO {
    idDetallePedido: number;
    cantidad: number;
    subtotal: number;
    comentario: string;
    idPedido: number;
    idPlato: number;
    plato: string;
    precio: number;
    idPromocion?: number;
    descuento?: number;
    promocion?: string;
    idSabor?: number;
    sabor?: string;
    tipoPapas?: string;
    
    detallePedidoAdicional: DetalleAdicionalDTO[];
}

export interface PedidoPorCobrarDTO {
    idPedido: number;
    nombreCliente: string; 
    totalPedido: number;
    estado: string; 
    fechaRegistro: string; 
    esAdicional: boolean;
    idPedidoPadre?: number;
    items: ItemPedidoDTO[];
}

export interface FinalizarCobroDTO {
  totalParcial: number;
  vuelto: number;
  boletaFactura: string;
  fechaRegistro: Date; // Angular lo mandará como ISO String, .NET lo entiende
  idCaja: number;
  idMesa: number;
  descuento? : number;
  precioDelivery?: number;
  idsPedidos: number[];
  detallesPago: MetodoPagoDetalleDTO[];
  montoPropina?: number; // Nuevo campo para propina, opcional

}

export interface MetodoPagoDetalleDTO {
  metodo: string; // 'EFECTIVO', 'TARJETA', 'YAPE'
  monto: number;
}



export interface ResumenCuentaDTO {
    idMesa: number;
    nombreMesa: string;
    totalGeneral: number;
    tienePedidosEnCocina: boolean; 
    mensajeAlerta?: string;
    pedidos: PedidoPorCobrarDTO[];
}

export interface TotalPorMetodoDTO {
  metodoPago: string;          
  total: number;               // Monto acumulado
  cantidadTransacciones: number; 
}

// El objeto "respuesta" que armaste en el Controller
export interface ReporteCajaDTO {
  idCaja: number;
  totalGeneral: number;        // La suma de todo
  desglose: TotalPorMetodoDTO[]; // La lista detallada
}

export interface VentaDTO {
  idVenta: number;
  correlativo: number;
  estado: boolean;
  total: number;
  metodoPago: string;
  boletaFactura: string;
  fechaRegistro: string; 
  fechaAbonado: string; 
  esCajaActual: boolean;
  idCaja: number;
  detalleVentaPago: DetalleVentaPago[];
  detalleVentaPedido?: any[]; // Opcional, por si en el futuro decides traer el desglose de los platos
  isDelivery: boolean; // <--- AGREGADO
  precioDelivery?: number;
  descuento?: number;

}

export interface DetalleVentaPago {
  idVenta: number;
  metodoPago: string;
  monto: number;
  idCaja: number;
}

export interface DetallePedidoAdicionalDTO {
  idDetallePedidoAdicional: number;
  cantidad: number;
  idDetallePedido: number;
  idAdicional: number;
  adicional: string;
  precio: number;
}

export interface DetallePedidoDTO {
  idDetallePedido: number;
  cantidad: number;
  subtotal: number;
  comentario?: string | null;
  idPedido: number;
  idPlato: number;
  plato?: string | null;
  precio: number;
  idPromocion?: number | null;
  descuento?: number | null;
  promocion?: string | null;
  idSabor?: number | null;
  sabor?: string | null;
  tipoPapas?: string | null;
  detallePedidoAdicional?: DetallePedidoAdicionalDTO[];
}

export interface PedidoDTO {
  idPedido: number;
  estado: boolean;
  estadoPedido: string;
  monto: number;
  fechaRegistro: string;
  fechaEliminado?: string | null;
  ultModificacion: string;
  idUsuario: number;
  usuario?: string | null;
  idCliente?: number | null;
  documentoCliente?: string | null;
  tipoDocCliente?: string | null;
  cliente?: string | null;
  nombreCliente?: string | null;
  idMesa?: number | null;
  mesa?: string | null;  // Aquí estaba uno de los problemas del HTML
  isDelivery: boolean;
  idPedidoPadre?: number | null;
  esAdicional: boolean;
  detallePedido?: DetallePedidoDTO[];
}