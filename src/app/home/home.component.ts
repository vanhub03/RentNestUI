import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../_services/room.service';
import { RoomCardComponent } from '../component/ui/room-card/room-card.component';
import { ScrollRevealDirective } from '../_directives/scroll-reveal.directive';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, RoomCardComponent, ScrollRevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  searchForm: any = {
    district: '',
    price: '',
  };
  availableLocations: string[] = [];
  latestRooms: any[] = [];

  constructor(
    private roomService: RoomService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.fetchLatestRoom();
    this.fetchLocations();
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

  onSearch(): void {
    this.router.navigate(['/rooms'], { queryParams: this.searchForm });
  }
}
