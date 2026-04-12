export class AppComponent {
  isLoggedIn: boolean = false;
  currentPageTitle: string = 'Panel de Control';
  user: any = null;

  constructor() {
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