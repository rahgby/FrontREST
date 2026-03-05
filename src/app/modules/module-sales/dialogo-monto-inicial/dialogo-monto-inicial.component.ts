// dialogo-monto-inicial.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialogo-monto-inicial',
  templateUrl: './dialogo-monto-inicial.component.html',
  styleUrls: ['./dialogo-monto-inicial.component.css']
})
export class DialogoMontoInicialComponent {
  montoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogoMontoInicialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.montoForm = this.fb.group({
      montoInicial: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.montoForm.valid) {
      this.dialogRef.close(this.montoForm.value.montoInicial);
    }
  }
}