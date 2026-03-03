import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form: any = {
    username: '',
    fullname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
    agreeTerms: false,
  };

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
  ) {}

  setRole(selectedRole: string): void {
    this.form.role = selectedRole;
  }

  onSubmit(): void {
    if (this.form.password !== this.form.confirmPassword) {
      this.toastr.error('Mật khẩu xác nhận chưa chính xác', 'Lỗi xác nhận mật khẩu');
      return;
    }
    if (!this.form.agreeTerms) {
      this.toastr.warning('Vui lòng đồng ý với các điều khoản của RentNest', 'Chưa hoàn tất');
      return;
    }

    //chuan bi data gui len backend = du lieu cua form, ngoai tru confirmPassword va agreeTerms
    const { confirmPassword, agreeTerms, ...dataToBackend } = this.form;
    this.authService.register(dataToBackend).subscribe({
      next: () => {
        this.toastr.success('Bạn đã đăng ký tài khoản thành công!', 'Tuyệt vời');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        let errorMsg = err.error?.message || 'Hệ thống đang bận, vui lòng thử lại';
        this.toastr.error(errorMsg, 'Đăng ký thất bại');
      },
    });
  }
}
