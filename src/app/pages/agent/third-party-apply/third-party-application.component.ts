import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup,  Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NbToastrService,NbDialogService, NbStepperComponent,NbDateService} from '@nebular/theme';
import { ThirdPartyApplicationsApi } from '../../../@core/backend/common/api/thirdPartyApplications.api';
import { Firstpaymentdialog } from '../../student-verification/payment_dialog/paymentdialog';
import { DocumentViewer } from '../../student-application/dialog/documentViewer.component';
import * as _moment from 'moment';
import { Moment} from 'moment';
import { environment } from '../../../../environments/environment';
import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';
import { ConfirmationService } from 'primeng/api';
import { ApplicationProcessApi } from '../../../@core/backend/common/api/applicationProcess.api';
import { MatDatepicker } from '@angular/material/datepicker';
import { map, startWith } from 'rxjs/operators';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { UserData } from '../../../@core/interfaces/common/users';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';

function numericValidator(control) {
  if (control.value && isNaN(control.value)) {
    return { 'numeric': true };
  }
  return null;
}

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'ngx-third-party-application',
  styleUrls: ['./third-party-application.component.scss'],
  templateUrl : './third-party-application.component.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ConfirmationService
  ],
})
export class thirdPartyApplicationComponent implements OnInit {

  protected readonly unsubscribe$ = new Subject<void>();
  tabcheck1: Boolean =false;
	tabcheck2: Boolean =false;
	tabcheck3: Boolean =false;
  tabcheck4: Boolean =false;
  loading:Boolean =false;
  verificationData: any = [];

  marksheetInput: boolean  =false;
  //transcriptInput: boolean =false;
  degreeInput: boolean  =false;
  //sealedCoverInput: boolean=false;

  marksheetss:boolean=false;
  //transcriptss:boolean=false;
  degree:boolean=false;
  //showTranscript: boolean = false;
  showDegreet: boolean = false;
  isFormValid: boolean = false;
  supportiveDoc :boolean = false;
  courseDetails: any;
  patternValue: any;
  valueOfPattern:any;
  pattern_Type:any;
  data:any;
  semesterVal: any;
  documentData: any;
  
  @ViewChild('stepper') stepper: NbStepperComponent;
  date = new Date();
  nextStepper : Boolean = false;
  verificationTypes: any;
  verifyTypes : any;
  courseData: any;
  years_array: number[];
  marksheets : FormGroup;
  //transcripts: FormGroup;
  degrees: FormGroup;
  
  marksheetInstitute : FormGroup;
  degreeInstitute : FormGroup;
  //transcriptInstitute : FormGroup;
  max = new Date();
  documentDetails = [];
  activeTab1: boolean = false;
  activeTab2: boolean = false;
  activeTab3: boolean = false;
  uploadUrl = environment.apiUrl;
  position: string;
  status: string;
  currenttoken: NbAuthJWTToken;
  loader1: boolean = false;
  loader2: boolean = false;
  loader3: boolean = false;
  filteredOptions1: Observable<any[]>[] = [];
  logo : string = "../../../../assets/images/hsnc.png";
  pdfImg: string = '../../../assets/images/pdf.png';
  filteredOptions2: Observable<any[]>[] = [];
  filteredOptions3: Observable<any[]>[] = [];
  courseName: any;
  viewInstitute: boolean = true;
  selectedDelivery: any= 'Digital';
  selectedDeliveryMode : any = 'Normal';
  instituteDetails :any;
  personalDetails: any;
  verificationDetails: any;
  marksheetDetails: any;
  //transcriptDetails: any;
  degreeDetails: any;
  deliveryOptions: any;
  degreeInstituteDetails: any;
  //transcriptInstituteDetails: any;
  marksheetInstituteDetails: any;
  user_id: any;
  //secondYearss:boolean=false;
  patterns = [{name : 'Annual'},{name : 'Semester'}]
  courseTypes = [{ type: 'Regular' }, { type: 'External' }]
  resultClasses = [{name : 'Distinction'},{name : 'First Class'},{ name : 'Second Class'},{name : 'Pass Class'},{name : 'Fail'},{name :'ATKT'}]
  grades = [{name : 'O'},{name : 'A+'},{ name : 'A'},{name : 'B+'},{name : 'B'},{name :'C'},{name :'D'},{name :'F(Fail)'}]
  collegeData: any;
  secondYears: FormGroup;
  filteredOptions4: Observable<any[]>[] = [];
  filteredOptions5: Observable<any[]>[] = [];
  //secondYearDetails: any;
  //secondYearInstituteDetails: any;
  readonly emailValidate = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  loader: boolean;
  helpEmailId = "sfc@hsncu.edu.in";
  displayvideo1: any;
  displayvideo2: any;
  displayvideo3: any;
  showError: boolean = false;
  errorMessage: string;
  patternType: any = 'Select ';
  user: any;
  Inmarksheetss: boolean = true;
  Indegree: boolean = true;
  today = new Date();
  agent_user;


