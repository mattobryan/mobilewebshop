import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { NavbarComponent } from './shared/navbar.component';

const routes: Routes = [
  { path: '', component: ProductListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProductListComponent,
    NavbarComponent
  ],
  exports: [
    RouterModule
  ]
})
export class ProductsModule { }
