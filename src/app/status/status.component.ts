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
    showEvents: boolean;
    statusColor: any;
    reservations: any;
    aerodromeweather: any;
    today: Date;

    constructor(public router: Router, mfgtService: MfgtService) {
        this.mfgtService = mfgtService;
        this.status = {};
        this.aerodromeweather = {};
        this.reservations = [];
    }

    ngOnInit() {
        this.showStatus();

        setInterval(()=>{
            this.showStatus();
        }, 60000);
    }

    showStatus(){
        this.showEvents = false;
        this.today = new Date(Date.now());

        this.mfgtService.getStatus()
            .subscribe((data) => {
                this.status = data;

                // TEST status -> override for tests
                //this.status.status = "restricted";
                //this.status.message = "Flugplatz offen\r\n\r\n";
                //this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\n";
                //this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\nUnd eine dritte Zeile";

                var messageLines = this.status.message.split("\r\n");
                this.status.message = "";
                for(var i=1; i<messageLines.length; i++){
                    if (i>1 && messageLines[i] !== ""){
                        this.status.message += "\r\n";
                    }
                    this.status.message += messageLines[i];
                }

                if (this.status.status == 'open'){
                    this.status["statusColor"] = "alert-success";
                    this.status["statusText"] = "Flugplatz offen";
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

                this.aerodromeweather.WindAngle  = this.formatWindDirection(data.WindAngle);
                this.aerodromeweather.GustAngle  = this.formatWindDirection(data.GustAngle);
            },
            (error) => {
                this.aerodromeweather = {};
                this.aerodromeweather["error"] = "WEATHER data not available";
                this.aerodromeweather["Temperature"] = "00.0";
                this.aerodromeweather["Humidity"] = "00";
                this.aerodromeweather["Pressure"] = "0000.0";
                this.aerodromeweather["WindAngle"] = "000";
                this.aerodromeweather["WindStrength"] = "0";
                this.aerodromeweather["GustAngle"] = "000";
                this.aerodromeweather["GustStrength"] = "0";
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

                //remove reservation after the end time
                var now = new Date(Date.now()).getTime();
                this.reservations = this.reservations.filter(function(e) {
                    var dateStart = new Date(e.ReservationStart);
                    var dateEnd = new Date(e.ReservationEnd).getTime();

                    // mark flight as multi day flight if diff(detect next midnight) > 0ms
                    e["Multidayflight"] = false;
                    var nextmidnight = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate()+1,0,0,0).getTime();
                    var diff = dateEnd - nextmidnight;
                    if (diff > 0) {
                        e.Multidayflight = true;
                    }

                    // mark flight as Waiting flight (Warteliste)
                    e["Waiting"] = false;
                    if (e.ReservationStatus === "WAITING") {
                        e.Waiting = true;
                    }

                    return dateEnd > now;
                });

                this.reservations["showError"] = false;
                this.reservations["error"] = "";
            },
            (error) => {
                this.reservations["showError"] = true;
                this.reservations["error"] = "RESERVATIONS not available!";
            }
        );
    }

    formatWindDirection(direction) {
        var str = "" + direction;
        var pad = "000";
        return pad.substring(0, pad.length - str.length) + str;
    }
}
