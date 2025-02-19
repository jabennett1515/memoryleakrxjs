import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { filter, interval, Subject, Subscription, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-leaky',
  templateUrl: './memory-leak.component.html',
  styleUrls: ['./memory-leak.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MemoryLeakComponent implements OnInit, OnDestroy {
  outerSubscription?: Subscription;
  nestedSubscriptions: Subscription[] = [];

  dataStore: any[] = [];

  private unsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.outerSubscription = interval(1000)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((outerCount) => {
        console.log('Outer interval emitted:', outerCount);

        const innerSubscription = interval(500)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((innerCount) => {
            this.dataStore.push(
              new Array(100).fill({ outerCount, innerCount })
            );

            console.log(
              `  Inner interval #${outerCount} emitted: ${innerCount}`
            );
          });

        // Keep track of all the inner subscriptions
        this.nestedSubscriptions.push(innerSubscription);
      });
  }

  ngOnDestroy(): void {
    // Uncomment this out to see a memory leak occur.
    this.unsubscribe.next();
  }
}
