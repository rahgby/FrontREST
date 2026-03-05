import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizacionPlatoModalComponent } from './personalizacion-plato-modal.component';

describe('PersonalizacionPlatoModalComponent', () => {
  let component: PersonalizacionPlatoModalComponent;
  let fixture: ComponentFixture<PersonalizacionPlatoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalizacionPlatoModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalizacionPlatoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
