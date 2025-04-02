import { Component, OnInit} from '@angular/core';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';
import { NbAuthService } from '@nebular/auth';
import { Router,ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { ConfirmationService } from 'primeng/api';
import * as printJS from 'print-js'
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import * as moment from 'moment'

@Component({
  selector: 'ngx-admin-signed',
  templateUrl: './admin-signed.component.html',
  styleUrls: ['./admin-signed.component.scss'],
  providers:[ConfirmationService],
})
export class AdminSignedComponent implements OnInit {
  p: number = 1;
  public filterText: string;
  public filterPlaceholder: string;
  public filterInput = new FormControl();
  selectedYear;
  studentdata: any;
  searchForm:FormGroup;
  name : string;
  email : string;
  isLoadingResults: boolean = false;
  studentLength : any;
  userId : any;
  student_name: any;
  admin:any;
  protected readonly unsubscribe$ = new Subject<void>();
  app_id: any;
  adminEmail: any;
  patternType: string;
  // src: string = `${environment.apiUrl}`;
  // path : string = `${environment.url}`;
  http: any;
  startDate: string;
  endDate: string;
  loadingXL: boolean;
  dateRange: any;
  dateForm: FormGroup;
  years;
  id;



  constructor(  private api: ApplicationApi,
    private router : Router,
    private ConfirmationService: ConfirmationService,
    public toasterService: NbToastrService,
    private route: ActivatedRoute,
    private formBuilder:FormBuilder,
    private usersService: UserData,) {
      this.usersService.getCurrentUser().pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => { 
        this.admin = user;
        if(this.admin.is_email_verified == true && this.admin.is_otp_verified == true){
          if(this.admin.role != 'admin'  && this.admin.role != 'subAdmin'){
            this.router.navigate(['auth/logout']);
          }
        }else{
          this.router.navigate(['auth/logout']);
        }
      })
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    

   }

   getYearRange() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Get the current month (0 = January, 5 = June)
  
    // Calculate the start and end year based on the current month
    //  const startYear = currentMonth < 5 ? 2022 : currentYear;
    const endYear = currentMonth < 5 ? currentYear - 1 : currentYear;
  
    // Generate years with a range
    const selectedYear = `${endYear}`;
    const years = this.generateYears(2022, currentYear);
  
    return { selectedYear, years, currentYear };
  }

  private generateYears(startYear: number, endYear: number): string[] {
    var years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        viewValue : `${year}-${year + 1}`, 
        value: `${year}`
      });
    }
    return years;
  }

  ngOnInit() {
    const yearData = this.getYearRange();    
    this.selectedYear = yearData.selectedYear; 
    this.years = yearData.years
    this.filterText = "";
    this.filterPlaceholder = "Local Search";
   this.searchForm = this.formBuilder.group({
    // idCtrl : [''],
    nameCtrl:[''],
    emailCtrl:['']
    })
    this.dateForm = this.formBuilder.group({
      dateCtrl:[''],
    })

    this.refresh(null,null);
  }


  handleClick(user_id,app_id) {
    this.router.navigate(['pages/adminView'],{queryParams:{userId : user_id, app_id : app_id, viewFrom : 'singned'}});
  }

  pageChanged(event){
    this.p = event;
    this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
  }
  clear(){
    this.searchForm.controls.nameCtrl.setValue('');
    this.searchForm.controls.emailCtrl.setValue('');
    this.refresh(null,null);
  }
  search(){
    if( this.searchForm.controls.idCtrl.value || this.searchForm.controls.nameCtrl.value || this.searchForm.controls.emailCtrl.value || this.selectedYear){
      this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
    }else{
      alert("Please specify any of the search criteria")
    }
  }
  refresh(student_name, email){
    this.student_name = student_name;
    this.isLoadingResults = true;
    this.api.getAll_signedApplications(this.p,student_name,email,'signed',this.selectedYear).subscribe(data =>{
      this.isLoadingResults = false;
      this.studentdata = data['items'];
      if(this.studentdata.length > 0){
        this.userId = this.studentdata[0]['user_id']
        this.app_id = this.studentdata[0]['id']
      }
      
      this.studentLength = data['total_count'];
      // this.active=data['counts'];
    })
    this.filterInput
      .valueChanges
      // .debounceTime(200)
      .subscribe(term => {
       this.filterText = term;
    });
  }

  sendEmail(userId,id){
    this.ConfirmationService.confirm({
      message: 'Do you want to email '+id+' application?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {			
          this.api.checksignedpdf(id , userId).subscribe((data: any) => {
            if(data['status'] == 200){
              this.api.sendemail(id,userId,this.admin.email).subscribe((result)=>{ 
                if(result['status'] == 200){
                  this.toasterService.success('Email successfully sent..!!!','Success',{duration : 3000});
                  this.refresh(this.student_name, this.email);
                }else if(result['status'] == 400){
                  this.toasterService.danger(result['message'],'Error',{duration : 3000});
                  this.refresh(this.student_name, this.email);
                }
              })    
            }else if(data['status'] == 400){
             this.toasterService.danger('This application can not be emailed as Some signed pdf not found in database!!!','Error',{duration : 3000});
             this.refresh(this.student_name, this.email);
            }
              err => console.error(err);
          },
          error=>console.error("Error", error)
          )},
    });
  }

  filterValue(event){
   
    this.selectedYear = event.value;
  }

   downloadExcel(signed){
    this.loadingXL = true;
    this.dateRange= this.dateForm.controls.dateCtrl.value
    this.endDate = (this.dateRange) ? moment(new Date(this.dateRange.end)).format("YYYY-MM-DD") : '';
    this.startDate = (this.dateRange) ? moment(new Date(this.dateRange.start)).format("YYYY-MM-DD"): '';
   this.api.downloadExcel('signed','accept',this.startDate,this.endDate).subscribe((response)=>{
      if(response[`status`] == 200){
        this.api.downloadFiles(response[`data`])
        .subscribe(data => {
          this.loadingXL = false;
          saveAs(data, 'Verification('+signed+').xlsx'); 
        });
        this.ngOnInit();
      }else if(response[`status`] == 400){
        this.toasterService.warning('No data for selected date')
        this.loadingXL = false;
      }
    })
  }

  // getCourseDetails(courseName,event){
  //   this.patternType = 'Select ';
  //   if(courseName){
  //     this.processApi.getCourseDetails(courseName,event.value).subscribe(data=>{
  //       this.courseDetails = data['data'];
  //     })
  //   }
  //   if(event.value == 'Semester'){
  //     this.patternType += "Semester";
  //   }else{
  //     this.patternType += "Year";
  //   }
  // }

  download(app_id,user_id){
    this.api.mergeCertificate(user_id,app_id).subscribe(data =>{
      if(data['status']=200){
        var fileName = data['filePath'].split('/').pop();
        this.api.downloadpdf(fileName, user_id)
        .subscribe(data => {
         
          saveAs(data, fileName); 
        });
      }
    })
  }

  regenerate(user_id,id){
    this.ConfirmationService.confirm({
      message:'Do you want to send for generate',
      header:'Confirmation',
      icon:'pi pi-exclamation-triangle',
      accept:()=>{
        this.api.regenerateCertificates(user_id,id).subscribe((data)=>{
          if(data['status']==200){
            this.refresh(this.student_name,this.email);
            this.toasterService.success(' successfully sent..!!!','Success',{duration : 3000});
          }else{
            this.toasterService.danger(data['message'],{duration : 3000});
          }
        })
      }
    })
  }

}
