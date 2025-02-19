import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MemoryLeakComponent } from './memory-leak-shown/memory-leak.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MemoryLeakComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showLeaky = true;

  toggleLeaky() {
    this.showLeaky = !this.showLeaky;
  }
}
