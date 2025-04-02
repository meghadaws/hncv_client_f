import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSignedComponent } from './admin-signed.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NbCardModule ,NbPopoverModule, NbActionsModule, NbButtonModule, NbAlertModule, NbProgressBarModule, NbInputModule,  NbTabsetModule,NbDatepickerModule} from '@nebular/theme'; 
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedModule } from "../../shared-authpipe.module";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
 

@NgModule({
    declarations: [AdminSignedComponent],
    imports: [
        CommonModule,
        NgxPaginationModule,
        ConfirmDialogModule,
        NbTabsetModule,
        // /MatFormFieldModule,
        // SharedModule,
        TabViewModule,
        TableModule,
        NbCardModule,
        NbPopoverModule,
        NbActionsModule,
        NbButtonModule,
        NbAlertModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        // MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        NbProgressBarModule,
        MatFormFieldModule, 
        // MatProgressBarModule, 
        // MatProgressSpinnerModule,
        NbInputModule,
        NbDatepickerModule,
        SharedModule
    ]
})
export class AdminSignedModule { }
