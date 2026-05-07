import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-tenant-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './tenant-layout.component.html',
  styleUrl: './tenant-layout.component.scss',
})
export class TenantLayoutComponent {
  user: any = {};
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
  ) {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.user = this.storageService.getUser();
  }
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.storageService.clean();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  getAvatarUrl() {
    const name = encodeURIComponent(this.user.fullName || this.user.username || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=4A81D4&color=fff&size=100`;
  }
}
