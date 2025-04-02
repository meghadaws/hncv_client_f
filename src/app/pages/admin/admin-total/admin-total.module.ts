import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminTotalComponent } from './admin-total.component';
import {NgxPaginationModule} from 'ngx-pagination';
// import { SharedModule } from '../../pages/shared-authpipe.module';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {NbCardModule ,NbPopoverModule, NbActionsModule, NbButtonModule, NbAlertModule, NbProgressBarModule, NbInputModule} from '@nebular/theme'; 
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from '../../shared-authpipe.module';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AdminTotalComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    MatFormFieldModule,
    SharedModule,
    TabViewModule,
    TableModule,
    NbCardModule,
    NbPopoverModule,
    NbActionsModule,
    NbButtonModule,
    NbAlertModule,
    MatSelectModule,
    MatInputModule,
    // MatSelectModule,
    MatIconModule,
    // MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule, 
    NbProgressBarModule,
    // MatFormFieldModule, 
    // MatProgressBarModule, 
    // MatProgressSpinnerModule,
    NbInputModule
  ]
})
export class AdminTotalModule { }
