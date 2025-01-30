import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarUsuariosPage } from './listar-usuarios.page';

describe('ListarUsuariosPage', () => {
  let component: ListarUsuariosPage;
  let fixture: ComponentFixture<ListarUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
