import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  imports: [CommonModule, MatSelectModule],
  templateUrl: './drag-drop.component.html',
  styleUrl: './drag-drop.component.scss',
})
export class DragDropComponent implements OnInit, OnDestroy {
  date = new Date();
  timeSubject = new BehaviorSubject<string>(this.getDateTime());
  time$ = this.timeSubject.asObservable();

  options: string[] = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLDivElement>;
  offsetX!: number;
  offsetY!: number;
  draggableRect: any;
  draggedElement: HTMLElement | null = null;
  isNewElement = false;
  startClockSubscription!: Subscription;
  initClockSubscription!: Subscription;

  ngOnInit(): void {
    this.startClock();
  }
  startClock() {
    this.startClockSubscription = interval(1000).subscribe(() => {
      const currentTime = this.getDateTime();
      this.timeSubject.next(currentTime);
    });
  }

  private getDateTime() {
    this.date.setSeconds(this.date.getSeconds() + 1);
    return (
      this.date.getHours() +
      ':' +
      this.date.getMinutes() +
      ':' +
      this.date.getSeconds()
    );
  }

  allowDrop(event: DragEvent) {
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();

    if (
      event.clientX <=
        canvasRect.width - (this.draggableRect.width - this.offsetX) &&
      event.pageX >= this.offsetX &&
      event.pageY >= this.offsetY &&
      canvasRect.height - event.pageY >=
        this.draggableRect.height - this.offsetY
    ) {
      event.preventDefault();
    }
  }

  drag(event: DragEvent) {
    const draggableElement = event.target as HTMLElement;
    const draggableRect = draggableElement.getBoundingClientRect();
    this.draggableRect = draggableRect;

    this.offsetX = event.offsetX;
    this.offsetY = event.offsetY;
    this.draggedElement = draggableElement;
    this.isNewElement = !this.canvas.nativeElement.contains(draggableElement);

    event.dataTransfer?.setData(
      'text',
      (event.target as HTMLElement).outerHTML
    );
  }

  drop(event: DragEvent) {
    event.preventDefault();

    if (this.draggedElement) {
      const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
      const left = event.clientX - canvasRect.left - this.offsetX;
      const top = event.clientY - canvasRect.top - this.offsetY;

      if (this.isNewElement) {
        const container = document.createElement('div');
        container.appendChild(this.draggedElement.cloneNode(true));

        const element = container.firstChild as HTMLElement;
        element.style.position = 'absolute';
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.style.cursor = 'grab';
        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', (e) => this.drag(e as DragEvent));

        this.canvas.nativeElement.appendChild(element);

        if (element.classList.contains('clock')) {
          this.initClock(element);
        }
      } else {
        this.draggedElement.style.position = 'absolute';
        this.draggedElement.style.left = `${left}px`;
        this.draggedElement.style.top = `${top}px`;
      }

      this.draggedElement = null;
      this.isNewElement = false;
    }
  }

  initClock(element: HTMLElement) {
    const clockTimeElement = element.querySelector('.clock-time');
    if (clockTimeElement) {
      this.initClockSubscription = this.time$.subscribe((time) => {
        clockTimeElement.textContent = time;
      });
    }
  }

  ngOnDestroy(): void {
    this.startClockSubscription.unsubscribe();
    this.initClockSubscription.unsubscribe();
  }
}
