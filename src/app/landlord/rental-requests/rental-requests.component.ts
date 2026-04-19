import { filter } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RentalRequestService } from '../../_services/rental-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './rental-requests.component.html',
  styleUrl: './rental-requests.component.scss',
})
export class RentalRequests implements OnInit {
  stats: any = { total: 0, pending: 0, approved: 0, rejected: 0 };
  requests: any[] = [];
  isLoading = true;
  totalPages = 0;
  filter = {
    status: '',
    roomId: '',
    tenantName: '',
    page: 0,
    size: 5,
  };
  constructor(
    private requestService: RentalRequestService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.loadStats();
    this.loadRequests();
  }
  loadStats() {
    this.requestService.getStats().subscribe((res) => {
      this.stats = res;
      this.cdr.detectChanges();
    });
  }
  getTimeAgo(date: string): string {
    const diff = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff === 0 ? 'Hôm nay' : `${diff} ngày trước`;
  }
  onFilterChange() {
    this.filter.page = 0;
    this.loadRequests();
  }
  loadRequests() {
    this.isLoading = true;
    this.requestService.getRequests(this.filter).subscribe((res) => {
      this.requests = res.content;
      this.totalPages = res.totalPages;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = newPage;
      this.loadRequests();
    }
  }
  updateStatus(id: number, status: string) {}
}
