import { Component } from '@angular/core';
import { ActivityService} from '../../../service/Activities/activity-service.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchService } from '../../../service/Filtro/search.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-home',
  imports: [RouterModule, RouterLink, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  activities: any[] = [];
  searchQuery: string = '';
  searchSubscription: Subscription | undefined;
  actualPage: number = 1;
  warningMessage: any = null;

  constructor(private activityService : ActivityService , private searchService: SearchService){}

  ngOnInit(): void{
    this.searchSubscription = this.searchService.currentSearch$.subscribe(
      query => {
          this.searchQuery = query;
          this.indexActivities();
    });

    this.indexActivities();
  }

  ngOnDestroy(){
    if(this.searchSubscription){
      this.searchSubscription.unsubscribe();
    }
  }

  indexActivities(){
    this.activityService.indexActivities(this.searchQuery).subscribe(
      data => {
        this.activities = data;
      }, 
      error => {
        if(error.status === 429){
            this.warningMessage = "Ha sucedido algo inesperado cargando las actividades, intentalo más tarde."
        } 
      }
    );
  }
  

  getImageUrl(imagePath: string): string{
    return `http://127.0.0.1:8000/images/activities/${imagePath}`;
  }
}
