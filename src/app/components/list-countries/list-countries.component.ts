import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Country } from 'src/app/models/country';
import { Region } from 'src/app/models/region';
import { CountryService } from 'src/app/services/country.service';
import * as _ from 'lodash'

@Component({
  selector: 'app-list-countries',
  templateUrl: './list-countries.component.html',
  styleUrls: ['./list-countries.component.css']
})
export class ListCountriesComponent implements OnInit {

  public load: boolean
  public observable: Observable<{
    listCountries: Country[],
    listRegions: Region[]
  }>

  public regionSelected: string
  public listRegions: Region[]
  public listCountries: Country[]
  public listCountriesToVisit: Country[]

  constructor(private countryService: CountryService) { 
    this.load = false
    this.listRegions = []
    this.listCountries = []
    this.listCountriesToVisit = []
    this.observable = forkJoin({
      listCountries: this.countryService.getCountriesByRegion('eu'),  
      listRegions: this.countryService.getAllRegions()
    })
    this.regionSelected = 'EU'
  }

  ngOnInit(): void {

    this.observable.subscribe({
      next: results => {
        this.listCountries = results.listCountries,
        this.listRegions = results.listRegions
        this.load = true
      },
      complete: () => console.log('Ok'),
      error: error => {
        console.log('Error: ' + error)
        this.load = true
      }
     });
    
  }  

  filterCountries($event){
    
    this.load = false
    this.countryService.getCountriesByRegion($event.value).subscribe(list => {
      this.listCountries = _.differenceBy(list, this.listCountriesToVisit, c => c.name) 
      this.load = true
    })
  }

  drop(event: CdkDragDrop<Country[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

  }

}
