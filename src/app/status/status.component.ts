import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MfgtService } from 'app/shared/services/mfgtService';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
    mfgtService: MfgtService;
    settings: any;
    status: any;
    statusColor: any;
    events: any;
    flights: any;
    reservations: any;
    aerodromeweather: any;
    today: Date;

    constructor(public router: Router, mfgtService: MfgtService) {
        this.mfgtService = mfgtService;
        this.settings = { showEvents: false, showFlights: false, showReservations: false };
        this.status = {};
        this.aerodromeweather = {};
        this.flights = [];
        this.reservations = [];
        this.events = [];
    }

    // helper function to log messages
    log(message) {
        console.log(message);
    }

    ngOnInit() {
        this.updateStatus();

        // setInterval(() => {
        //     this.updateStatus();
        // }, 60000);
    }

    // update status and settings periodically
    updateStatus() {
        try {
            this.log('StatusComponent.updateStatus');

            this.mfgtService.getConfig()
                .subscribe((data) => {
                    this.settings = data;
                    this.log(data);
                    this.showStatus();
                },
                (error) => this.log(error));
        } catch (error) {
            this.log('Error: ' + error);
        }
    }

    // set the states for GUI updates
    showStatus() {
        this.today = new Date(Date.now());

        this.mfgtService.getStatus()
            .subscribe((data) => {
                this.status = data;

                // TEST status -> override for tests
                // this.status.status = "restricted";
                // this.status.message = "Flugplatz offen\r\n\r\n";
                // this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\n";
                // this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\nUnd eine dritte Zeile";

                const messageLines = this.status.message.split('\r\n');
                this.status.message = '';
                for(let i = 0; i < messageLines.length; i++) {
                    if (messageLines[i] !== '') {
                        this.status.message += '\r\n';
                    }
                    this.status.message += messageLines[i];
                }

                if (this.status.status === 'open') {
                    this.status['statusColor'] = 'alert-success';
                    this.status['statusText'] = 'Flugplatz offen';
                }
                // tslint:disable-next-line:one-line
                else if (this.status.status === 'restricted') {
                    this.status['statusColor'] = 'alert-warning';
                    this.status['statusText'] = 'Flugplatz eingeschränkt';
                }
                // tslint:disable-next-line:one-line
                else { // closed
                    this.status['statusColor'] = 'alert-danger';
                    this.status['statusText'] = 'Flugplatz geschlossen';
                }
            },
            (error) => {
                this.status = {
                                'message': '',
                                'statusColor': 'alert-danger',
                                'statusText': 'STATUS not available',
                                'last_update_date': Date.now(),
                                'last_update_by': 'SYSTEM'
                            };
            }
        );

        this.mfgtService.getAerodromeWeather()
            .subscribe((data) => {
                this.aerodromeweather = data;
                this.aerodromeweather['error'] = '';

                this.aerodromeweather.WindAngle  = this.formatWindDirection(data.WindAngle);
                this.aerodromeweather.GustAngle  = this.formatWindDirection(data.GustAngle);

                this.aerodromeweather.WindStrength = Math.round(this.aerodromeweather.WindStrength / 1.84);
                this.aerodromeweather.GustStrength = Math.round(this.aerodromeweather.GustStrength / 1.84);
            },
            (error) => {
                this.aerodromeweather = {};
                this.aerodromeweather['error'] = 'WEATHER data not available';
                this.aerodromeweather['Temperature'] = '00.0';
                this.aerodromeweather['Humidity'] = '00';
                this.aerodromeweather['Pressure'] = '0000.0';
                this.aerodromeweather['WindAngle'] = '000';
                this.aerodromeweather['WindStrength'] = '0';
                this.aerodromeweather['GustAngle'] = '000';
                this.aerodromeweather['GustStrength'] = '0';
            }
        );

        if (this.settings.showEvents === true) {
            this.mfgtService.getEvents()
                .subscribe((data) => {
                    // sort events by from time
                    this.events = data.sort(function(a, b) {
                        const c = new Date(a.From);
                        const d = new Date(b.From);
                        return c.getTime() - d.getTime();
                    });

                    // remove events after until time
                    const now = new Date(Date.now()).getTime();
                    this.events = this.events.filter(function(e) {
                        const from = new Date(e.From);
                        const until = new Date(e.Until).getTime();

                        // mark event as multi day event if diff(detect next midnight) > 0ms
                        e['Multidayevent'] = false;
                        const nextmidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1, 0, 0, 0).getTime();
                        const diff = until - nextmidnight;
                        if (diff > 0) {
                            e.Multidayevent = true;
                        }

                        return until > now;
                    });

                    this.events['showError'] = false;
                    this.events['error'] = '';
                },
                (error) => {
                    this.events['showError'] = true;
                    this.events['error'] = 'FLIGHTS not available!';
                }
            );
        }

        if (this.settings.showFlights === true) {
            this.mfgtService.getActualFlights()
                .subscribe((data) => {
                    // sort flights by start time
                    this.flights = data.sort(function(a, b) {
                        const c = new Date(a.DateOfFlight);
                        const d = new Date(b.DateOfFlight);
                        return c.getTime() - d.getTime();
                    });

                    this.flights.forEach(flight => {
                        // is the flight time today ?
                        const dateofFlight = new Date(flight.DateOfFlight);
                        flight['IsTodayFlight'] = false;
                        if (this.today.getDate() === dateofFlight.getDate()) {
                            flight.IsTodayFlight = true;
                        }

                        // detect if flight if it is a takeoff or landing
                        flight['takeOff'] = true;
                        if (flight.FlightDirection === 'inbound') { flight.takeOff = false; }
                    });

                    this.flights['showError'] = false;
                    this.flights['error'] = '';
                },
                (error) => {
                    this.flights['showError'] = true;
                    this.flights['error'] = 'FLIGHTS not available!';
                }
            );
        }

        if (this.settings.showReservations === true) {
            this.mfgtService.getClubReservations()
                .subscribe((data) => {
                    // sort reservations by start time
                    this.reservations = data.sort(function(a,b) {
                        const c = new Date(a.ReservationStart);
                        const d = new Date(b.ReservationStart);
                        return c.getTime()-d.getTime();
                    });

                    // remove reservation after the end time
                    const now = new Date(Date.now()).getTime();
                    this.reservations = this.reservations.filter(function(e) {
                        const dateStart = new Date(e.ReservationStart);
                        const dateEnd = new Date(e.ReservationEnd).getTime();

                        // mark flight as multi day flight if diff(detect next midnight) > 0ms
                        e['Multidayflight'] = false;
                        const nextmidnight = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate()+1,0,0,0).getTime();
                        const diff = dateEnd - nextmidnight;
                        if (diff > 0) {
                            e.Multidayflight = true;
                        }

                        // mark flight as Waiting flight (Warteliste)
                        e['Waiting'] = false;
                        if (e.ReservationStatus === 'WAITING') {
                            e.Waiting = true;
                        }

                        return dateEnd > now;
                    });

                    this.reservations['showError'] = false;
                    this.reservations['error'] = '';
                },
                (error) => {
                    this.reservations['showError'] = true;
                    this.reservations['error'] = 'RESERVATIONS not available!';
                }
            );
        }
    }

    // helper function for format the wind direction to 3 digits
    formatWindDirection(direction) {
        const str = '' + direction;
        const pad = '000';
        return pad.substring(0, pad.length - str.length) + str;
    }
}
