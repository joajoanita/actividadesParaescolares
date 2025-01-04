import { Component } from '@angular/core';
import { ActivityService } from '../../../service/Activities/activity-service.service';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../service/Admin/admin.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-activities',
  imports: [RouterModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.css'
})
export class ActivitiesComponent {

  activities: any[] = [];
  actualPage: number = 1;
  errorMessage: any = null;
  warningMessage: any = null;
  successMessage: any = null;

  constructor(
    private activityService : ActivityService,
    private service: AdminService,
  ){}
  ngOnInit(){
    this.indexActivities();
  }

  indexActivities(){
    this.activityService.indexActivities().subscribe(
      data => {
        this.activities = data.reverse();
        this.indexActivities();
        
      },
      error => {
        console.error('No se ha podido indexar las actividades', error)
        
      }
    );
  }

  deleteActivity(id: number){
    console.log(`Intentando eliminar la actividad con ID: ${id}`);
    this.service.deleteActivity(id).subscribe(
      () => {
        this.indexActivities();
        this.successMessage = 'Se ha eliminado la actividad con éxito.'
        console.log(`Se ha eliminado la actividad con id ${id}`);
      },
      error => {
        if(error.status === 500){
          this.errorMessage = 'No se ha podido eliminar la actividad.'
        } else {
          this.warningMessage = 'Ha ocurrido algo inesperado, inténtalo más tarde.'
        }
        console.error('No se ha podido eliminar la actividad', error);
      }
    );
  }



}
