import type { Chart, ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../_services/report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rental-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class LandlordReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cashflowChart') cashflowChartRef!: ElementRef<HTMLCanvasElement>;
  report: any = null;
  isLoading = true;
  selectedMonth = this.currentMonth();
  private viewReady = false; //danh dau canvas da render xong chua
  private revenueChart?: Chart; //instance cua bieu do tron
  private cashFlowChart?: Chart; //instance cua bieu do cot
  private chartConstructor?: typeof import('chart.js').Chart; //constructor cua Chart.js

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnDestroy(): void {
    this.destroyCharts(); //huy cac bieu do khi component bi huy de giai phong bo nho
  }

  //sau khi view da khoi tao thanh cong
  ngAfterViewInit(): void {
    this.viewReady = true; //danh dau view da san sang
    this.renderCharts(); //khoi tao bieu do
  }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.reportService.getLandlordOverview(this.selectedMonth).subscribe({
      next: (res) => {
        this.report = res;
        this.isLoading = false;
        this.cdr.detectChanges(); // cap nhat view de canvas co the truy cap duoc
        setTimeout(() => this.renderCharts(), 0);
      },
      error: (err) => {
        this.report = null;
        this.isLoading = false;
        this.destroyCharts(); // xoa chart cu de khong hien thi so lieu sai
        this.toastr.error('Failed to load report. Please try again later.', 'Error');
      },
    });
  }
  onMonthChange(): void {
    this.loadReport();
  }

  formatCurrency(value: any): number {
    return Number(value || 0); //chuyen null/string ve number de angular number pipe co the format dung, neu value la null hoac undefined thi tra ve 0
  }

  private async renderCharts(): Promise<void> {
    if (!this.viewReady || !this.report) return;
    const ChartConstructor = await this.loadChartConstructor();
    this.destroyCharts(); //huy chart cu truoc khi tao chart moi
    this.renderRevenueChart(ChartConstructor);
    this.renderCashFlowChart(ChartConstructor);
  }

  //khoi tao nap chart vao chartconstructor trong man
  private async loadChartConstructor(): Promise<typeof import('chart.js').Chart> {
    if (!this.chartConstructor) {
      const module = await import('chart.js');
      module.Chart.register(...module.registerables); // dang ky tat ca cac thanh phan cua Chart.js
      this.chartConstructor = module.Chart;
    }
    return this.chartConstructor;
  }

  private renderRevenueChart(ChartConstructor: typeof import('chart.js').Chart): void {
    const canvas = this.revenueChartRef.nativeElement;
    if (!canvas) return;
    const slices = this.report.revenueStructure || []; //lay danh sach lat cat doanh thu
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: slices.map((item: any) => item.label),
        datasets: [
          {
            data: slices.map((item: any) => Number(item.amount || 0)), //gia tri tien tung lat cat
            backgroundColor: ['#0F52BA', '#F59E0B', '#3B82F6', '#10B981', '#6B7280', '#EF4444'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // cho phep container quyet dinh chieu cao
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    };
    this.revenueChart = new ChartConstructor(canvas, config); // tao instance chart.js
  }

  private renderCashFlowChart(ChartConstructor: typeof import('chart.js').Chart): void {
    const canvas = this.cashflowChartRef?.nativeElement;
    if (!canvas) return;
    const rows = this.report.cashFlowByHostel || [];
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: rows.map((item: any) => item.hostelName), // ten khach san
        datasets: [
          {
            label: 'Tổng thu',
            data: rows.map((item: any) => Number(item.totalRevenue || 0)), // tong thu cua tung co so
            backgroundColor: '#10B981',
            barThickness: 36,
            maxBarThickness: 48,
          },
          // {
          //   label: 'Tổng chi',
          //   data: rows.map((item: any) => Number(item.expenseAmount || 0)), // tong chi cua tung co so
          //   backgroundColor: '#EF4444',
          // },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, //bat dau tu 0 de so sanh
          },
        },
      },
    };
    this.cashFlowChart = new ChartConstructor(canvas, config);
  }

  private destroyCharts(): void {
    this.revenueChart?.destroy(); //huy chart tron neu ton tai
    this.cashFlowChart?.destroy(); //huy chart cot neu ton tai
    this.revenueChart = undefined; // xoa tham chieu den chart tron
    this.cashFlowChart = undefined; // xoa tham chieu den chart cot
  }

  private currentMonth(): string {
    const now = new Date(); // ngay hien tai
    const month = `${now.getMonth() + 1}`.padStart(2, '0'); //convert thang ve 2 chu so
    return `${now.getFullYear()}-${month}`; // tra ve dang yyyy-mm
  }
}
