import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  ngAfterViewInit() {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = 'assets/stupid.ico'; // Update the path to your favicon file
    document.head.appendChild(favicon);
  }

  title = 'sentiment_frontend';
  isDarkMode = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    // Check saved preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.isDarkMode = true;
      this.enableDarkMode();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }

    // Save preference to localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private enableDarkMode() {
    this.renderer.addClass(document.documentElement, 'dark');
  }

  private disableDarkMode() {
    this.renderer.removeClass(document.documentElement, 'dark');
  }
}
