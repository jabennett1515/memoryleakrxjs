import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-nested-obs',
  template: ``,
})
export class RxJSComponent {
  constructor(private http: HttpClient) {}

  /**
   * Good read on why nested observables are bad practice:
   * https://medium.com/ngconf/why-you-shouldnt-nest-subscribes-eafbc3b00af2
   */
  nestedObservable() {
    this.http
      .get('https://api.example.com/first-endpoint')
      .subscribe((response1) => {
        console.log('First response:', response1);

        // This is considered a nested observable. Subscribing within another subscription.
        // This is commonly used when you are making a request to an API, and then need the data from that to make a sequential call to another API.
        this.http
          .get('https://api.example.com/second-endpoint', response1)
          .subscribe((response2) => {
            console.log('Second response:', response2);
          });
      });
  }

  /**
   * Instead of using nested observables, we can opt to use switchMaps
   * switchMap will cancel any previous requests if a new value
   * comes through the stream, then create a new observable
   * https://rxjs.dev/api/operators/switchMap
   */
  correctSwitchMapExample() {
    this.http
      .get('https://api.example.com/first-endpoint')
      .pipe(
        switchMap((response1) => {
          // Instead of the previous example, we will return this new observable within the switchmap
          // to pass the data along to the new request.
          return this.http.get(
            'https://api.example.com/second-endpoint',
            response1
          );
        })
      )
      .subscribe((response2) => {
        console.log('Second response:', response2);
        // handle the last API call.
      });
  }
}
