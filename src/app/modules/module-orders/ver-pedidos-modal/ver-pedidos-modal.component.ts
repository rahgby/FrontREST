import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service'; 

interface Extra {
  adicional: string;
  precio: number;
  cantidad: number;
}

@Component({
  selector: 'app-ver-pedidos-modal',
  templateUrl: './ver-pedidos-modal.component.html',
  styleUrls: ['./ver-pedidos-modal.component.css']
})
export class VerPedidosModalComponent implements OnInit {
  rolUsuario: string = '';  // ⬅️ MOVER AQUÍ, ANTES DEL CONSTRUCTOR

  constructor(
    public dialogRef: MatDialogRef<VerPedidosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService 
  ) {
   
  }

  ngOnInit() {
    // ⬅️ INICIALIZAR EL ROL AQUÍ
    const currentUser = this.authService.getCurrentUser();
    this.rolUsuario = currentUser?.rol || '';
  }

  imprimir() {
    const originalTitle = document.title;
    document.title = `Orden #${this.data.idPedido}`;

    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank', 'width=380,height=500');

    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0;
                padding: 5px;
              }
              .header { text-align: center; margin-bottom: 5px; }
              .header h2 { font-size: 14px; margin: 2px 0; }
              .divider { border-top: 1px dashed #000; margin: 3px 0; }
              .order-info p { margin: 2px 0; }
              .platillo { margin-bottom: 5px; }
              .platillo-header h3 { 
                font-size: 12px; 
                margin: 3px 0;
                display: flex;
                justify-content: space-between;
              }
              .extra { display: inline-block; margin-right: 5px; }
              .totales { 
                margin-top: 8px; 
                font-weight: bold;
                border-top: 1px solid #000;
                padding-top: 5px;
              }
              strong { font-weight: bold; }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    document.title = originalTitle;
  }

  // -------------------------------------------
  // Genera el contenido HTML para impresión
  // -------------------------------------------
  private generatePrintContent(): string {
    return `
      <div class="header">
        <h2>${this.data.restaurante || 'LA PATRONA'}</h2>
        <p>${new Date(this.data.fechaRegistro).toLocaleString()}</p>
        <p>ORDEN #${this.data.idPedido}</p>
      </div>

      <div class="order-info">
        <p><strong>CLIENTE:</strong> ${this.data.nombreCliente || '-'}</p>
        <p><strong>MESERO:</strong> ${this.data.usuario}</p>
      </div>

      <hr class="divider" />

      ${this.data.detallePedido.map((detalle: any) => `
        <div class="platillo">
          <div class="platillo-header">
            <h3>
              <span>${detalle.cantidad}x ${detalle.plato.toUpperCase()}</span>
              <span>${this.formatCurrency(detalle.precio)}</span>
            </h3>
          </div>

          ${detalle.tipoPapas ? `<p><strong>Tipo de papa:</strong> ${detalle.tipoPapas}</p>` : ''}
          ${detalle.sabor ? `<p><strong>Sabor:</strong> ${detalle.sabor}</p>` : ''}

          ${detalle.detallePedidoAdicional?.length ? `
            <p><strong>EXTRAS:</strong> 
              ${detalle.detallePedidoAdicional.map((extra: Extra) => `
                ${extra.adicional} (+${this.formatCurrency(extra.precio)}) x${extra.cantidad}
              `).join(', ')}
            </p>
          ` : ''}

          ${detalle.comentario ? `<p><strong>NOTA:</strong> ${detalle.comentario}</p>` : ''}

          <p><strong>SUBTOTAL:</strong> ${this.formatCurrency(detalle.subtotal)}</p>
        </div>
        <hr class="divider" />
      `).join('')}

      <div class="totales">
        <p><strong>TOTAL:</strong> ${this.formatCurrency(this.data.monto)}</p>
      </div>
    `;
  }

  private formatCurrency(value: number): string {
    return 'S/ ' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  esAdministrador(): boolean {
    return this.rolUsuario === 'Administrador' || this.rolUsuario === 'Mesero';
  }
  cerrar(): void {
    this.dialogRef.close();
  }
}
