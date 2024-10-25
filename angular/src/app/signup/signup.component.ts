import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { TrialService } from 'app/services/trial.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('captchaRef2') captchaRef2: ElementRef;
  @ViewChild('landing') landing: ElementRef;
  @ViewChild('referral') referral: ElementRef;
  appLogo = `assets/brand/${environment.logoImageDir}`;
  wform: UntypedFormGroup;
  ImNotARobot = false;
  key = environment.RECAPTCHA_PUBLIC_KEY;
  intelReferralUrl: string;
  intelLandingUrl: string;
  intelGeoIp: string;
  emailConfirmation = false;
  validation = false;
  validToken: boolean;
  token: string;
  adsValues: any;
  private _reCaptchaId: number;
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected fb: UntypedFormBuilder,
    private trialService: TrialService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private router: Router,
    private toastrService: ToastrService
  ) {
    this.token = this.route.snapshot.queryParams['token'];
    this.emailConfirmation = !!this.token;

    if (!this.emailConfirmation) {
      this.trialService.loadScript().then((data) => {
        if (data.loaded) {
          this.zone.runOutsideAngular(() => {
            this.submitTheForm();
          });
        }
      });
    }
  }

  ngOnInit() {
    if (this.emailConfirmation) {
      this.tokenValidation();
    } else {
      this.instanceForm();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (!this.emailConfirmation) {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha) {
        this._reCaptchaId = grecaptcha.render(this.captchaRef2.nativeElement, {
          sitekey: this.key,
          callback: () => this.resolvedCaptcha(event),
          'expired-callback': () => grecaptcha.reset(this._reCaptchaId),
        });
      }
    }
  }

  get regexText() {
    return /^[A-Za-z -]{2,}$/;
  }

  get regexEmail() {
    const rgx = new RegExp(
      '([a-zA-Z0-9._-]+@(?!hotmail|gmail|yahoo|gmx|ymail|bluewin|protonmail|outlook|t-online|web.|online.|aol.|live.)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4})'
    );
    return rgx;
  }

  get regexPhone() {
    return /^\d{9,}$/;
  }

  get regexPassword() {
    return /(?=^.{10,}$)((?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]))^.*$/;
  }

  submitTheForm() {
    this.adsValues = {
      landing: this.landing.nativeElement.value,
      referral: this.referral.nativeElement.value,
    };
    this.submitForm();
  }

  submitForm() {
    const signupUser = {
      name: this.wform.get('name').value,
      firstSurname: this.wform.get('firstSurname').value,
      job: this.wform.get('job').value,
      email: this.wform.get('email').value,
      telephone: this.wform.get('telephone').value,
      password: this.wform.get('password').value,
      captcha: this.wform.get('captcha').value,
      leadSource: '',
      intelReferralUrl: this.adsValues.referral,
      intelLandingUrl: this.adsValues.landing,
    };

    if (this.wform.valid) {
      this.trialService
        .signup(signupUser)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            this.wform.reset();
            this.toastrService.success('Registration successful. Check out your email account, please.');
          },
          (e) => {
            if (e.status === 400) {
              this.toastrService.error('The user already exists.', 'Error');
            } else {
              this.toastrService.error('Something went wrong while trying to Sign Up.', 'Error');
            }
          }
        );
    }
  }

  resolvedCaptcha(r) {
    this.ImNotARobot = !this.ImNotARobot;
  }

  onRefresh() {
    const currentUrl = this.router.url.split('?')[0];

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigated = false;
      this.router.navigate([currentUrl]);
      this.emailConfirmation = false;
      this.validation = false;
    });
  }

  private instanceForm() {
    this.wform = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(this.regexText)]],
      firstSurname: ['', [Validators.required, Validators.pattern(this.regexText)]],
      job: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(this.regexEmail)]],
      telephone: ['', [Validators.required, Validators.pattern(this.regexPhone)]],
      password: ['', [Validators.required, Validators.pattern(this.regexPassword)]],
      captcha: [''],
      leadSource: [''],
    });
  }

  private tokenValidation() {
    this.trialService
      .emailConfirmation(this.token)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.validation = true;
          this.validToken = true;
        },
        () => {
          this.validation = true;
          this.validToken = false;
        }
      );
  }
}
