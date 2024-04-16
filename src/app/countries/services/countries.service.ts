
import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string= 'https://restcountries.com/v3.1'

  private _region: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europa, Region.Oceania ]

  constructor(
    private http: HttpClient,

  ) { }

  get regions(): Region[]{
    return [ ...this._region ];
  }

  getCountriesByRegion(region: Region): Observable <SmallCountry[]> {
    //si no hay region, se utiliza el operador of para devolver un observable con un arreglo vacío
    if (!region) return of ([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    //peticion http:
    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }) ) ),
      )
  }

  getCountryByAlphaCode( alphaCode: string): Observable <SmallCountry> {
    // if (!alphaCode) return of();

    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;
     //peticion http:
     return this.http.get<Country>(url)
     .pipe(
       map(country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
       })),
     )
  }

  getCountryBordersByCodes( borders: string[]): Observable <SmallCountry[]>{
    if ( !borders || borders.length===0 ) return of([]);

    const countriesRequest: Observable <SmallCountry>[] = [];
    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequest.push( request );
    })
    //peticion http
    return combineLatest( countriesRequest )

  }

}
