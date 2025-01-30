import { Component, OnInit ,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] ,
})
export class LoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
