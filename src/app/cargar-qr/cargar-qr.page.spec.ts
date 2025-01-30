import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargarQrPage } from './cargar-qr.page';

describe('CargarQrPage', () => {
  let component: CargarQrPage;
  let fixture: ComponentFixture<CargarQrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CargarQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
