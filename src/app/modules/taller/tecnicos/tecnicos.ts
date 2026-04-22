import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TecnicosService } from '../../../core/services/tecnicos';
import { AuthService } from '../../../core/services/auth';
import { UsuariosService } from '../../../core/services/usuarios';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tecnicos.html'
})
export class TecnicosComponent implements OnInit {
  private tecnicosService = inject(TecnicosService);
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  
  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }
  
  tecnicos: any[] = [];
  tallerId = this.authService.currentUser?.taller_id;
  mostrarModal = false;
  nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };

  ngOnInit() { this.cargarTecnicos(); }

  cargarTecnicos() {
    this.tecnicosService.getTecnicos(this.tallerId).subscribe(data => {
      this.tecnicos = data;
      this.cdr.detectChanges();
    });
  }

  abrirModal() {
    this.nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };
    this.mostrarModal = true;
  }

  guardar() {
    // Vinculamos el técnico al taller actual
    const payload = { ...this.nuevoTecnico, taller_id: this.tallerId };
    
    this.usuariosService.crearUsuario(payload).subscribe(() => {
      this.cargarTecnicos();
      this.mostrarModal = false;
    });
  }

  eliminar(id: number) {
    if(confirm('¿Seguro?')) {
      this.usuariosService.eliminarUsuario(id).subscribe(() => this.cargarTecnicos());
    }
  }

  toggle(tecnico: any) {
    const nuevoEstado = !tecnico.disponible;
    this.tecnicosService.toggleDisponibilidad(tecnico.usuario_id || tecnico.id, nuevoEstado).subscribe(() => {
      tecnico.disponible = nuevoEstado;
      this.cdr.detectChanges();
    });
  }
}
