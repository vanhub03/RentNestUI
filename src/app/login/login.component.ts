import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  form: any = {
    username: '',
    password: '',
    rememberMe: false,
  };
  returnUrl!: string;
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }
  showPassword = false;
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.form.username || !this.form.password) {
      this.toastr.warning('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'Lỗi');
      return;
    }
    this.authService.login(this.form.username, this.form.password).subscribe({
      next: (data: any) => {
        this.storageService.saveToken(data.token);
        this.storageService.saveUser(data);
        this.toastr.success(`Xin chào ${data.username}`, 'Đăng nhập thành công!');

        if (data.roles && data.roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigate(['/home']);
          }
        }
      },
      error: (err) => {
        let errorMsg = err.error?.message || 'Tài khoản hoặc mật khẩu không chính xác!';
        this.toastr.error(errorMsg, 'Đăng nhập thất bại');
      },
    });
  }
}
