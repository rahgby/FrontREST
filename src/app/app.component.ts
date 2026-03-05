import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'angular';
  langs: string[] = ['en', 'es'];

  constructor(
    public translate: TranslateService
  ) {
    translate.addLangs(this.langs);

    const currentLang = this.getUsersLocale('en').split('-');
    if (this.langs.includes(currentLang[0])) {
      translate.setDefaultLang(currentLang[0]);
    } else {
      translate.setDefaultLang('en');
    }
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  ngOnInit(): void {
  }

  getUsersLocale(defaultValue: string): string {
    if (
      typeof window === 'undefined' ||
      typeof window.navigator === 'undefined'
    ) {
      return defaultValue;
    }
    const wn = window.navigator as any;
    let lang = wn.languages ? wn.languages[0] : defaultValue;
    lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;
    return lang;
  }
}
