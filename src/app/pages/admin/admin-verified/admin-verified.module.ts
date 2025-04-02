import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgxPaginationModule} from 'ngx-pagination';
// import { SharedModule } from '../../pages/shared-authpipe.module';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NbCardModule ,NbPopoverModule, NbActionsModule, NbButtonModule, NbAlertModule, NbProgressBarModule, NbInputModule, NbTabsetModule, NbSpinnerModule} from '@nebular/theme'; 
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AdminVerifiedComponent } from './admin-verified.component'
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedModule } from "../../shared-authpipe.module";
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [AdminVerifiedComponent],
    imports: [
        CommonModule,
        NgxPaginationModule,
        ConfirmDialogModule,
        MatFormFieldModule,
        // SharedModule,
        NbTabsetModule,
        TabViewModule,
        TableModule,
        NbCardModule,
        NbPopoverModule,
        NbActionsModule,
        NbSpinnerModule,
        NbButtonModule,
        NbAlertModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        // MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        NbProgressBarModule,
        // MatFormFieldModule, 
        // MatProgressBarModule, 
        // MatProgressSpinnerModule,
        NbInputModule,
        SharedModule
    ]
})
export class AdminVerifiedModule { }
