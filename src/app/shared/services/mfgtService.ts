import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@Injectable()
export class MfgtService {

    constructor(private http: Http) {
    }

    getStatus(): Observable<any> {

      var url = "https://api.mfgt.ch/api/v1/aerodromestatus";

      return this.http
                .get(url)
                .map(resp => resp.json());

    }

}