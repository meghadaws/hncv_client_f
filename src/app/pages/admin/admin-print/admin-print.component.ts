import { Component, OnInit} from '@angular/core';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';
import { NbAuthService } from '@nebular/auth';
import { Router,ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ConfirmationService } from 'primeng/api';
import * as printJS from 'print-js'
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { addressSectionComponent } from './addressSection';
import { saveAs } from 'file-saver';

@Component({
  selector: 'ngx-admin-print',
  templateUrl: './admin-print.component.html',
  styleUrls: ['./admin-print.component.scss'],
  providers:[ConfirmationService],
})
export class AdminPrintComponent implements OnInit {
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
  userId : any;
  student_name: any;
  admin:any;
  startDate: string;
  endDate: string;
  years;
  id;
  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private api: ApplicationApi,
    private router : Router,
    private ConfirmationService: ConfirmationService,
    private dialogService: NbDialogService,
    public toasterService: NbToastrService,
    private route: ActivatedRoute,
    private formBuilder:FormBuilder,
    private usersService: UserData,
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
      nameCtrl:[''],
      emailCtrl:['']
      // idCtrl : [''],
    })

    this.refresh(null,null);
  }

  handleClick(user_id,app_id) {
    this.router.navigate(['pages/adminView'],{queryParams:{userId : user_id, app_id : app_id, viewFrom : 'total'}});
  }

  pageChanged(event){
    this.p = event;
    this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
  }

  refresh(student_name, email){
    this.student_name = student_name;
    this.isLoadingResults = true;
    this.api.getAll_signedApplications(this.p,student_name,email,'print',this.selectedYear).subscribe(data =>{
      this.isLoadingResults = false;
      this.studentdata = data['items'];
      this.studentLength = data['total_count'];
    })
    this.filterInput
      .valueChanges
      .subscribe(term => {
       this.filterText = term;
    });
  }

  search(){
    if( this.searchForm.controls.idCtrl.value || this.searchForm.controls.nameCtrl.value || this.searchForm.controls.emailCtrl.value || this.selectedYear){
      this.refresh(this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value);
    }else{
      alert("Please specify any of the search criteria")
    }
  }

  printLetter(id,user_id){
    this.api.getVerificationLetters(id,user_id).subscribe(data=>{
      var verificationLetters = data['data'];
      setTimeout(() => {    
        printJS({
          printable: verificationLetters, 
          type:'pdf', 
          showModal:true
        })
      }, 2000);
    })
  }

  printAddress(id, user_id){
    this.dialogService.open(addressSectionComponent, {
      context: {
        user_id : user_id
      },
    }).onClose.subscribe(dataValues => {
      if(dataValues){
        this.api.getInstituteAddress(id,user_id,dataValues).subscribe((data: any) => {
          if(data['status'] == 200){
            setTimeout(() => {            
              printJS({
                printable: data['data'],
                type: 'pdf',
                showModal: true, 
                modalMessage: "Document Loading...",
             });
            }, 3000);
          }else if(data['status'] == 400){
            this.toasterService.danger(data['message'],'Error',{preventDuplicates:true});
          }      
            err => console.error(err);
        })
      }
    });
  }

  downloadExcel(){
    this.api.downloadExcel('print' ,'accept',this.startDate,this.endDate).subscribe((response)=>{
      this.api.downloadFiles(response['data']).subscribe(data => {
        saveAs(data,response['data']) ;
      });
    })
  }

  filterValue(event){
   
    this.selectedYear = event.value;
  }
}
