import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TalleresService } from '../../../core/services/talleres';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './talleres.html'
})
export class TalleresComponent implements OnInit {
  private talleresService = inject(TalleresService);
  private cdr = inject(ChangeDetectorRef);
  
  talleres: any[] = [];
  mostrarModal = false;
  nuevoTaller = { nombre: '', direccion: '', especialidad: 'General', capacidad_teorica: 5, telefono: '' };

  ngOnInit() { this.cargarTalleres(); }

  cargarTalleres() {
    this.talleresService.getTalleres().subscribe({
      next: (data) => {
        this.talleres = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {}
    });
  }

  abrirModal() { this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  guardar() {
    this.talleresService.crearTaller(this.nuevoTaller).subscribe(() => {
      this.cargarTalleres();
      this.cerrarModal();
      this.nuevoTaller = { nombre: '', direccion: '', especialidad: 'General', capacidad_teorica: 5, telefono: '' };
    });
  }

  eliminar(id: number) {
    if(confirm('¿Seguro?')) {
      this.talleresService.eliminarTaller(id).subscribe(() => this.cargarTalleres());
    }
  }
}
