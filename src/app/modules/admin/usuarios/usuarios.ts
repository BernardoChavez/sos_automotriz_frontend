import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../core/services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html'
})
export class UsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  
  usuarios: any[] = [];
  mostrarModal = false;
  nuevoUsuario = { nombre: '', email: '', rol: 'cliente', password: '', telefono: '' };

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = [...data];
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(user?: any) { 
    if (user) {
      this.nuevoUsuario = { ...user };
      this.editandoId = user.id;
    } else {
      this.nuevoUsuario = { nombre: '', email: '', rol: 'cliente', password: '', telefono: '' };
      this.editandoId = null;
    }
    this.mostrarModal = true; 
  }
  
  cerrarModal() { this.mostrarModal = false; }

  editandoId: number | null = null;
  get editando() { return this.editandoId !== null; }

  registrar() {
    if (this.editandoId) {
      this.usuariosService.actualizarUsuario(this.editandoId, this.nuevoUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert("Error al actualizar: " + (err.error?.detail || 'Fallo conexión'))
      });
    } else {
      this.usuariosService.crearUsuario(this.nuevoUsuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => alert("Error al crear: " + (err.error?.detail || 'Fallo conexión'))
      });
    }
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(() => this.cargarUsuarios());
    }
  }
}