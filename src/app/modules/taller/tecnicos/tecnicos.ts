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
  public authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  
  get esTecnico(): boolean {
    return this.authService.currentUser?.rol === 'tecnico';
  }

  get esSuperAdmin(): boolean {
    return this.authService.currentUser?.rol === 'super_admin';
  }
  
  tecnicos: any[] = [];
  miPerfil: any = { especialidad_principal: '', disponible: false };
  mostrarModal = false;
  nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };

  ngOnInit() {
    // Aseguramos que el usuario esté cargado
    if (this.authService.currentUser) {
        this.inicializar();
    } else {
        // Si no está cargado, esperamos un poco (fallback)
        setTimeout(() => this.inicializar(), 500);
    }
  }

  inicializar() {
    if (this.esTecnico) {
      this.cargarMiPerfil();
    } else {
      this.cargarTecnicos();
    }
  }

  cargarMiPerfil() {
    this.tecnicosService.getMiPerfil().subscribe((data: any) => {
      this.miPerfil = data;
      this.cdr.detectChanges();
    });
  }

  guardarMiPerfil() {
    this.tecnicosService.updateMiPerfil(this.miPerfil).subscribe(() => {
      alert('Perfil actualizado correctamente');
      this.cdr.detectChanges();
    });
  }

  cargarTecnicos() {
    const tallerId = this.authService.currentUser?.taller_id;
    this.tecnicosService.getTecnicos(tallerId).subscribe((data: any) => {
      this.tecnicos = data;
      this.cdr.detectChanges();
    });
  }

  abrirModal() {
    this.nuevoTecnico = { nombre: '', email: '', password: '', rol: 'tecnico' };
    this.mostrarModal = true;
  }

  guardar() {
    const tallerId = this.authService.currentUser?.taller_id;
    const payload = { ...this.nuevoTecnico, taller_id: tallerId };
    
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
}
