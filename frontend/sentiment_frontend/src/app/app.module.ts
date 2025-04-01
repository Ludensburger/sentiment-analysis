import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- Import
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SentimentComponent } from './sentiment/sentiment.component'; // Adjust path if needed

@NgModule({
  declarations: [
    AppComponent,
    SentimentComponent, // Declare your component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // <-- Add to imports
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
