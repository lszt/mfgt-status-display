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

    constructor(public router: Router, mfgtService: MfgtService) { 
        this.mfgtService = mfgtService;
        this.status = {};
    }

    ngOnInit() {
        this.showStatus();

        setInterval(()=>{
            this.showStatus();
        }, 10000);
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
    }
}
