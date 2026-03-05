import { FinalizarCobroDTO } from "../../module-sales/interfaces/itemsVentas";

export interface Mesa {
    idMesa: number;
    nombre: string;
    estado: boolean;
    idUsuario?: number | null;
    usuario?: string | null;
    idArea?: number | null;
    area?: string | null;
    habilitado: boolean;
    reservado?: boolean | null;
    total?: number | null;
    esDelUsuario: boolean;
    isMesaUnion: boolean;
    idMesaPadre?: number;
  }

  export interface Area {
    idArea: number;
    nombre: string;
    activo: boolean;
    usuariosArea?: any[] | null; // si más adelante traes usuarios, lo podés tipar mejor
  }

 
  
  export interface Categoria {
    idCategoria: number;
    nombre: string;
    
  }


 
export interface DetalleAdicional {
  idDetalle: number;
  idPlato: number;
  idAdicional: number;
  precio: number;
  nombre: string;
}


export interface Plato {
  idPlato: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  stock: number;
  precio: number;
  imgRuta: string;
  fechaRegistro: string | Date;
  fechaEliminado: string | null;
  idCategoria: number;
  categoria: string;
  detalleAdicional: DetalleAdicional[]; 
  detalleSabores: Sabores[]
}


export interface Sabor {
  idSabor: number;
  nombre: string;
  estado: boolean;
}


export interface PedidoSave {
  estado: boolean;
  estadoPedido: string;
  fechaRegistro: string;
  ultModificacion: string;
  nombreCliente: string;
  idMesa?: number;
  detallePedido: DetallePedidoSave[];
  isDelivery?: boolean; // 👈 opcional


}

export interface UnirMesasDTO {
  idMesaPrincipal: number;
  idsMesasAUnir: number[];
}

export interface DividirMesasDTO {
  idMesaPrincipal: number;
}


export interface DetallePedidoSave {
  cantidad: number;
  comentario: string;
  idPlato: number;
  idSabor?: number;       
  tipoPapas?: 'fritas' | 'al hilo'; // opcional, solo hamburguesa
  sabor? : string
  detallePedidoAdicional: DetallePedidoAdicionalSave[];
}

export interface DetallePedidoAdicionalSave {
  cantidad: number;
  idAdicional: number;
  adicional: string;      
}

export interface Sabores{
  idSabor: number;
  nombre: string;
  plato: string;
  estado: boolean
}

export interface DeliveryPagadoRequestDTO {
  pedido: PedidoSave;
  cobro: FinalizarCobroDTO;
}


export interface MesaCard {
  idMesa: number;
  nombreMesa: string;
  totalCalculado: number;
  tienePedidosEnCocina: boolean;
  horaInicio: string;
  cantidadPedidos: number;
}

export interface ApiResponseMesas {
  data: MesaCard[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

