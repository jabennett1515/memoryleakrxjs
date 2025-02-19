import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-nested-obs',
  template: ``,
})
export class RxJSWithErrorHandlingComponent {
  constructor(private http: HttpClient) {}

  /**
   * Another reason why nested observables are "bad practice",
   * is because for error handling, you have to declare error handling for each subscription.
   */
  nestedObservable() {
    this.http.get('https://api.example.com/first-endpoint').subscribe({
      next: (response1) => {
        console.log('First response:', response1);

        this.http.get('https://api.example.com/second-endpoint').subscribe({
          next: (response2) => {
            console.log('Second response:', response2);
            // ... handle response2
          },
          error: (error2) => {
            console.error('Error in second request', error2);
            // handle second error
          },
        });
      },
      error: (error1) => {
        console.error('Error in first request', error1);
        // handle first error
      },
    });
  }

  /**
   * Utilizing switchMaps is benefical because we have a single-stream for error handling.
   * If we know its a global error, we can have that in `catchError` and perform an action. LP Does not do this, but in the scenario
   * where we would want to just throw a `toast`, then we could do that globally for any request that failed indicating that there was an error.
   */
  switchMapWithSingleCatchErrorHandlingMaintainingSingleStream() {
    this.http
      .get('https://api.example.com/first-endpoint')
      .pipe(
        switchMap((response1) => {
          console.log('First response:', response1);
          // Return another observable
          return this.http.get('https://api.example.com/second-endpoint');
        }),
        // Catch errors from ANY part of the chain - MAINTAINING A SINGLE STREAM.
        catchError((error) => {
          console.error('Error in the chain:', error);
          // Return a fallback observable or rethrow
          return of({ error: 'Something went wrong' });
        })
      )
      .subscribe({
        next: (response2) => {
          console.log('Second response:', response2);
          // ... handle response2
        },
        // (Optional) final error callback if you want additional handling
        error: (error) => {
          console.error('Subscription error:', error);
        },
      });
  }

  switchMapGracefullyHandlingFailuresForEachRequest() {
    this.http
      .get('https://api.example.com/first-endpoint')
      .pipe(
        catchError((error) => {
          console.error('Error in first request', error);
          // Return something that gracefully allows pipeline to continue
          // or rethrow if you want to stop
          return of(null);
        }),
        switchMap((response1) => {
          if (!response1) {
            // handle scenario if first call failed (response1 is null)
            return of({
              error: 'Skipping second request because first failed',
            });
          }
          return this.http.get('https://api.example.com/second-endpoint');
        }),
        catchError((error) => {
          console.error('Error in second request', error);
          return of({ error: 'Something went wrong in second request' });
        })
      )
      .subscribe({
        next: (data) => console.log('Final response or error object', data),
        error: (err) => console.error('Subscription Error (fallback)', err),
      });
  }
}

/** Why is this better?
 * 
 * Clean Readability: Observables in a pipeline look more like synchronous code in terms of structure, even though it’s all asynchronous under the hood.
 * Reduced Nesting: Avoiding nested subscription blocks prevents callback hell and makes your code simpler to follow and maintain.
 * Flexible Error Handling: You can attach multiple catchError operators at different places if you need different error handling strategies. 
   For instance, you might want to handle an error from the first request differently than an error from the second request. 
   That’s trivial to do with operators—it’s much more awkward with nested subscriptions.
 */
