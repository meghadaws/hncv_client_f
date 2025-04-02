import { Component, OnInit } from '@angular/core';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';
import { NbAuthJWTToken,NbAuthService } from '@nebular/auth';
import { ActivatedRoute, Router } from '@angular/router';
// import { CountriesService } from '../../@core/data/countries.service';
// import { CountriesService } from '../../@core/data/countries.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { Data } from '../../../../assets/data/data';
import { saveAs } from 'file-saver';
import * as moment from 'moment'
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// import { Data } from '../../shared/data';
@Component({
  selector: 'ngx-admin-total',
  templateUrl: './admin-total.component.html',
  styleUrls: ['./admin-total.component.scss']
})
export class AdminTotalComponent implements OnInit {
  Countries: any [];
  p: number = 1;
  public filterText: string;
  public filterPlaceholder: string;
  public filterInput = new FormControl();
  selectedYear;
  studentdata: any;
  active: any;
  searchForm:FormGroup;
  name : string;
  email : string;
  isLoadingResults: boolean = false;
  studentLength : any;
  totalLength: any;
  dateRange: any;
  loadingXL: boolean;
  endDate: any;
  dateForm: any;
  startDate: any;
  protected readonly unsubscribe$ = new Subject<void>();
  admin: any;
  userId: any;
  years;
  id;

  constructor(  private api: ApplicationApi, 
    private authService : NbAuthService,
    private router : Router,
    // protected countries :CountriesService,
    public toasterService: NbToastrService,
    protected globalVar:Data,
    private formBuilder:FormBuilder,
    private route: ActivatedRoute,
    private usersService: UserData) {
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
    this.refresh(null,null,null);
    this.searchForm = this.formBuilder.group({
      nameCtrl:[''],
      emailCtrl:[''],
      idCtrl : [''],
    })
    this.dateForm = this.formBuilder.group({
      dateCtrl:['']
    })
  }

  handleClick(user_id,app_id) {
    this.router.navigate(['pages/adminView'],{queryParams:{userId : user_id, app_id : app_id, viewFrom : 'total'}});
  }

  pageChanged(p){
    this.p = p;
    this.refresh(this.searchForm.controls.idCtrl.value,this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
  
  }
  clear(){
    this.searchForm.controls.idCtrl.setValue('');
    this.searchForm.controls.nameCtrl.setValue('');
    this.searchForm.controls.emailCtrl.setValue('');
    this.refresh(null,null,null);
  }
  search(){
    if(this.searchForm.controls.idCtrl.value || this.searchForm.controls.nameCtrl.value || this.searchForm.controls.emailCtrl.value || this.selectedYear){
      this.p=1
      this.refresh(this.searchForm.controls.idCtrl.value,this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
    }else{
      alert("Please specify any of the search criteria")
    }
  }

  filterValue(event){
   
    this.selectedYear = event.value;
  }


  refresh(application_id,student_name, email){
    this.isLoadingResults = true;
    this.api.getAll_PaidApplications(this.p,application_id,student_name,email,this.selectedYear).subscribe(data =>{
      this.isLoadingResults = false;
      this.studentdata = data['items'];
      this.studentLength = data['total_count'];
      this.totalLength = this.studentLength.totalLength;
    })
    this.filterInput
      .valueChanges
      .subscribe(term => {
       this.filterText = term;
    });
  }


  //downloadExcel sheet 
  downloadExcel(tabtype){
    this.loadingXL = true;
    this.dateRange= this.dateForm.controls.dateCtrl.value
    this.endDate = (this.dateRange) ? moment(new Date(this.dateRange.end)).format("YYYY-MM-DD") : '';
    this.startDate = (this.dateRange) ? moment(new Date(this.dateRange.start)).format("YYYY-MM-DD"): '';
   this.api.downloadExcelTotalApplication('Total',tabtype,this.startDate,this.endDate).subscribe((response)=>{
      if(response[`status`] == 200){
        this.api.downloadFilesTotal(response[`data`])
        .subscribe(data => {
          this.loadingXL = false;
          saveAs(data, 'Verification('+tabtype+').xlsx'); 
        });
        this.ngOnInit();
      }else if(response[`status`] == 400){
        this.toasterService.warning('No data for selected date')
        this.loadingXL = false;
      }
    })
  }


}
