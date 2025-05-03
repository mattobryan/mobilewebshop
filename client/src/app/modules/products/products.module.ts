import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { NavbarComponent } from './shared/navbar.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'create', component: ProductCreateComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'edit/:id', component: ProductEditComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: ':id', component: ProductDetailComponent }
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
