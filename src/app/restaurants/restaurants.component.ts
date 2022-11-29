import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APIService, Restaurant } from '../API.service';
import { ZenObservable } from 'zen-observable-ts';
import { Subscription } from 'rxjs';
// import { Observable } from 'rxjs';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit, OnDestroy {
  public createForm: FormGroup;
  public restaurants: Array<Restaurant> = [];
  // public restaurants$: Observable<Restaurant[]> | undefined;
  private subscription: ZenObservable.Subscription | null = null

  constructor(
    private api: APIService, 
    private fb: FormBuilder,
  ) {
      this.createForm = this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        city: ['', Validators.required]
      })
    }

    async ngOnInit(){
      const restaurantsList = await this.api.ListRestaurants();
      this.restaurants = restaurantsList.items as Restaurant[];

      this.subscription = <Subscription>(
        this.api.OnCreateRestaurantListener().subscribe(
        (event: any) => {
          const newRestaurant = event.value.data.onCreateRestaurant;
          this.restaurants = [newRestaurant, ...this.restaurants];
        }
      ));
    }

    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.subscription = null;
    }

    public onCreate(restaurant: Restaurant) {
      this.api
        .CreateRestaurant(restaurant)
        .then(() => {
          console.log('item created!');
          this.createForm.reset();
        })
        .catch((e) => {
          console.log('error creating restaurant...', e);
        });
    }
}
