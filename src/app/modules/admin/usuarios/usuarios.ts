import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { UsuariosService } from '../../../core/services/usuarios';
import { TalleresService } from '../../../core/services/talleres';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html'
})
export class UsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private talleresService = inject(TalleresService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  private route = inject(ActivatedRoute);


  usuarios: any[] = [];
  usuariosAgrupados: { [key: string]: any[] } = {
    'super_admin': [],
    'admin_taller': [],
    'tecnico': [],
    'cliente': []
  };
  grupoExpandido: string | null = null;

  toggleGrupo(key: string) {
    this.grupoExpandido = this.grupoExpandido === key ? null : key;
  }


  talleres: any[] = [];
  tallerSeleccionado: number | null = null;
  mostrarModal = false;
  nuevoUsuario: any = { nombre: '', email: '', rol: 'cliente', password: '', telefono: '', taller_id: null };

  get passwordValidations() {
    const pw = this.nuevoUsuario.password || '';
    return {
      min: pw.length >= 6,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /[0-9]/.test(pw),
      spec: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    };
  }

  get isPasswordStrong(): boolean {
    const v = this.passwordValidations;
    return v.min && v.upper && v.lower && v.num && v.spec;
  }

  ngOnInit() { 
    this.cargarUsuarios(); 
    this.cargarTalleres();
    
    // Leer parámetro de taller si viene de la lista de talleres
    this.route.queryParams.subscribe((params: any) => {
      if (params['taller']) {
        this.tallerSeleccionado = Number(params['taller']);
      }
    });

  }


  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = [...data];
        this.agruparUsuarios();
        this.cdr.detectChanges();
      }
    });
  }

  agruparUsuarios() {
    // Reiniciar grupos
    this.usuariosAgrupados = {
      'super_admin': [],
      'admin_taller': [],
      'tecnico': [],
      'cliente': []
    };

    this.usuarios.forEach(u => {
      if (this.usuariosAgrupados[u.rol]) {
        this.usuariosAgrupados[u.rol].push(u);
      }
    });
  }

  getTecnicosFiltrados() {
    if (!this.tallerSeleccionado) return this.usuariosAgrupados['tecnico'];
    return this.usuariosAgrupados['tecnico'].filter(t => t.taller_id == this.tallerSeleccionado);
  }

  cargarTalleres() {
    this.talleresService.getTalleres().subscribe(res => this.talleres = res);
  }

  abrirModal(user?: any) { 
    if (user) {
      this.nuevoUsuario = { ...user };
      this.editandoId = user.id;
    } else {
      this.nuevoUsuario = { nombre: '', email: '', rol: 'cliente', password: '', telefono: '', taller_id: null };
      this.editandoId = null;
    }
    this.mostrarModal = true; 
  }
  
  cerrarModal() { this.mostrarModal = false; }

  editandoId: number | null = null;
  get editando() { return this.editandoId !== null; }

  registrar() {
    const esSuperAdmin = this.authService.currentUser?.rol === 'super_admin';

    // 1. Validaciones de campos obligatorios (Saltar si es SuperAdmin y quiere dejar blancos)
    if (!esSuperAdmin) {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email) {
        alert('El nombre y el correo son obligatorios.');
        return;
      }
      
      // Si es nuevo (no editando), la contraseña es obligatoria
      if (!this.editandoId && !this.nuevoUsuario.password) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }

      // Si es Técnico o Admin Taller, el taller es obligatorio
      if ((this.nuevoUsuario.rol === 'tecnico' || this.nuevoUsuario.rol === 'admin_taller') && !this.nuevoUsuario.taller_id) {
        alert('Debes vincular al usuario a un taller.');
        return;
      }
    }

    // 2. Validar fortaleza de contraseña (si se ha escrito una)
    if (this.nuevoUsuario.password && !this.isPasswordStrong) {
      alert('La contraseña no cumple con los requisitos de seguridad (Mayúscula, Minúscula, Número, Símbolo, 6+ caracteres)');
      return;
    }

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