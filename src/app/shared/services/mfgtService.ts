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

        /*
        {
            "status": "open",
            "last_update_date": "2017-09-23T07:04:08+00:00",
            "last_update_by": "B.Berchtold",
            "blank": false,
            "message": "Flugplatz offen\r\n\r\n",
            "webcam": {
                "cams": {
                    "east": {
                        "low": "http://webcam.mfgt.ch/em.jpg",
                        "high": "http://webcam.mfgt.ch/eh.jpg"
                    },
                    "west": {
                        "low": "http://webcam.mfgt.ch/wm.jpg",
                        "high": "http://webcam.mfgt.ch/wh.jpg"
                    }
                }
            }
        }
        */

        return this.http
                .get(url)
                .map(resp => resp.json());

    }

    getAerodromeWeather(): Observable<any> {
        var url = "https://api.mfgt.ch/api/v1/aerodromeweather";

        /*
        {
            "Temperature":26.5,
            "Humidity":48,
            "Pressure":1025.9,
            "WindAngle":51,
            "WindStrength":6,
            "GustAngle":27,
            "GustStrength":14
        }
        */

        return Observable.of({
            "Temperature":26.5,
            "Humidity":48,
            "Pressure":1025.9,
            "WindAngle":51,
            "WindStrength":6,
            "GustAngle":27,
            "GustStrength":14
        });

        // return this.http
        //     .get(url)
        //     .map(resp => resp.json());
    }

    getClubReservations(): Observable<any> {
        //var url = "https://api.mfgt.ch/api/v1/reservations/20171006";  // specific day
        var url = "https://api.mfgt.ch/api/v1/reservations";

        /*
        [
            {
                "ReservationCode": "IHBJEZ",
                "Registration": "HB-PGM",
                "AircraftType": "Piper Archer II",
                "ReservationStart": "2017-10-01T11:00:00+02:00",
                "ReservationEnd": "2017-10-01T19:00:00+02:00",
                "Pilot": "MFGT Sekretariat",
                "PilotUsername": "sekretariat",
                "PilotStart": "2017-10-01T11:00:00+02:00",
                "PilotEnd": "2017-10-01T19:00:00+02:00",
                "Instructor": "",
                "InstructorUsername": "",
                "InstructorStart": "",
                "InstructorEnd": "",
                "TypeOfFlight": "Rundflug",
                "IsMaintenance": "False",
                "ReservationStatus": "OK",
                "Origin": "LSZT",
                "Destination": "LSZT",
                "LastChangeDateTime": "2017-02-06T17:47:00+01:00",
                "LastChangeUsername": "21277"
            },
            {}
        ]
        */

        return this.http
                .get(url)
                .map(resp => resp.json());    
    }

}