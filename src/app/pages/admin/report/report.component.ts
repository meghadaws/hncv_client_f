import { Component, OnInit } from '@angular/core';
import { ApplicationApi } from '../../../@core/backend/common/api/application.api';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
// import {d ata } from '../../@core/data/data.module'
// import { CountriesService } from '../../@core/data/countries.service';
import { FormControl, FormGroup, FormBuilder  } from '@angular/forms';
// import * as moment from 'moment';
import { UserData } from '../../../@core/interfaces/common/users';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'AdminReports',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  Countries: any [];
  p: number = 1;
  public filterText: string;
  public filterPlaceholder: string;
  public filterInput = new FormControl();
  selectedYear ='2019'
  studentdata: any;
  active: any;
  country_name: any;
  date = new Date()
  max = new Date();
  apply_for: any;
  selectedCountry;
  selectedEducation;
  activity_data: any;
  p7: number = 1;
  p4: number = 1;
  p3: number = 1;
  dataLength: any;
  withinCountObj: any;
  outsideCountObj: any;
  activityData: any;
  activity_total : any;
  isLoadingResults : boolean=false;
  searchForm:FormGroup;
  studentsdata : any;
  email : any;
  activity_data_college: any;
  loading: boolean =false;
  p1: number = 1;
  admin: any;
  protected readonly unsubscribe$ = new Subject<void>();

  constructor(
    private api: ApplicationApi,
    private authService : NbAuthService,
    private router : Router,
    // private globalVar : Data,
    private formBuilder:FormBuilder,
    private usersService: UserData
    // protected countries :CountriesService
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
  }

  ngOnInit() {
    
    this.searchForm = this.formBuilder.group({
      dateCtrl : [''],
      emailCtrl : [''],
      dataCtrl : [''],
    })
    this.filterText = "";
    this.filterPlaceholder = "Search";
    // this.api.getCountryWiseApplication(this.selectedYear,'','').subscribe((data)=>{
    //   this.studentdata = data['data'];
    //   this.active=data['counts'];
    // })

    // this.filterInput
    //   .valueChanges
    //   // .debounceTime(200)
    //   .subscribe(term => {
    //   this.filterText = term;
    // });

    

  this.refresh(null,null,null)

  }

  getReportData(e){
    var index = e.index;
    if(index == 0){
      this.refresh(this.date,null,null);
    }
  }


   
  clearFilterForActivity(){
    this.filterText = "";
    this.searchForm.controls.dateCtrl.setValue("");
     this.searchForm.controls.dataCtrl.setValue("");
     this.searchForm.controls.emailCtrl.setValue("");
    this.filterPlaceholder = "Search";
    this.refresh(null,null,null)
  }
   


 

  page_Changed(p){
    this.p1 = p;
    // this.globalVar.ViewpageValue=p;
    this.refresh(this.searchForm.controls.dateCtrl.value, this.searchForm.controls.dataCtrl.value, this.searchForm.controls.emailCtrl.value);  
  }
    
  
  refresh(date, data, email){
    this.isLoadingResults = true;
    this.api.activitytracker(this.p1, date, data, email).subscribe(data =>{
      if(data['items'].length>0){

        this.activityData = data['items'];
      }
      this.isLoadingResults = false;
      
      this.activity_total = data['total_count'];
      console.log(this.activity_total);
    })
    this.filterInput
      .valueChanges
      // .debounceTime(200)
      .subscribe(term => {
        this.filterText = term;
    });
  }
    
  search(){
    //this.searchForm.controls.idCtrl.markAsDirty();
    // this.searchForm.controls.nameCtrl.markAsDirty();
    // this.searchForm.controls.emailCtrl.markAsDirty();
    if(this.searchForm.controls.dateCtrl.value || this.searchForm.controls.dataCtrl.value || this.searchForm.controls.emailCtrl.value){
    var date = this.searchForm.controls.dateCtrl.value
    //  var set_date = moment(new Date(this.date)).format("YYYY-MM-dd")
    // date = set_date 
    this.searchForm.controls.dateCtrl.setValue(date);
    this.refresh(this.searchForm.controls.dateCtrl.value, this.searchForm.controls.dataCtrl.value, this.searchForm.controls.emailCtrl.value,);  
    }else{
      alert("Please specify any of the search criteria")
    }
  }


//country_id,applying_for
}

