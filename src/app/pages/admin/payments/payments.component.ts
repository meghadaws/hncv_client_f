import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder  } from '@angular/forms';
import{ApplicationApi} from '../../../@core/backend/common/api/application.api'
import {studentnotes} from '../../user/studentnotes.component';
import {NbDialogService } from '@nebular/theme';
import { NbToastrService } from '@nebular/theme';
import * as moment from 'moment';
import { saveAs } from 'file-saver';
import { Data } from '../../../../assets/data/data';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
//import {Message} from 'primeng/components/common/api';

@Component({
  selector: 'ngx-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  Countries: any [];
  q: number = 1;
  p: number = 1;

  public filterText: string;
  public filterPlaceholder: string;
  public filterInput = new FormControl();

  public filterText1: string;
  public filterPlaceholder1: string;
  public filterInput1 = new FormControl();

  searchForm:FormGroup;
  date : Date = new Date();
  max = new Date();
  date1 : any;
  Details: any;
  fileName: any;
  data :any;
  DetailRes: any;
  activityData: any;
  activity_total: any;
  studentdata: any;
  studentLength: any;
  active: any;
  dateForm:FormGroup;
  dateRange: any;
  endDate: any;
  startDate: any;
  isLoadingResults: boolean = false;
  tab_type: string;
  Total_data: any;
  loadingXL: boolean;
  protected readonly unsubscribe$ = new Subject<void>();
  admin: any;
  userId: string;
  selectedYear;
  years;

  constructor(
    private formBuilder:FormBuilder,
    protected api: ApplicationApi,
    public dialogservice: NbDialogService,
    public toasterService: NbToastrService,
    private globalVar : Data,
    private router : Router,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    // const yearData = this.getYearRange();    
    // this.selectedYear = yearData.selectedYear; 
    // this.years = yearData.years
    this.searchForm = this.formBuilder.group({
      idCtrl:[''],
      emailCtrl : [''],
      nameCtrl:[''],
    })
    this.dateForm = this.formBuilder.group({
      totaldateCtrl:['']
    })

    this.filterText1 = "";
    this.filterPlaceholder1 = "Search";
    this.filterText = "";
    this.filterPlaceholder = "Local Search";
    this.getPaymentData();
    this.filterInput1
      .valueChanges
      //.debounceTime(200)
      .subscribe(term => {
      this.filterText1 = term;
    });
   
  }

  tabChanged(e) {
    var index = e.index;
    // this.msgs = [];
    if(index == 0){
      this.tab_type = 'total_payment';
      this.getPaymentData();
    }
  }

  getPaymentData(){
    this.isLoadingResults = true;
    this.api.getAll_Paydetails(this.q,this.searchForm.controls.idCtrl.value,this.searchForm.controls.nameCtrl.value,this.searchForm.controls.emailCtrl.value, this.selectedYear).subscribe(data =>{
      this.isLoadingResults = false;
      this.studentdata = data['items'];
      this.studentLength = data['total_count'];
    })
  }

  filterValue(event){
   this.selectedYear = event.value;
  }

  pageChanged(q){
    this.q = q;
    this.globalVar.ViewpageValue=q;
    this.getPaymentData();
  }

  downloadExcel(tabtype){
    this.loadingXL = true;
    this.dateRange= this.dateForm.controls.totaldateCtrl.value
    this.endDate = (this.dateRange) ? moment(new Date(this.dateRange.end)).format("YYYY-MM-DD") : '';
    this.startDate = (this.dateRange) ? moment(new Date(this.dateRange.start)).format("YYYY-MM-DD"): '';
    this.api.downloadExcel_dateTotal('Total',tabtype,this.startDate,this.endDate).subscribe((response)=>{
      if(response[`status`] == 200){
        this.api.downloadFilespaymenttotal(response[`data`])
        .subscribe(data => {
          this.loadingXL = false;
          saveAs(data, 'Verification('+tabtype+').xlsx'); 
        });
        this.getPaymentData();
      }else if(response[`status`] == 400){
        this.toasterService.warning('No data for selected date')
        this.loadingXL = false;
      }
    })
  }

  searchtotal(){
    if(this.searchForm.controls.idCtrl.value || this.searchForm.controls.nameCtrl.value || 
    this.searchForm.controls.emailCtrl.value || this.selectedYear){
      this.getPaymentData();
    }
  }

  splitPayment(tracking_id){
    this.api.splitSinglePayment(tracking_id).subscribe(data =>{
      this.getPaymentData();
    })
  }

  splitAllPayments(){
    this.api.splitAllPayments().subscribe(data =>{
      this.getPaymentData();
    })
  }
}
