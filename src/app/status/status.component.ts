import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MfgtService } from "app/shared/services/mfgtService";

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
    mfgtService: MfgtService;
    status: any;
    statusColor: any;
    reservations: any;
    aerodromeweather: any;

    constructor(public router: Router, mfgtService: MfgtService) { 
        this.mfgtService = mfgtService;
        this.status = {};
    }

    ngOnInit() {
        this.showStatus();

        setInterval(()=>{
            this.showStatus();
        }, 20000);
    }

    showStatus(){
        this.mfgtService.getStatus()
            .subscribe((data) => {
                this.status = data;
                this.status["statusHidden"] = false;

                // override for tests the status
                //this.status.status = "restricted";  
                //this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\nUnd eine dritte Zeile";

                if (this.status.status == 'open'){
                    this.status["statusColor"] = "alert-success";
                    this.status["statusText"] = "Flugplatz offen";
                    this.status.statusHidden = true;
                }
                else if (this.status.status == "restricted") {
                    this.status["statusColor"] = "alert-warning";
                    this.status["statusText"] = "Flugplatz eingeschränkt";
                }
                else { // closed
                    this.status["statusColor"] = "alert-danger";
                    this.status["statusText"] = "Flugplatz geschlossen";
                }
            },
            (error) => {
                this.status = { 
                                "message": "",
                                "statusColor": "alert-danger",
                                "statusText": "STATUS not available",
                                "last_update_date": Date.now(),
                                "last_update_by": "SYSTEM"
                            };
            } 
        );

        this.mfgtService.getAerodromeWeather()
            .subscribe((data) => {
                this.aerodromeweather = data;
                this.aerodromeweather["error"] = "";
            },
            (error) => {
                this.aerodromeweather["error"] = "WEATHER data not available";
            }
        );

        this.mfgtService.getClubReservations()
            .subscribe((data) => {
                //sort reservations by start time
                this.reservations = data.sort(function(a,b) {
                    var c = new Date(a.ReservationStart);
                    var d = new Date(b.ReservationStart);
                    return c.getTime()-d.getTime();
                });
                this.reservations["error"] = "";
            },
            (error) => {
                this.reservations["error"] = "RESERVATIONS not available";
            }
        );
    }
}