  constructor( private agentProcessApi : ThirdPartyApplicationsApi,
    private processApi : ApplicationProcessApi,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService,
    private confirmationService: ConfirmationService,
    private authService: NbAuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private usersService: UserData,
    private fb : FormBuilder,
    protected dateService: NbDateService<Date>,
    private router : Router,
    private activatedRoute:ActivatedRoute,) {
      this.usersService.getCurrentUser().pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.agent_user = user;
        // this.user_id = user.id;
        if(this.agent_user.is_email_verified == true && this.agent_user.is_otp_verified == true){
          if(this.agent_user.role != 'agent'){
            this.router.navigate(['auth/logout']);
          }
        }else{
          this.router.navigate(['auth/logout']);
        }
      })
      this.max = this.dateService.today()

  }
    
  ngOnInit(): void {
    this.user_id = this.activatedRoute.snapshot.paramMap.get('user_id');
    const now = new Date().getUTCFullYear();    
    this.years_array = Array(now - (now - 50)).fill('').map((v, idx) => now - idx);
    this.getCourses('');
   // this.getColleges();
    this.marksheets = this.fb.group({
      marksheet : this.fb.array([]),
      marksheetInstitute : this.fb.array([])
    })
    // this.transcripts = this.fb.group({
    //   transcript : this.fb.array([]),
    //   transcriptInstitute : this.fb.array([])
    // })
    this.degrees = this.fb.group({
      degree : this.fb.array([]),
      degreeInstitute : this.fb.array([])
    })
    
    this.getVerificationTypes();
    this.getDocumentDetails();
    this.getInstitutionData();
    this.getPreviewData();
    this.checkstepper();
 }

 ngAfterContentChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  setDocumentTab(){
    if(this.verificationTypes){
      if(this.verificationTypes.marksheet == true){
        this.Marksheets();
        this.InMarksheets();
      }else if(this.verificationTypes.marksheet != true && this.verificationTypes.degreeCertificate == true){
       this.Degree();
       this.InDegree();
      }else if (this.verificationTypes.marksheet != true && this.verificationTypes.degreeCertificate != true) {
        this.checkstepper();
      }
      // if (this.verificationTypes.degreeCertificate == true) {
      //   this.showDegreet = true
      // }
    }else{
      this.Marksheets();
      this.InMarksheets();
    }
  }

  checkstepper(){
    this.loader = true;
    this.agentProcessApi.checkStepper(this.user_id).subscribe(data=>{
      this.tabcheck1 = data['data'].tab1;
      this.tabcheck2 = data['data'].tab2;
      this.tabcheck3 = data['data'].tab3;
      this.tabcheck4 = data['data'].tab4;
      // this.tabcheck5 = data['data'].tab5;
      if(this.tabcheck1 == false){
        setTimeout(()=>{
					this.checkTabs(0);
        },1000);
      }else if(this.tabcheck2 == false){
				setTimeout(()=>{
					this.checkTabs(1);
        },1000);				
			}else if(this.tabcheck3 == false){
        
				setTimeout(()=>{
					this.checkTabs(2);
        },1000);
			}else{
				setTimeout(()=>{
					this.checkTabs(3);
				},1000); 
			}
    })
  }

  checkTabs(index){
    setTimeout(()=>{
      switch(index){
        case 0 :{ 
                if(index<1){
                  this.stepper.selectedIndex = index;
                }else{
                  if(this.tabcheck1 == false){
                    this.stepper.selectedIndex = 0;
                  } else {
                    this.stepper.selectedIndex = index;
                  }
                }	
                break;
              }
        case 1 :{
                if(index<2){
                  if(this.tabcheck1 == false){
                    this.stepper.selectedIndex = 0;
                  }else	{
                    this.stepper.selectedIndex = index;
                  }
                }else{
                  if(this.tabcheck2 == false){
                    this.stepper.selectedIndex = 1;
                  }else if(this.tabcheck3 == false){
                    this.stepper.selectedIndex = 2;
                  }else if(this.tabcheck4 == false){
                    this.stepper.selectedIndex = 3;
                  }
                }
                break;
              } 
        case 2 :{
                if(index<3){
                  if(this.tabcheck1 == false){
                    this.stepper.selectedIndex = 0;
                  }else if(this.tabcheck2 == false){
                    this.stepper.selectedIndex = 1;
                  }else {
                    this.stepper.selectedIndex = index;
                  }
                }else{
                  if(this.tabcheck2== false){
                    this.stepper.selectedIndex = 1;
                  }else if(this.tabcheck3 == false){
                    this.stepper.selectedIndex = 2;
                  }else if(this.tabcheck4 == false){
                    this.stepper.selectedIndex = 3;
                  }
                }
                break;
              }
        case 3 :{
                if(index<4){
                  if(this.tabcheck1 == false){
                    this.stepper.selectedIndex = 0;
                  }else if(this.tabcheck2 == false){
                    this.stepper.selectedIndex = 1;
                  }else if(this.tabcheck3 == false){
                    this.stepper.selectedIndex = 2;
                  }else {
                    this.stepper.selectedIndex = index;
                  }
                }else{
                  if(this.tabcheck1 == false){
                    this.stepper.selectedIndex = 0;
                  }else if(this.tabcheck2 == false){
                    this.stepper.selectedIndex = 1;
                  }else if(this.tabcheck3 == false){
                    this.stepper.selectedIndex = 2;
                  }
                }
                break;
              }
      }
      this.loader = false;
    },2000)    
  }

  selectVerificationType(event,type){
    if(event.checked == true){
      this.verificationData.push({
        type : type,
        event : event.checked
      })
      switch (type){
        case 'marksheet' : this.marksheetInput = true;
                          break;
        // case 'transcript' : this.transcriptInput = true;
        //                   break;
        case 'degree' : this.degreeInput = true;
                          break;
      }
    }else{
      const indexOfObject = this.verificationData.findIndex(object => {
        return object.type === type;
      })
      this.verificationData.splice(indexOfObject, 1); 
      switch (type){
        case 'marksheet' : this.marksheetInput = false;
                          break;
        // case 'transcript' : this.transcriptInput = false;
        //                   break;
        case 'degree' : this.degreeInput = false;
                          break;
      }
      this.documentCount(null, type);
    }
  }

  

  documentCount(event, type) {
    const value = event ? event.target.value : null; // If value is null, reset it
  
    // Validate the value
    if (value && (value < 1 || value > 15)) {
      this.showError = true;
      this.errorMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} count must be between 1 and 15.`;
      event.target.value = null; // Reset the input to null if out of range
      return;
    }
  
    // Update the verificationData with the document count
    this.verificationData.forEach(data => {
      if (type === data.type) {
        data.documentCount = value;
      }
    });
  
    // Hide the error message if the input is valid
    this.showError = false;
    this.errorMessage = '';
  }

  prevStep(){
    this.stepper.previous();
  }

  nextStep(){
    this.loader = true;
    var duration = 10000;
    if(this.stepper.selectedIndex == 0){
      this.saveVerificationTypes();
    }else if(this.stepper.selectedIndex == 1){
      // if(this.supportiveDoc === true){
      //    this.toastrService.show("Upload supportive documents for degree certificate", 'ERROR', {
      //   duration
      // })
    // }
      this.validateDocumentDetails('documents');
    
    }else if(this.stepper.selectedIndex == 2){
      this.validateDocumentDetails('institutes');
      this.getPreviewData();
    }else if(this.stepper.selectedIndex == 3){
      this.proceedforpayment();
    }
    setTimeout(()=>{
      this.checkstepper();
    },3000)
  }

  saveVerificationTypes(){
    this.nextStepper = true;
    var result = this.verificationData.some(data=>{
      var result = false;
      // if(data.type =='marksheet' || data.type =='transcript' || data.type =='degree'){
      if(data.type =='marksheet' || data.type =='degree'){
        result = true;
      }else{
        result = false;
      }

      return result
    })

    if(result == true){
      this.showError = false;
      this.errorMessage = ""
      this.agentProcessApi.saveVerificationTypes(this.verificationData,this.user_id).subscribe(data=>{
        if(data['status'] == 200){
          this.verificationTypes = data['data'];
          this.setDocumentTab();
        this.getDocumentDetails();
        this.getInstitutionData();
          
        }else{
          this.verificationTypes = null;
        }
      })
    }else{
      this.showError = true;
      this.errorMessage = "Select any one or more from above options."
    }
  }

  getVerificationTypes(){
    this.nextStepper = true;
    this.loader1 = true;
    this.agentProcessApi.getVerificationTypes(this.user_id).subscribe(data=>{
      
      if(data['status'] == 200){
        this.verificationTypes = data['data'];
        if(this.verificationTypes){
          if(this.verificationTypes.marksheet){
            this.verificationData.push({
              type : 'marksheet',
              documentCount : this.verificationTypes.noOfMarksheet
            })
            this.marksheetInput = true;
          }
          // if(this.verificationTypes.transcript){
          //   this.verificationData.push({
          //     type : 'transcript',
          //     documentCount : this.verificationTypes.noOfTranscript
          //   })
          //   this.transcriptInput = true;
          // }
          if(this.verificationTypes.degreeCertificate){
            this.verificationData.push({
              type : 'degree',
              documentCount : this.verificationTypes.noOfDegree
            })
            this.degreeInput = true;
          }
          this.setDocumentTab();

        }
        
      }else{
        this.verificationTypes = null;
      }
      this.loader1 = false;
    }) 
  }

  buildItem(type,val1,val2,val3,val4,val5,val6,val7,val8,val9,val10,val11,val12,val13,val14,val15,val16,val17,val18){
    if(type == 'marksheet'){
      return new FormGroup({
        id : new FormControl(val1),
        courseName: new FormControl(val2, Validators.required),
        courseType:new FormControl(val13, Validators.required),
        pattern :new FormControl(val9,Validators.required),
        semester: new FormControl(val8, Validators.required),
        seatNo: new FormControl(val3, Validators.required),
        passingMonthYear: new FormControl(val4, Validators.required),
        sgpi: new FormControl(val12, [Validators.required, numericValidator]),
        result : new FormControl(val7, Validators.required),
        grade: new FormControl(val14, [Validators.required]),
        fileName : new FormControl(val6)
      })
    }
    // if(type == 'transcript'){
    //   return new FormGroup({
    //     id : new FormControl(val1),
    //     courseName: new FormControl(val2, Validators.required),
    //     seatNo: new FormControl(val3, Validators.required),
    //     passingMonthYear: new FormControl(val4, Validators.required),
    //     transcriptNo: new FormControl(val11, Validators.required),
    //     fileName : new FormControl(val6)
    //   })
    // }
    if(type == 'degree'){
      return new FormGroup({
        id : new FormControl(val1),
        courseName: new FormControl(val2, Validators.required),
        courseType:new FormControl(val13, Validators.required),
        seatNo: new FormControl(val3, Validators.required),
        passingMonthYear: new FormControl(val4, Validators.required),
        convocationDate: new FormControl(val5, Validators.required),
        convocationNo: new FormControl(val10, Validators.required),
        result: new FormControl(val7, Validators.required),
        grade: new FormControl(val14, [Validators.required]),
        fileName : new FormControl(val6)

      })
    }
  }

  getCourses(college){
    this.processApi.getCourses(college).subscribe(data=>{
      this.courseData = data['data'];
    })
  }

  chosenMonthHandler(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>,type,index,subtype) {
    if(type == 'marksheet'){
      const ctrlValue = moment((<FormArray>this.marksheets.controls['marksheet']).at(index).value.passingMonthYear);
      ctrlValue.month(normalizedMonthAndYear.month());
      ctrlValue.year(normalizedMonthAndYear.year());
      (<FormArray>this.marksheets.controls['marksheet']).at(index).patchValue({'passingMonthYear' : ctrlValue})
      datepicker.close();
    // }else if(type == 'transcript'){
    //   const ctrlValue = moment((<FormArray>this.transcripts.controls['transcript']).at(index).value.passingMonthYear);
    //   ctrlValue.month(normalizedMonthAndYear.month());
    //   ctrlValue.year(normalizedMonthAndYear.year());
    //   (<FormArray>this.transcripts.controls['transcript']).at(index).patchValue({'passingMonthYear' : ctrlValue})
    //   datepicker.close();
    }else if(type == 'degree'){
      const ctrlValue = moment((<FormArray>this.degrees.controls['degree']).at(index).value.passingMonthYear);
      ctrlValue.month(normalizedMonthAndYear.month());
      ctrlValue.year(normalizedMonthAndYear.year());
      (<FormArray>this.degrees.controls['degree']).at(index).patchValue({'passingMonthYear' : ctrlValue})
      datepicker.close();
    }
  }

  onSelect($event: any): void {
    var maxFileSize =  5000000;
    var imgArr = $event.files[0].name.split('.');
    var extension = imgArr[imgArr.length - 1].trim();
    if ($event.files[0].size > maxFileSize) {
      this.confirmationService.confirm({
        message: 'Maximum file size should be 5 MB.',
        header: 'Invalid File Size',
        icon: 'pi pi-info-circle',
        rejectVisible : false,
        acceptLabel: 'Ok'
      });
    }
    
    if((extension!='jpg' && extension!='jpeg' && extension!='png' && extension!='JPG' && extension!='JPEG' && extension!='PNG' && extension!='pdf' && extension!='PDF') ) {
      this.confirmationService.confirm({
        message: 'Please upload your transcript in .jpeg or .jpg or .png or .pdf formats',
        header: 'Invalid File Type',
        icon: 'pi pi-info-circle',
        rejectVisible : false,
        acceptLabel: 'Ok'
      });
    }

  }

  onBeforeSend(event,i) {
    //this.loadingimg = true;
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.currenttoken = token;
        event.xhr.setRequestHeader("Authorization", `Bearer ` + this.currenttoken);
      }
    });
  }

  onUpload(event){
    this.checkFormValidity()
    const reader = new FileReader();
    var duration = 10000;
    this.position = 'top-right';
    this.status = 'success';
    if(event.files && event.files.length) {
      const [file] = event.files;
      reader.readAsDataURL(file);
      var json = event.originalEvent.body;
      
      var yourData = json.data.type; // or json["Data"]
      var yourStatus = json.status;
      var yourMessage = json.message; // or json["Data"]
      if (yourStatus == 200) {
        this.status = 'success';
        this.toastrService.show(yourMessage,'SUCCESS', { duration} );
       
        this.getDocumentDetails();
      } else if (yourStatus == 401) {
        this.status = 'error';
        this.toastrService.show(
          yourMessage,'ERROR', {
            duration
          }
        );
        this.getDocumentDetails();
      } else if (yourStatus == 400) {
        this.status = 'error';
        this.toastrService.show(yourMessage, 'ERROR', {
            duration
          }
        );
        this.getDocumentDetails();
      }
    }
  }

  saveDocumentsDetails(type,index){
    if(type == 'marksheet'){
      if((<FormArray>this.marksheets.controls['marksheet']).at(index).status == 'VALID'){
        var control =  this.marksheets.get('marksheet') as FormArray;
        var marksheet = control.at(index).value;
        this.agentProcessApi.saveDocumentDetails(type,marksheet,this.user_id).subscribe(data=>{
          this.getDocumentDetails();
          this.toastrService.show('Data saved sucessfully ','SUCCESS', { 'duration':3000} );
        })
      }else{
        this.toastrService.show('Something went wrong ','DANGER', { 'duration':3000} );
      }
    // }else if(type == 'transcript'){
    //   if((<FormArray>this.transcripts.controls['transcript']).at(index).status == 'VALID'){
    //     var control =  this.transcripts.get('transcript') as FormArray;
    //     var transcript = control.at(index).value;
    //     this.agentProcessApi.saveDocumentDetails(type,transcript,this.user_id).subscribe(data=>{
    //       this.getDocumentDetails();
    //       this.toastrService.show('Data saved sucessfully ','SUCCESS', { 'duration':3000} );
    //     })
    //   }else{
    //    this.toastrService.show('Something went wrong ','DANGER', { 'duration':3000} );
    //   }
    }else if(type == 'degree'){
      if((<FormArray>this.degrees.controls['degree']).at(index).status == 'VALID'){
        var control =  this.degrees.get('degree') as FormArray;
        var degree = control.at(index).value;
        this.agentProcessApi.saveDocumentDetails(type,degree,this.user_id).subscribe(data=>{
          this.getDocumentDetails();
          this.toastrService.show('Data saved sucessfully ','SUCCESS', { 'duration':3000} );
        })
      }else{
       this.toastrService.show('Something went wrong ','DANGER', { 'duration':3000} );
      }
    }
   
  }

  deleteDocument(id){
    this.processApi.deletefile(id).subscribe(data=>{
      var duration = 2000;
      if(data['status']==200){
        this.toastrService.success('File deleted' ,'SUCCESS', { duration} );
        this.ngOnInit();
      }else{
        this.toastrService.show('File Not deleted' ,'DANGER', { duration} );
      }
    })
  }

 changeDeliveryMode(){
    this.viewInstitute = false;
  }

  getDocumentDetails(){
    this.loader = true;
    var marklist_last_data = {courseName : null, seatNo : null, passingMonthYear : null, semester:null, sgpi:null, grade:null, 
      courseType:null,result:null, pattern: null};
    //var transcript_last_data = {courseName : null, seatNo : null, passingMonthYear : null, semester:null};
    var degree_last_data = {courseName : null, seatNo : null, passingMonthYear : null, semester:null, grade:null, 
      courseType:null,result:null};
    
    (this.marksheets.controls['marksheet'] as FormArray).clear();
    //(this.transcripts.controls['transcript'] as FormArray).clear();
    (this.degrees.controls['degree'] as FormArray).clear();
    this.agentProcessApi.getDocumentDetails(this.user_id).subscribe(data=>{
   
      if(data['status'] == 200){
        
        var marksheetCount = 0;
        var transcriptCount = 0;
        var degreeCount = 0;
        var secondYearCount = 0;
        data['data'].forEach(data =>{
          if(data.type == 'marksheet'){
            var selectedpattern;
            if(data.semester.includes('Year')){
              selectedpattern = 'Annual';
            }else if(data.semester.includes('Semester')){
              selectedpattern = 'Semester';
            }
            //                                                                        1           2        3                 4        5                              6       7          8           9               10           11   12      13        14            15         16  17   18    19          
            (<FormArray>this.marksheets.controls['marksheet']).push(this.buildItem('marksheet',data.id,data.courseName,data.seatNo,new Date(data.passingMonthYear),null,data.fileName,data.result,data.semester,selectedpattern,null,null,data.sgpi,data.courseType,data.grade,null,null,null,null));
            var control = <FormArray>this.marksheets.controls['marksheet']
            this.manageNameControl(control.length - 1,'marksheet');
            marksheetCount += 1; 
            marklist_last_data.courseName = data.courseName;
            marklist_last_data.seatNo = data.seatNo;
            marklist_last_data.passingMonthYear = data.passingMonthYear;
            marklist_last_data.semester = data.semester;
            marklist_last_data.sgpi = data.sgpi;
            marklist_last_data.grade = data.grade;
            marklist_last_data.pattern = selectedpattern;
            marklist_last_data.courseType = data.courseType;
            marklist_last_data.result = data.result;
          // }else if(data.type == 'transcript'){
          //   (<FormArray>this.transcripts.controls['transcript']).push(this.buildItem('transcript',data.id,data.courseName,data.seatNo,new Date(data.passingMonthYear),null,data.fileName,null,null,null,null,data.transcriptNo,null,null,null,null,null,null,null));
          //   var control = <FormArray>this.transcripts.controls['transcript']
          //   this.manageNameControl(control.length - 1,'transcript');
          //   transcriptCount += 1;
          //   transcript_last_data.courseName = data.courseName;
          //   transcript_last_data.seatNo = data.seatNo;
          //   transcript_last_data.passingMonthYear = data.passingMonthYear;
          }else if(data.type == 'degree'){
            (<FormArray>this.degrees.controls['degree']).push(this.buildItem('degree',data.id,data.courseName,data.seatNo,new Date(data.passingMonthYear),new Date(data.convocationDate),data.fileName,data.result,null,null,data.convocationNo,null,null,data.courseType,data.grade,null,null,null,null));
            var control = <FormArray>this.degrees.controls['degree']
            this.manageNameControl(control.length - 1,'degree');
            degreeCount += 1;
            degree_last_data.courseName = data.courseName;
            degree_last_data.seatNo = data.seatNo;
            degree_last_data.passingMonthYear = data.passingMonthYear;
            degree_last_data.grade = data.grade;
            degree_last_data.courseType = data.courseType;
            degree_last_data.result = data.result;
          }
        })
        
        setTimeout(()=>{
          var last_sem;
          if(this.verificationTypes){
            if( marklist_last_data.semester != null){
              var pattern ;
              if(marklist_last_data.semester.includes('Year')){
                pattern = "Annual";
              }else if(marklist_last_data.semester.includes('Semester')){
                pattern = "Semester";
              }
              
             
              this.processApi.getCourseDetails(marklist_last_data.courseName,pattern).subscribe(data=>{
                this.courseDetails = data['data'];
                last_sem = this.courseDetails[this.courseDetails.length -1].term_name;
              });
            }
            setTimeout(()=>{
              if(this.verificationTypes.marksheet == true){
                var count = this.verificationTypes.noOfMarksheet;
                if(marksheetCount < count ){
                  while(count > marksheetCount){
                    //                                                                         1         2                         3       4       5     6    7    8    9    10                         11   12   13        14                       15   16  17    18   19   
                    (<FormArray>this.marksheets.controls['marksheet']).push(this.buildItem('marksheet',null,marklist_last_data.courseName,'',new Date(),null,null,null,null,marklist_last_data.pattern,null,null,null,marklist_last_data.courseType,null,null,null,null,null));
                    var control = <FormArray>this.marksheets.controls['marksheet'];
                    this.manageNameControl(control.length - 1,'marksheet');
                    count--;
                  }
                }
              }
              // if(this.verificationTypes.transcript == true){
              //   var count = this.verificationTypes.noOfTranscript;
                
              //   if(transcriptCount < count ){
              //     if(transcript_last_data.courseName == null){
              //       if( marklist_last_data.semester != null){
              //           if(last_sem == marklist_last_data.semester){
              //             transcript_last_data = marklist_last_data;
              //           }else{
              //             transcript_last_data.courseName = marklist_last_data.courseName;
              //             transcript_last_data.seatNo = null;
              //             transcript_last_data.passingMonthYear = new Date();
              //           } 
              //       }else if(marklist_last_data.courseName!= null){
              //         transcript_last_data.courseName = marklist_last_data.courseName;
              //         transcript_last_data.seatNo = null;
              //         transcript_last_data.passingMonthYear = new Date();
              //       }
              //     }
              //       while(count > transcriptCount){
              //         (<FormArray>this.transcripts.controls['transcript']).push(this.buildItem('transcript',null,transcript_last_data.courseName,transcript_last_data.seatNo,new Date(transcript_last_data.passingMonthYear),null,null,null,null,null,null,null,null,null,null,null,null,null,null));
              //         var control = <FormArray>this.transcripts.controls['transcript'];
              //         this.manageNameControl(control.length - 1,'transcript');
              //         count--;
              //       }
              //   }
              // }
              if(this.verificationTypes.degreeCertificate == true){
                var count = this.verificationTypes.noOfDegree;
                
                if (degreeCount < count) {
                  if (degree_last_data.courseName == null) {
                    if (marklist_last_data.semester != null) {
                      if (last_sem == marklist_last_data.semester) {
                        degree_last_data = marklist_last_data;
                      } else {
                        degree_last_data.courseName = marklist_last_data.courseName;
                        degree_last_data.courseType = marklist_last_data.courseType;
                        degree_last_data.seatNo = null;
                        degree_last_data.passingMonthYear = new Date();
                        degree_last_data.result = null;
                      }
                    } else if (marklist_last_data.courseType != null) {
                      degree_last_data.courseName = marklist_last_data.courseName;
                      degree_last_data.courseType = marklist_last_data.courseType;
                      degree_last_data.seatNo = null;
                      degree_last_data.passingMonthYear = new Date();
                      degree_last_data.result = null;
                    } else if (marklist_last_data.courseName != null) {
                      degree_last_data.courseName = marklist_last_data.courseName;
                      degree_last_data.seatNo = null;
                      degree_last_data.passingMonthYear = new Date();
                      degree_last_data.result = null;
                    }
                  }
                  while(count > degreeCount){
                    (<FormArray>this.degrees.controls['degree']).push(this.buildItem('degree',null,degree_last_data.courseName,degree_last_data.seatNo,new Date(degree_last_data.passingMonthYear),null,null,degree_last_data.result,null,null,null,null,null,degree_last_data.courseType,degree_last_data.grade,null,null,null,null));
                    var control = <FormArray>this.degrees.controls['degree'];
                    this.manageNameControl(control.length - 1,'degree');
                    count--;
                  }
                }
              }
            },2000)
          }
          this.loader = false;
        },3000)
        
      }
      
    })
  }

  

  manageNameControl(index: number,type) {
    if(type == 'marksheet'){
      var arrayControl = this.marksheets.controls['marksheet'] as FormArray;
      this.filteredOptions1[index] = arrayControl.at(index).get('courseName').valueChanges
      .pipe(
        startWith<any>(''),
        map(courseName => this._filter('course',courseName))
      )

    // }else if(type == 'transcript'){
    //   var arrayControl = this.transcripts.controls['transcript'] as FormArray;
    //   this.filteredOptions2[index] = arrayControl.at(index).get('courseName').valueChanges
    //   .pipe(
    //     startWith<any>(''),
    //     map(courseName => this._filter('course',courseName))
    //   )

    }else if(type == 'degree'){
      var arrayControl = this.degrees.controls['degree'] as FormArray;
      this.filteredOptions3[index] = arrayControl.at(index).get('courseName').valueChanges
      .pipe(
        startWith<any>(''),
        map(courseName => this._filter('course',courseName))
      )
    }
    
    
  }

  private _filter(type,value: string){
    //return this.courseData.filter((s) => new RegExp(value, 'gi').test(s.name));
    if(type=='course'){
      const filterValue = this._normalizeValue(value);
      return this.courseData.filter(option =>
        option.name.toLowerCase().includes(filterValue)
      );
    }else if(type =='college'){
      const filterValue = this._normalizeValue(value);
      return this.collegeData.filter(option =>
        option.name.toLowerCase().includes(filterValue)
      );
    }
    
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }

  getInstitutionData(){
    this.loader3 = true;
    (this.marksheets.controls['marksheetInstitute'] as FormArray).clear();
    //(this.transcripts.controls['transcriptInstitute'] as FormArray).clear();
    (this.degrees.controls['degreeInstitute'] as FormArray).clear();
    // (this.secondYears.controls['secondYearInstitute'] as FormArray).clear();
    this.agentProcessApi.getInstitutionDetails(this.user_id).subscribe(data=>{
      if(data['status'] == 200){
        this.loader3 = false;
        if(data['data'].length > 0){
          // this.selectedDelivery = data['data'][0].deliveryOption;
          this.selectedDeliveryMode = data['data'][0].deliveryMode;
          this.viewInstitute = true;
        }
        var marksheetCount = 0;
        var transcriptCount = 0;
        var degreeCount = 0;
        var secondYearCount = 0;
        var marklist_last_data ={referenceNO : null, name:null, address:null, email:null};
        // var transcript_last_data ={referenceNO : null, name:null, address:null, email:null};
        var degree_last_data ={referenceNO : null, name:null, address:null, email:null};
        var secondYear_last_data ={referenceNO : null, name:null, address:null, email:null};
        data['data'].forEach(data =>{
          switch(data.type){
            case "marksheet":{
              (<FormArray>this.marksheets.controls['marksheetInstitute']).push(this.buildInstituteItems('marksheet',data.id,data.referenceNo,data.name,data.address,data.email,data.deliveryOption));
              marksheetCount += 1;
              marklist_last_data.referenceNO = data.referenceNo;
              marklist_last_data.name = data.name;
              marklist_last_data.address = data.address;
              marklist_last_data.email = data.email;
            }
            break;
            // case "transcript":{
            //   (<FormArray>this.transcripts.controls['transcriptInstitute']).push(this.buildInstituteItems('transcript',data.id,data.referenceNo,data.name,data.address,data.email,data.deliveryOption));
            //   transcriptCount += 1;
            //   transcript_last_data.referenceNO = data.referenceNo;
            //   transcript_last_data.name = data.name;
            //   transcript_last_data.address = data.address;
            //   transcript_last_data.email = data.email;
            // }
            // break;
            case "degree":{
              (<FormArray>this.degrees.controls['degreeInstitute']).push(this.buildInstituteItems('degree',data.id,data.referenceNo,data.name,data.address,data.email,data.deliveryOption));
              degreeCount += 1;
              degree_last_data.referenceNO = data.referenceNo;
              degree_last_data.name = data.name;
              degree_last_data.address = data.address;
              degree_last_data.email = data.email;
            }
            break;
          }
        })
        setTimeout(()=>{
          if(this.verificationTypes){
            if(this.verificationTypes.marksheet){
              var mcount = 0;
              if(this.verificationTypes.sealedCover){

                mcount = this.verificationTypes.noOfCopies;
              }else{
                mcount = 1;
              }
              while(mcount > marksheetCount){
                (<FormArray>this.marksheets.controls['marksheetInstitute']).push(this.buildInstituteItems('marksheet',null,marklist_last_data.referenceNO,marklist_last_data.name,marklist_last_data.address,marklist_last_data.email,this.selectedDelivery));
                mcount--;
              }
            }
            
            // if(this.verificationTypes.transcript){
            //   if(transcript_last_data.referenceNO == null){
            //     if( marklist_last_data.referenceNO != null){
            //       transcript_last_data = marklist_last_data;
            //     }
            //   }
            //   var tcount = 0;
            //   if(this.verificationTypes.sealedCover){

            //     tcount = this.verificationTypes.noOfCopies;
            //   }else{
            //     tcount = 1;
            //   }
            //   setTimeout(()=>{
            //     while(tcount > transcriptCount){
            //       (<FormArray>this.transcripts.controls['transcriptInstitute']).push(this.buildInstituteItems('transcript',null,transcript_last_data.referenceNO,transcript_last_data.name,transcript_last_data.address,transcript_last_data.email,this.selectedDelivery));
            //       tcount--;
            //     }
            //   },500)
            // }

            if(this.verificationTypes.degreeCertificate){
              if(degree_last_data.referenceNO == null){
                if( marklist_last_data.referenceNO != null){
                    degree_last_data = marklist_last_data;
                  }
              }
              var dcount = 0;
              if(this.verificationTypes.sealedCover){

                dcount = this.verificationTypes.noOfCopies;
              }else{
                dcount = 1;
              }
              setTimeout(()=>{
                while(dcount > degreeCount){
                  (<FormArray>this.degrees.controls['degreeInstitute']).push(this.buildInstituteItems('degree',null,degree_last_data.referenceNO,degree_last_data.name,degree_last_data.address,degree_last_data.email,this.selectedDelivery));
                  dcount--;
                }
              },700)
            }
          }
        },3000)
      }
    })
  }

  buildInstituteItems(type,id,refId,name,address,email,deliveryOption){
    return new FormGroup({
      id : new FormControl(id),
      referenceNo: new FormControl(refId, Validators.required),
      name:new FormControl(name, Validators.required),
      address:new FormControl(address, Validators.required),
      email: new FormControl(email,[Validators.required, Validators.pattern(this.emailValidate)]),
    })
  }

  displayFn(courseName) {
    return courseName ? courseName : '';
  }

  displayFn1(semester) {
    return semester ? semester : '';
  }
  
  displayFn2(collegeName) {
    return collegeName ? collegeName : '';
  }


  getCourseDetails(courseName,event){
    this.patternType = 'Select ';
    if(courseName){
      this.processApi.getCourseDetails(courseName,event.value).subscribe(data=>{
        this.courseDetails = data['data'];
      })
    }
    if(event.value == 'Semester'){
      this.patternType += "Semester";
    }else{
      this.patternType += "Year";
    }
  }
  
  public findInvalidControls(controls) {
    const invalid = [];

    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  imagePopup(imagename){
    this.dialogService.open(DocumentViewer, {
      context: {
      arr : imagename,
      user_id : this.user_id
      },
    });
  }

  
  
  selectDeliveryOption(){
    this.viewInstitute = true;
  }

  saveInstituteDetails(type,index){
    var instituteData;
    var control;
    
    switch(type){
      case "marksheet":{
        if((<FormArray>this.marksheets.controls['marksheetInstitute']).at(index).status == 'VALID'){
          control =  this.marksheets.get('marksheetInstitute') as FormArray;
          instituteData = control.at(index).value;
        }else{
          this.toastrService.show('Please Fill Institute Data','DANGER', { 'duration':3000} );
        }
      }
      break;
      // case "transcript":{
      //   if((<FormArray>this.transcripts.controls['transcriptInstitute']).at(index).status == 'VALID'){
      //     control =  this.transcripts.get('transcriptInstitute') as FormArray;
      //     instituteData = control.at(index).value;
      //   }
      // }
      // break;
      case "degree":{
        if((<FormArray>this.degrees.controls['degreeInstitute']).at(index).status == 'VALID'){
          control =  this.degrees.get('degreeInstitute') as FormArray;
          instituteData = control.at(index).value;
        }else{
          this.toastrService.show('Please Fill Institute Data','DANGER', { 'duration':3000} );
        }
      }
      break;
    }

    if(this.selectedDelivery && this.selectedDeliveryMode){
      this.agentProcessApi.saveInstitutionDetails(type,instituteData,this.selectedDelivery,this.selectedDeliveryMode,this.user_id).subscribe(data=>{
        if(data['status'] == 200){
          this.toastrService.show('Institute details saved successful','SUCCESS', { 'duration':3000} );
          this.getInstitutionData();
        }
      })
    }else{
      this.toastrService.show('Please select delivery option and mode','DANGER', { 'duration':3000} );
      this.getInstitutionData();
    }

  }

  getPreviewData(){
    this.agentProcessApi.getPreviewData(this.user_id).subscribe(data=>{
      this.personalDetails = data['data']['personalDetails'];
      this.verificationDetails = data['data']['verificationDetails'];
      this.marksheetDetails = data['data']['marksheetDetails'];
      //this.transcriptDetails = data['data']['transcriptDetails'];
      this.degreeDetails = data['data']['degreeDetails'];
      this.deliveryOptions = data['data']['deliveryOptions'];
      this.marksheetInstituteDetails = data['data']['marksheetInstitute'];
      //this.transcriptInstituteDetails = data['data']['transcriptInstitute'];
      this.degreeInstituteDetails = data['data']['degreeInstitute'];
    })
  } 

  proceedforpayment(){
    this.dialogService.open(Firstpaymentdialog, {
      context:{
        source : 'agent',
        user_id : this.user_id
      }
    }).onClose.subscribe((resp) => {
      if(resp){
        this.router.navigate([resp.url],{queryParams:{order_id :resp.order_id}});
      }
    })
  }

  Marksheets(){
    this.marksheetss=true;
    //this.transcriptss=false;
    this.degree=false;
  }

  // Transcripts(){
  //   this.marksheetss=false;
  //   //this.transcriptss=true;
  //   this.degree=false;
  // }

  Degree(){
    this.marksheetss=false;
    //this.transcriptss=false;
    this.degree=true;
  }

  setToOtherFields(type, fieldValue, i, field) {
    var count = 0;
    if (this.verificationTypes.sealedCover) {
      count = this.verificationTypes.noOfCopies;
    } else {
      count = 1;
    }
    if (field == 'course') {
      
      if (type == 'marksheet') {
        if (this.verificationTypes.marksheet) {
          for (var next = i + 1; next <= this.verificationTypes.noOfMarksheet - 1; next++) {
            (<FormArray>this.marksheets.controls['marksheet']).at(next).patchValue({ courseName: fieldValue });
            this.manageNameControl(next, 'marksheet');

          }
          if(((<FormArray>this.marksheets.controls['marksheet']).at(i).value.courseName.includes('Master in Business Administration') || 
          (<FormArray>this.marksheets.controls['marksheet']).at(i).value.courseName.includes('Master of Business Administration'))
          && ((<FormArray>this.marksheets.controls['marksheet']).at(i).value.semester === 'Semester IV' ||
          (<FormArray>this.marksheets.controls['marksheet']).at(i).value.semester === 'Second Year')){
            var passingYear = new Date((<FormArray>this.marksheets.controls['marksheet']).at(i).value.passingMonthYear).getFullYear();
            if(passingYear >=1995 && passingYear <=2003){
              (<FormArray>this.marksheets.controls['marksheet']).at(i).patchValue({'mbaCheck':true});
            }else{
              (<FormArray>this.marksheets.controls['marksheet']).at(i).patchValue({'mbaCheck':false});
            }
          }
        }
      } 
     
    } else if (field == 'sem_year') {
      var sem_yearLength = this.courseDetails.length - 1;
      if (fieldValue == this.courseDetails[sem_yearLength].term_name) {
        var courseName = (<FormArray>this.marksheets.controls['marksheet']).at(i).value.courseName;
        var seatNo = (<FormArray>this.marksheets.controls['marksheet']).at(i).value.seatNo;
        var passingMonthYear = (<FormArray>this.marksheets.controls['marksheet']).at(i).value.passingMonthYear;
        var result = (<FormArray>this.marksheets.controls['marksheet']).at(i).value.result;
        if(((<FormArray>this.marksheets.controls['marksheet']).at(i).value.courseName.includes('Master in Business Administration') || 
          (<FormArray>this.marksheets.controls['marksheet']).at(i).value.courseName.includes('Master of Business Administration'))
          && ((<FormArray>this.marksheets.controls['marksheet']).at(i).value.semester === 'Semester IV' ||
          (<FormArray>this.marksheets.controls['marksheet']).at(i).value.semester === 'Second Year')){
            var passingYear = new Date((<FormArray>this.marksheets.controls['marksheet']).at(i).value.passingMonthYear).getFullYear();
            if(passingYear >=1995 && passingYear <=2003){
              (<FormArray>this.marksheets.controls['marksheet']).at(i).patchValue({'mbaCheck':true});
            }else{
              (<FormArray>this.marksheets.controls['marksheet']).at(i).patchValue({'mbaCheck':false});
            }
          }
        
        if (this.verificationTypes.degreeCertificate) {
          for (next = 0; next < this.verificationTypes.noOfDegree; next++) {
            (<FormArray>this.degrees.controls['degree']).at(next).patchValue({ courseName: courseName });
            this.manageNameControl(next, 'degree');
            (<FormArray>this.degrees.controls['degree']).at(next).patchValue({ seatNo: seatNo });
            (<FormArray>this.degrees.controls['degree']).at(next).patchValue({ passingMonthYear: new Date(passingMonthYear) });
            (<FormArray>this.degrees.controls['degree']).at(next).patchValue({ result: new Date(result) });
          }
        }
      }
    } else if (field == 'refNO') {
      var refNo;
      if (type == 'marksheet') {
        refNo = (<FormArray>this.marksheets.controls['marksheetInstitute']).at(i).value.referenceNo;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.marksheets.controls['marksheetInstitute']).at(next).patchValue({ referenceNo: refNo });
        }
        for (next = 0; next < count; next++) {
          
          if (this.verificationTypes.degreeCertificate)
            (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ referenceNo: refNo });
          
        }
      } else if (type == 'degree') {
        refNo = (<FormArray>this.degrees.controls['degreeInstitute']).at(i).value.referenceNo;
        for (next = i + 1; next <= count; next++) {
          (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ referenceNo: refNo });
        }
        
      }

    } else if (field == 'instName') {
      var instName;
      if (type == 'marksheet') {
        instName = (<FormArray>this.marksheets.controls['marksheetInstitute']).at(i).value.name;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.marksheets.controls['marksheetInstitute']).at(next).patchValue({ name: instName });
        }
        for (next = 0; next < count; next++) {
        
          if (this.verificationTypes.degreeCertificate)
            (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ name: instName });
          
        }
      }  else if (type == 'degree') {
        instName = (<FormArray>this.degrees.controls['degreeInstitute']).at(i).value.name;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ name: instName });
        }
        for (next = 0; next < count; next++) {
          
        }
      }
    } else if (field == 'address') {
      var address;
      if (type == 'marksheet') {
        address = (<FormArray>this.marksheets.controls['marksheetInstitute']).at(i).value.address;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.marksheets.controls['marksheetInstitute']).at(next).patchValue({ address: address });
        }
        for (next = 0; next < count; next++) {
        
           
          if (this.verificationTypes.degreeCertificate)
            (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ address: address });
          
        }
      }  else if (type == 'degree') {
        address = (<FormArray>this.degrees.controls['degreeInstitute']).at(i).value.address;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ address: address });
        }
        
      }
    } else if (field == 'email') {
      var email;
      if (type == 'marksheet') {
        email = (<FormArray>this.marksheets.controls['marksheetInstitute']).at(i).value.email;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.marksheets.controls['marksheetInstitute']).at(next).patchValue({ email: email });
        }
        for (next = 0; next < count; next++) {
          
            
          if (this.verificationTypes.degreeCertificate)
            (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ email: email });
          
        }
      } 
      
     else if (type == 'degree') {
        email = (<FormArray>this.degrees.controls['degreeInstitute']).at(i).value.email;
        for (next = i + 1; next < count; next++) {
          (<FormArray>this.degrees.controls['degreeInstitute']).at(next).patchValue({ email: email });
        }
        
      }
    } else if (field == 'college') {
      if (type == 'marksheet') {
        if (this.verificationTypes.marksheet) {
          for (var next = i + 1; next <= this.verificationTypes.noOfMarksheet - 1; next++) {
            (<FormArray>this.marksheets.controls['marksheet']).at(next).patchValue({ collegeName: fieldValue });
            this.manageNameControl(next, 'marksheet');

          }
        }
      } 
     
    } else if (field == 'courseType') {
      if (type == 'marksheet') {
        if (this.verificationTypes.marksheet) {
          for (var next = i + 1; next <= this.verificationTypes.noOfMarksheet - 1; next++) {
            (<FormArray>this.marksheets.controls['marksheet']).at(next).patchValue({ courseType: fieldValue });

          }
        }
      } 
      
    }
    else if (field == 'pattern') {
     
    
      // Ensure fieldValue is updated from the source
      if (!fieldValue) {
        console.warn("fieldValue is undefined, defaulting...");
        fieldValue = 'defaultValue'; // Replace with your fallback logic
      }
    
      if (type == 'marksheet') {
       
    
        if (this.verificationTypes.marksheet) {
          
    
          for (let next = i + 1; next <= this.verificationTypes.noOfMarksheet - 1; next++) {
            const marksheetControls = (<FormArray>this.marksheets.controls['marksheet']);
            if (next < marksheetControls.length) {
              marksheetControls.at(next).patchValue({ pattern: fieldValue });
             
            } else {
              console.warn("Invalid index:", next);
            }
          }
        }
      } 
    }
    
  }

  videoPopup(steppernum){
    if(steppernum == 1){
      this.displayvideo1 = true;
    }
    if(steppernum == 2){
      this.displayvideo2 = true;
    }
    if(steppernum == 3){
      this.displayvideo3 = true;
    }
  };

  deleteDetails(id,type){
    this.processApi.deletedoc(id,type).subscribe(data=>{
      var duration=2000;
      if(data['status']==200){
        this.toastrService.success('Details deleted','SUCCESS',{duration});
        this.ngOnInit();
      }else{
        this.toastrService.show('Details not deleted','DANGER',{duration});
      }
    })
  };

  onPatternSelection(event:any){
    this.patternValue=event.value;
    if(this.patternValue){
      this.processApi.getCourseDetails(this.courseName,this.patternSup).subscribe((data:any)=>{
        this.valueOfPattern = data['data']
      })
    }
  }
  
  patternSup(arg0: string, patternSup: any) {
      throw new Error('Method not implemented.');
  }

  checkFormValidity(): void{
    this.isFormValid = this.pattern_Type
  }

  validateDocumentDetails(type) {
    this.agentProcessApi.validateDocumentDetails(this.user_id, type).subscribe(data => {
       var validateData = data['data'];
       if (validateData.marksheet == false ) {
         this.Marksheets();
         // if(this.marksheetData == true)
          this.InMarksheets();
       } else if (validateData.degreeCertificate == false) {
         this.Degree();
         this.InDegree();
       } else {
         this.setDocumentTab();
       }
     })
  }

  InDegree() {
    this.Inmarksheetss = false;
    this.Indegree = true;
  }

  InMarksheets() {
    this.Inmarksheetss = true;
    this.Indegree = false;
  }

}