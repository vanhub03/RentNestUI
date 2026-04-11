import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '../_services/room.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
})
export class RoomDetailComponent implements OnInit {
  roomId!: number;
  isLoading = true;
  room: any = null;
  isBookingModalOpen = false;
  bookingForm = {
    fullName: '',
    phone: '',
    cccd: '',
    email: '',
    moveInDate: '',
    message: '',
  };
  isGalleryOpen = false;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roomId = params['id'];
      this.loadRoomDetail();
    });
  }
  openGallery(index: number) {
    if (this.room && this.room.images && this.room.images.length > 0) {
      this.currentImageIndex = index;
      this.isGalleryOpen = true;
      document.body.style.overflow = 'hidden'; // khóa cuộn chuột trang web khi mở modal
    }
  }
  closeGallery() {
    this.isGalleryOpen = false;
    document.body.style.overflow = 'auto'; //mở lại cuộn chuột
  }
  nextImage(event?: Event) {
    if (event) event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm đóng modal
    if (this.currentImageIndex < this.room.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }
  prevImage(event?: Event) {
    if (event) event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.room.images.length - 1;
    }
  }
  loadRoomDetail(): void {
    this.isLoading = true;
    this.roomService.getRoomDetail(this.roomId).subscribe({
      next: (res) => {
        this.room = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Không tải được thông tin phòng');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  openBookingModal() {
    this.isBookingModalOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeBookingModal() {
    this.isBookingModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  submitBooking() {}
}
