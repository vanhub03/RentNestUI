import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '.reveal, .reveal-left, .reveal-right',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}
  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          //khi bat dau di vao khung hinh
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'active');
            this.observer.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );
    this.observer.observe(this.el.nativeElement);
  }
  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
