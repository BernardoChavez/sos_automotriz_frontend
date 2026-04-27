import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common'; // Importamos UpperCasePipe
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  public authService = inject(AuthService); 

  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}