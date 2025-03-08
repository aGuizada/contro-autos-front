
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);
  
  constructor() {
    this.online$.next(navigator.onLine);
    
    // Escuchadores para navegador
    window.addEventListener('online', () => this.online$.next(true));
    window.addEventListener('offline', () => this.online$.next(false));
  }

  public getNetworkStatus(): Observable<boolean> {
    return this.online$.asObservable();
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }
}