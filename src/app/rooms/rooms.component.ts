import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomCardComponent } from '../component/ui/room-card/room-card.component';
import { RoomService } from '../_services/room.service';
import { HttpClient } from '@angular/common/http';
import { debounce, debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-public-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RoomCardComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class PublicRoomsComponent implements OnInit, OnDestroy {
  filter = {
    cityCode: '',
    wardCode: '',
    priceOption: 'all',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sort: '',
    page: 0,
    size: 6,
  };

  provinces: any[] = [];
  wards: any[] = [];
  totalElements = 0;
  isLoading = true;
  rooms: any[] = [];
  totalPages = 0;
  private priceInput$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.priceInput$.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilter();
    });
  }
  ngOnInit(): void {
    this.loadProvinces();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.filter.cityCode = params['cityCode'] || '';
      this.filter.wardCode = params['wardCode'] || '';
      this.filter.priceOption = params['price'] || params['priceOption'] || 'all';
      switch (this.filter.priceOption) {
        case 'all':
          this.filter.minPrice = null;
          this.filter.maxPrice = null;
          break;
        case 'under2':
          this.filter.minPrice = 0;
          this.filter.maxPrice = 2000000;
          break;
        case '2to4':
          this.filter.minPrice = 2000000;
          this.filter.maxPrice = 4000000;
          break;
        case 'over4':
          this.filter.minPrice = 4000000;
          this.filter.maxPrice = 9999999999;
          break;
      }
      if (params['minPrice']) this.filter.minPrice = Number(params['minPrice']);
      if (params['maxPrice']) this.filter.maxPrice = Number(params['maxPrice']);
      this.filter.sort = params['sort'] || 'NEWEST';
      this.filter.page = params['page'] ? Number(params['page']) : 0;
      if (this.filter.cityCode) this.loadWard(this.filter.cityCode);
      this.loadRooms();
    });
  }
  loadProvinces() {
    this.http.get('https://provinces.open-api.vn/api/v2/p/').subscribe((res: any) => {
      this.provinces = res;
    });
  }

  onProvinceChange() {
    this.filter.wardCode = '';
    if (this.filter.cityCode) {
      this.loadWard(this.filter.cityCode);
    } else {
      this.wards = [];
    }
    this.applyFilter();
  }
  loadWard(cityCode: string) {
    this.http
      .get(`https://provinces.open-api.vn/api/v2/p/${cityCode}?depth=2`)
      .subscribe((res: any) => {
        this.wards = res.wards;
      });
  }
  onPriceRadioChange(option: string) {
    this.filter.priceOption = option;
    switch (this.filter.priceOption) {
      case 'all':
        this.filter.minPrice = null;
        this.filter.maxPrice = null;
        break;
      case 'under2':
        this.filter.minPrice = 0;
        this.filter.maxPrice = 2000000;
        break;
      case '2to4':
        this.filter.minPrice = 2000000;
        this.filter.maxPrice = 4000000;
        break;
      case 'over4':
        this.filter.minPrice = 4000000;
        this.filter.maxPrice = 9999999999;
        break;
    }
    this.applyFilter();
  }

  onCustomPriceTyping() {
    this.filter.priceOption = 'custom';
    this.priceInput$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter() {
    this.filter.page = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filter,
      queryParamsHandling: 'merge',
    });
  }
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = newPage;
      this.applyFilter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearFilter() {
    this.router.navigate([]);
  }
  loadRooms() {
    this.isLoading = true;
    this.roomService.getPublicRooms(this.filter).subscribe({
      next: (res: any) => {
        this.rooms = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
