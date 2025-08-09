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
    aerodromeWeather: any;
    today: Date;
    isPortrait = window.innerHeight > window.innerWidth;
    
    constructor(public router: Router, mfgtService: MfgtService) {
        this.mfgtService = mfgtService;
        this.settings = { showEvents: false, showFlights: false, showReservations: false };
        this.status = {};
        this.aerodromeWeather = {};
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
        // }, 10000);
    }

    // update status and settings periodically
    updateStatus() {
        try {
            this.log('StatusComponent.updateStatus');

            this.mfgtService.getConfig().subscribe({
                next: (data) => {
                    this.settings = data;
                    if (!('showWeather' in this.settings)) {
                        this.settings['showWeather'] = false;
                    }
                    if (!('requestAerodromeStatusDataEnabled' in this.settings)) {
                        this.settings['requestAerodromeStatusDataEnabled'] = true;
                    }
                    if (!('requestWeatherDataEnabled' in this.settings)) {
                        this.settings['requestWeatherDataEnabled'] = false;
                    }
                    if (!('requestEventsDataEnabled' in this.settings)) {
                        this.settings['requestEventsDataEnabled'] = true;
                    }
                    if (!('requestFlightDataEnabled' in this.settings)) {
                        this.settings['requestFlightDataEnabled'] = true;
                    }
                    if (!('requestReservationsDataEnabled' in this.settings)) {
                        this.settings['requestReservationsDataEnabled'] = true;
                    }
                    this.log(data);
                    this.showStatus();
                },
                error: (error) => this.log(error),
                complete: () => { }
            });
        } catch (error) {
            this.log('Error: ' + error);
        }
    }

    // set the states for GUI updates
    showStatus() {
        this.today = new Date(Date.now());

        if (this.settings.requestAerodromeStatusDataEnabled) {
            this.mfgtService.getStatus().subscribe({
                next: (data) => {
                    this.status = data;

                    // TEST status -> override for tests
                    // this.status.status = "restricted";
                    // this.status.message = "Flugplatz offen\r\n\r\n";
                    // this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\n";
                    // this.status.message = "TEST das ist eine Zeile \r\nZweite Zeile definiert\r\nUnd eine dritte Zeile";

                    const messageLines = this.status.message.split('\r\n');
                    this.status.message = '';
                    for (let i = 0; i < messageLines.length; i++) {
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
                error: (error) => {
                    this.status = {
                                    'message': '',
                                    'statusColor': 'alert-danger',
                                    'statusText': 'STATUS not available',
                                    'last_update_date': Date.now(),
                                    'last_update_by': 'SYSTEM'
                                };
                },
                complete: () => { }
            });
        }

        if (this.settings.requestWeatherDataEnabled) {
            this.mfgtService.getAerodromeWeather().subscribe({
                next: (data) => {
                    this.aerodromeWeather = data;
                    this.aerodromeWeather['error'] = '';

                    this.aerodromeWeather.WindAngle  = this.formatWindDirection(data.WindAngle);
                    this.aerodromeWeather.GustAngle  = this.formatWindDirection(data.GustAngle);

                    this.aerodromeWeather.WindStrength = Math.round(this.aerodromeWeather.WindStrength / 1.84);
                    this.aerodromeWeather.GustStrength = Math.round(this.aerodromeWeather.GustStrength / 1.84);
                },
                error: (error) => {
                    this.aerodromeWeather = {};
                    this.aerodromeWeather['error'] = 'WEATHER data not available';
                    this.aerodromeWeather['Temperature'] = '00.0';
                    this.aerodromeWeather['Humidity'] = '00';
                    this.aerodromeWeather['Pressure'] = '0000.0';
                    this.aerodromeWeather['WindAngle'] = '000';
                    this.aerodromeWeather['WindStrength'] = '0';
                    this.aerodromeWeather['GustAngle'] = '000';
                    this.aerodromeWeather['GustStrength'] = '0';
                },
                complete: () => { }
            });
        }

        if (this.settings.showEvents && this.settings.requestEventsDataEnabled) {
            this.mfgtService.getEvents().subscribe({
                next: (data) => {
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
                        e['MultiDayEvent'] = false;
                        const nextMidnight = new Date(from.getFullYear(),
                                                      from.getMonth(),
                                                      from.getDate() + 1, 0, 0, 0).getTime();
                        const diff = until - nextMidnight;
                        if (diff > 0) {
                            e.MultiDayEvent = true;
                        }

                        return until > now;
                    });

                    this.events['showError'] = false;
                    this.events['error'] = '';
                },
                error: (error) => {
                    this.events['showError'] = true;
                    this.events['error'] = 'FLIGHTS not available!';
                },
                complete: () => { }
            });
        }

        if (this.settings.showFlights && this.settings.requestFlightsDataEnabled) {
            this.mfgtService.getActualFlights().subscribe({
                next: (data) => {
                    // sort flights by start time
                    this.flights = data.sort(function(a, b) {
                        const c = new Date(a.DateOfFlight);
                        const d = new Date(b.DateOfFlight);
                        return c.getTime() - d.getTime();
                    });

                    this.flights.forEach(flight => {
                        // is the flight time today ?
                        const dateOfFlight = new Date(flight.DateOfFlight);
                        flight['IsTodayFlight'] = false;
                        if (this.today.getDate() === dateOfFlight.getDate()) {
                            flight.IsTodayFlight = true;
                        }

                        // detect if flight if it is a takeoff or landing
                        flight['takeOff'] = true;
                        if (flight.FlightDirection === 'inbound') { flight.takeOff = false; }
                    });

                    this.flights['showError'] = false;
                    this.flights['error'] = '';
                },
                error: (error) => {
                    this.flights['showError'] = true;
                    this.flights['error'] = 'FLIGHTS not available!';
                },
                complete: () => { }
            });
        }

        if (this.settings.showReservations && this.settings.requestReservationsDataEnabled) {
            this.mfgtService.getClubReservations().subscribe({
                next: (data) => {
                    // sort reservations by start time
                    this.reservations = data.sort(function(a, b) {
                        const c = new Date(a.ReservationStart);
                        const d = new Date(b.ReservationStart);
                        return c.getTime() - d.getTime();
                    });

                    // remove reservation after the end time
                    const now = new Date().getTime();
                    // const tmpnow = new Date();
                    // const now = new Date(tmpnow.getFullYear(), tmpnow.getMonth(), tmpnow.getDate(), 12, 0, 0).getTime();

                    this.reservations = this.reservations.filter(function(e) {
                        const dateStart = new Date(e.ReservationStart);
                        const dateEndDate = new Date(e.ReservationEnd);
                        const dateEnd = new Date(e.ReservationEnd).getTime();

                        // mark flight as multi day flight if diff(detect next midnight) > 0ms
                        e['MultiDayFlight'] = false;
                        const nextMidnight = new Date(dateStart.getFullYear(),
                                                      dateStart.getMonth(),
                                                      dateStart.getDate() + 1, 0, 0, 0).getTime();
                        const diff = dateEnd - nextMidnight;
                        if (diff > 0) {
                            e.MultiDayFlight = true;
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
                error: (error) => {
                    this.reservations['showError'] = true;
                    this.reservations['error'] = 'RESERVATIONS not available!';
                },
                complete: () => { }
            });
        }
    }

    // helper function for format the wind direction to 3 digits
    formatWindDirection(direction) {
        const str = '' + direction;
        const pad = '000';
        return pad.substring(0, pad.length - str.length) + str;
    }
}
