import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-landlord-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './landlord-layout.component.html',
  styleUrl: './landlord-layout.component.scss',
})
export class LandlordLayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly mobileBreakpoint = 1024;

  isSidebarOpen = false;
  isDesktopSidebarCollapsed = false;
  isMobileView = false;
  username = 'Chủ nhà';

  constructor(
    private storageService: StorageService,
    private router: Router,
  ) {
    this.syncViewportState();

    if (this.storageService.isLoggedIn()) {
      this.username = this.storageService.getUser().username;
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.isMobileView) {
          this.closeSidebar();
        }
      });
  }

  get isSidebarVisible() {
    return this.isMobileView ? this.isSidebarOpen : !this.isDesktopSidebarCollapsed;
  }

  toggleSidebar() {
    if (this.isMobileView) {
      this.isSidebarOpen = !this.isSidebarOpen;
      return;
    }

    this.isDesktopSidebarCollapsed = !this.isDesktopSidebarCollapsed;
  }

  closeSidebar() {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  handleNavClick() {
    if (this.isMobileView) {
      this.closeSidebar();
    }
  }

  logout() {
    this.closeSidebar();
    this.storageService.clean();
    this.router.navigate(['/login']);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.syncViewportState();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isMobileView && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  private syncViewportState() {
    if (typeof window === 'undefined') return;

    this.isMobileView = window.innerWidth <= this.mobileBreakpoint;
    if (!this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }
}
