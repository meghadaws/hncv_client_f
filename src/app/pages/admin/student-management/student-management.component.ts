import { Component, OnInit } from '@angular/core';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';

import { NbAuthJWTToken,NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
// import { CountriesService } from '../../@core/data/countries.service';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { Data } from '../../../../assets/data/data';
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'student-management',
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.scss']
})
export class StudentManagementComponent implements OnInit {
  Countries: any [];
  p: number = 1;
  public filterText: string;
  public filterPlaceholder: string;
  public filterInput = new FormControl();
  selectedYear;
  protected readonly unsubscribe$ = new Subject<void>();

  studentdata: any;
  active: any;
  searchForm:FormGroup;
  name : string;
  email : string;
  isLoadingResults: boolean = false;
  studentLength : any;
  admin:any;
  years: any;

  constructor(
    private api: ApplicationApi,
    private authService : NbAuthService,
    private router : Router,
    public toasterService: NbToastrService,
    private formBuilder:FormBuilder,
    protected globalVar:Data,
    private usersService: UserData
  ) {
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
      });


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
    this.filterText = "";
    this.filterPlaceholder = "Local Search";
    
    this.searchForm = this.formBuilder.group({
      nameCtrl:[''],
      emailCtrl:['']
      // idCtrl : [''],
    })
    const yearData = this.getYearRange();    
    this.selectedYear = yearData.selectedYear; 
    this.years = yearData.years
    this.refresh(null,null);
  }

  refresh(student_name, email){
    this.isLoadingResults = true;
    this.api.getallstudents(this.p, student_name, email, this.selectedYear).subscribe(data =>{
      this.isLoadingResults = false;
      this.studentdata = data['items'];
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
  clear(){
    this.searchForm.controls.nameCtrl.setValue('');
    this.searchForm.controls.emailCtrl.setValue('');
    this.refresh(null,null);
  }

  filterValue(event){
   
    this.selectedYear = event.value;
  }

  search(){
    if(this.searchForm.controls.nameCtrl.value || this.searchForm.controls.emailCtrl.value || this.selectedYear){
      this.p=1
       this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
     }else{
       alert("Please specify any of the search criteria")
     }
   }



  handleClick(user_id) {
    this.router.navigate(['pages/adminView'],{queryParams:{userId : user_id, viewFrom : 'studentManagement'}});
  }

   handleRefresh(){
     window.location.reload();
   }
   onChangeStatus(isActive: boolean, userId: number) {
    const newStatus = isActive ? 'active' : 'inactive';
    this.status(newStatus, userId);
  }
  status(status,userId){
    this.api.status(status,userId).subscribe((data)=>{
      if (data['status']== 200){
        this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
        alert(data['message']);
      }else{
        alert('Something Went Wrong !!!');
      }

    })
  }
  updateOtpVerify(checked: boolean, otp:number, email:String, userId: number) {

    const newOtpStatus = checked ? 1 : 0; // Assuming 1 for verified and 0 for not verified
  
    // Make the API call to update OTP verification status
    this.verifyOtp(otp, email, userId)

  }
  verifyOtp(otp, email, userId){
    this.api.verifyOtp(otp, email, userId).subscribe((data: any)=>{
      if(data['status']==200){
        this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
        this.toasterService.success('Verification Successfully Done','Success',{duration: 3000});
      }
      else{
        this.toasterService.danger('Unsuccessful!!!','Error',{duration: 3000});
      }
    })
  }

  viewMore(category,userId,user_type,course_id){
    this.router.navigate(['pages/adminView'],{queryParams:{userId : userId, viewFrom : "studentManagement"}});
  }

  pageChanged(p){
    this.p = p;
    this.globalVar.ViewpageValue=p;
    this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
    // this.ngOnInit();
  }

}
