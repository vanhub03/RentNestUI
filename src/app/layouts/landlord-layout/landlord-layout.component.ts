import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-landlord-layout',
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './landlord-layout.component.html',
  styleUrl: './landlord-layout.component.scss',
})
export class LandlordLayoutComponent {
  isSidebarOpen = false;
  username = 'Chủ nhà';
  constructor(
    private storageService: StorageService,
    private router: Router,
  ) {
    if (this.storageService.isLoggedIn()) {
      this.username = this.storageService.getUser().username;
    }
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  logout() {
    this.storageService.clean();
    this.router.navigate(['/login']);
  }
}
