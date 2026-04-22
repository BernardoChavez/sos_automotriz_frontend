import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Aquí es donde Angular decide si mostrar el Login o el Dashboard
  styles: []
})
export class AppComponent {
  title = 'sos-automotriz-front';
}