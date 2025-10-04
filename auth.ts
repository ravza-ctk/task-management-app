import { Injectable } from '@angular/core';
import { gapi } from 'gapi-script';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly clientId = '621267452248-799mq8nvqnhjqn8cuug62rg202b478fp.apps.googleusercontent.com';
  private readonly scopes = 'https://www.googleapis.com/auth/calendar';

  constructor() {}

  initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {
        gapi.client
          .init({
            clientId: this.clientId,
            scope: this.scopes,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          })
          .then(() => {
            resolve();
          })
          .catch((err: any) => {
            console.error('GAPI init error:', err);
            reject(err);
          });
      });
    });
  }

  async signIn(): Promise<void> {
    await this.initClient();

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      throw new Error('Google Auth instance could not be loaded.');
    }

    const user = await authInstance.signIn();
    const token = user.getAuthResponse().access_token;

    if (!token) {
      throw new Error('Erişim token alınamadı.');
    }

    console.log('Erişim Token:', token);
  }

  async listEvents(): Promise<any[]> {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance?.isSignedIn.get()) {
      throw new Error('Kullanıcı giriş yapmadı.');
    }

    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
    });

    return response.result.items;
  }

  async addEvent(event: any): Promise<void> {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
    console.log('Etkinlik oluşturuldu:', response);
  }

  signOut(): void {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance?.isSignedIn.get()) {
      authInstance.signOut();
    }
  }
}

 