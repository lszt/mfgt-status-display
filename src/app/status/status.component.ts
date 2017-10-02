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
        }, 1000000);
    }

    showStatus(){
        this.mfgtService.getStatus()
            .subscribe((data) => {
                this.status = data;

                if (this.status.status == 'open'){
                    this.status["statusColor"] = "alert-success";
                }
                else if (this.status.status == "restricted") {
                    this.status["statusColor"] = "alert-warning";
                }
                else { // closed
                    this.status["statusColor"] = "alert-danger";
                }
            },
            (error) => {
                this.status = { 
                                "message": "STATUS not available",
                                "statusColor": "alert-danger",
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
                this.reservations = data;
                this.reservations["error"] = "";
            },
            (error) => {
                this.reservations["error"] = "RESERVATIONS not available";
            }
        );
    }
}
