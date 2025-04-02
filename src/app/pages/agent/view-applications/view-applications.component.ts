import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ThirdPartyApplicationsApi } from '../../../@core/backend/common/api/thirdPartyApplications.api';
import { SharedService } from '../../../@core/backend/common/services/shared.service';
import { User, UserData } from '../../../@core/interfaces/common/users';
import { UserStore } from '../../../@core/stores/user.store';
import { NbDialogService } from '@nebular/theme'; 
import { Firstpaymentdialog } from '../../student-verification/payment_dialog/paymentdialog';
import { Subject, Subscription } from 'rxjs';
import { ApplicationProcessApi } from '../../../@core/backend/common/api/applicationProcess.api';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';
import { ErrataUpdateComponent } from './errataUpdate/errataUpdate.component';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
  selector: 'ngx-view-application',
  templateUrl: './view-applications.component.html',
  styleUrls: ['./view-applications.component.scss']
})
export class ViewApplicationsComponent implements OnInit {
  user_id: any;
  applications: any;
  protected readonly unsubscribe$ = new Subject<void>();
  user: User;
  agent_user: User;
  
  constructor( private api: ThirdPartyApplicationsApi,
    private dialogService: NbDialogService,
    private router: Router,
    private applicationapi: ApplicationProcessApi, 
    private usersService: UserData,
    private activatedRoute:ActivatedRoute) { 
      this.usersService.getCurrentUser().pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.agent_user = user;
        if(this.agent_user.is_email_verified == true && this.agent_user.is_otp_verified == true){
          if(this.agent_user.role != 'agent'){
            this.router.navigate(['auth/logout']);
          }
        }else{
          this.router.navigate(['auth/logout']);
        }
      })
    }

  ngOnInit(): void {
    this.user_id = this.activatedRoute.snapshot.paramMap.get('user_id');
    this.getAllApplications();
   
  }

  getAllApplications(): void {
    this.api.getAllApplications(this.user_id).subscribe(data=>{
      this.applications = data['data']
    })
  }

  updateErrata(id,lock_transcript,upload_step){
    this.dialogService.open(ErrataUpdateComponent, {
      context: {
        user_id : this.user_id,
        id : id,
        lock_transcript : lock_transcript,
        upload_step : upload_step
      },
    }).onClose.subscribe(data=>{
      this.getAllApplications();
    });
  }

  downloadpdf(app_id,pdfFile){
        if(pdfFile == 'ApplicationForm'){
          this.api.generatepdfform(app_id, this.user_id).subscribe(data=>{
            if(data['status'] == 200){
              // this.api.mergedocument(this.user_id,app_id).subscribe(data=>{
              //   if(data['status'] == 200){
                  this.applicationapi.downloadpdf(data['data'], this.user_id)
                  .subscribe(data => {
                   saveAs(data, data['data']);
                  });
              //   }
              // })
            }  
          })
        }else if(pdfFile == 'PaymentReceipt'){
              var fileName = app_id + '_Verification_Payment_Challan.pdf'
              this.applicationapi.downloadpdf(fileName, this.user_id)
                .subscribe(data => {
                  saveAs(data, fileName); 
                }); 
        }
       
      }
  
}
