import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../_services/room.service';
import { RoomCardComponent } from '../component/ui/room-card/room-card.component';
import { ScrollRevealDirective } from '../_directives/scroll-reveal.directive';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, RoomCardComponent, ScrollRevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  searchForm: any = {
    cityCode: '',
    wardCode: '',
    price: '',
  };
  district = '';
  availableLocations: string[] = [];
  latestRooms: any[] = [];

  constructor(
    private roomService: RoomService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}
  ngOnInit(): void {
    this.fetchLatestRoom();
    this.fetchLocations();
    this.http.get('https://provinces.open-api.vn/api/v2/p/').subscribe((res: any) => {
      this.provinces = res;
    });
  }

  fetchLatestRoom(): void {
    this.roomService.getLatestRooms().subscribe({
      next: (data) => {
        this.latestRooms = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  fetchLocations() {
    this.roomService.getAvailableLocations().subscribe({
      next: (data) => {
        this.availableLocations = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  provinces: any[] = [];
  wards: any[] = [];

  onDistrictChange() {
    if (this.district === '') {
      this.searchForm.cityCode = '';
      this.searchForm.wardCode = '';
    } else {
      this.searchForm.cityCode = this.provinces.find(
        (a) => a.name === this.district.split(', ')[1],
      ).code; // string a = thanh xuan| ha noi -> a.split('| ') -> [thanh xuan, ha noi]
      this.http
        .get(`https://provinces.open-api.vn/api/v2/p/${this.searchForm.cityCode}?depth=2`)
        .subscribe((res: any) => {
          this.wards = res.wards;
          this.searchForm.wardCode = this.wards.find(
            (a) => a.name === this.district.split(', ')[0],
          ).code;
        });
    }
  }

  onSearch(): void {
    this.router.navigate(['/rooms'], { queryParams: this.searchForm });
  }
}
