import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DragDropComponent } from './components/drag-drop/drag-drop.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,DragDropComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
