import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar'; // Importa tu nuevo sidebar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent], // Agrega SidebarComponent aquí
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  currentPageTitle: string = 'SOS Automotriz';
  user: any = null;

  constructor() { }

  ngOnInit() {
    this.checkLogin();
  }

  checkLogin() {
    const data = localStorage.getItem('user');
    if (data) {
      this.isLoggedIn = true;
      this.user = JSON.parse(data);
    } else {
      this.isLoggedIn = false;
    }
  }
}