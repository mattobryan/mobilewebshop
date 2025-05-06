import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importing components
import { AppComponent } from './app.component';
import { LoginComponent } from '../../src/app/modules/auth/login/login.component'; // Adjust the path according to your structure

// Importing services
import { AuthService } from './core/services/auth.service';

@NgModule({
  declarations: [
    AppComponent, // Root component
    LoginComponent // Login component
  ],
  imports: [
    BrowserModule,  // Required for running the app in the browser
    ReactiveFormsModule, // Required for reactive forms
    RouterModule.forRoot([ // Set up routing for the app
      { path: '', component: LoginComponent }, // Default route, could be your login page
//{ path: 'products', component: ProductsComponent } // Example for another route
    ])
  ],
  providers: [AuthService], // Registering the AuthService (or any other services)
  bootstrap: [AppComponent] // Bootstrapping the root component
})
export class AppModule {}
