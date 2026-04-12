import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../navbar/navbar';
import { environment } from '../../../../environments';

@Component({
  selector: 'app-dashboard-taller',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-taller.html'
})
export class DashboardTallerComponent implements OnInit {
  adminInfo: any = null;
  tallerInfo: any = null;
  tecnicos: any[] = [];
  mensajeExito: string = '';

  nuevoTecnico = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'tecnico',
    especialidad_principal: 'Mecánica General',
    taller_id: null as number | null
  };

  private apiUsuarios = `${environment.apiUrl}/usuarios`;
  private apiTalleres = `${environment.apiUrl}/talleres`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.adminInfo = JSON.parse(userStr);
      if (this.adminInfo?.taller_id) {
        this.nuevoTecnico.taller_id = this.adminInfo.taller_id;
        this.obtenerMisTecnicos();
        this.cargarInfoTaller();
      }
    }
  }

  cargarInfoTaller() {
    this.http.get(`${this.apiTalleres}/${this.adminInfo.taller_id}`).subscribe({
      next: (res) => {
        this.tallerInfo = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar taller:", err)
    });
  }

  // --- CU 7: ACTUALIZAR CONFIGURACIÓN DEL TALLER ---
  actualizarConfiguracion() {
    this.http.put(`${this.apiTalleres}/${this.adminInfo.taller_id}`, this.tallerInfo).subscribe({
      next: (res: any) => {
        this.mensajeExito = 'Configuración guardada correctamente.';
        this.tallerInfo = res;
        this.cdr.detectChanges();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => alert("No se pudo actualizar la configuración del taller")
    });
  }

  toggleEstadoTaller() {
    const nuevoEstado = !this.tallerInfo.esta_activo;
    this.http.patch(`${this.apiTalleres}/${this.adminInfo.taller_id}/estado?activo=${nuevoEstado}`, {})
      .subscribe({
        next: (res: any) => {
          this.tallerInfo.esta_activo = res.nuevo_estado;
          this.cdr.detectChanges();
        },
        error: (err) => alert("No se pudo cambiar el estado del taller")
      });
  }

  obtenerMisTecnicos() {
    this.http.get<any[]>(`${this.apiUsuarios}/taller/${this.adminInfo.taller_id}`).subscribe({
      next: (res) => {
        this.tecnicos = [...res];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al obtener técnicos:", err)
    });
  }

  registrarTecnico() {
    if (!this.nuevoTecnico.nombre || !this.nuevoTecnico.email || !this.nuevoTecnico.password) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }
    this.http.post(`${this.apiUsuarios}/registrar`, this.nuevoTecnico).subscribe({
      next: () => {
        alert('Técnico contratado con éxito.');
        this.obtenerMisTecnicos();
        this.limpiarFormulario();
      },
      error: (err) => alert('No se pudo registrar: ' + (err.error?.detail || 'Error'))
    });
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Deseas eliminar a este técnico?')) {
      this.http.delete(`${this.apiUsuarios}/${id}`).subscribe({
        next: () => this.obtenerMisTecnicos()
      });
    }
  }

  limpiarFormulario() {
    this.nuevoTecnico = {
      nombre: '', email: '', password: '', telefono: '',
      rol: 'tecnico', especialidad_principal: 'Mecánica General',
      taller_id: this.adminInfo.taller_id
    };
  }
}