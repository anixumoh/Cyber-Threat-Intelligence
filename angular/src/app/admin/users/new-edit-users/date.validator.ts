import { AbstractControl } from '@angular/forms';

export class DateValidator {
  static IsvalidDate(AC: AbstractControl) {
    // GET THE ACTUAL DATE AND TRANSFORM INTO A FORMAT USABLE
    const actualDate = new Date();
    const dd = actualDate.getDate();
    const mm = actualDate.getMonth() + 1; // January is 0!
    const yyyy = actualDate.getFullYear();
    let actualDateS;
    let ddS = dd.toString();
    let mmS = mm.toString();
    const yyyyS = yyyy.toString();

    ddS = dd < 10 ? '0' + ddS : ddS;
    mmS = mm < 10 ? '0' + mmS : mmS;

    actualDateS = ddS + '.' + mmS + '.' + yyyyS;

    // NOW WE HAVE THE ACTUAL DATE LIKE STRING, IT'S TIME TO COMPARE BOTH STRINGS
    let inputDate = '00.00.0000';
    if (AC.get('expirationTime').value) {
      inputDate = AC.get('expirationTime').value;
    }

    const a1 = inputDate;
    const a2 = actualDateS;
    const dateA = a1.split('.').reverse();
    const dateB = a2.split('.').reverse();

    function dateB_minus_dateA(dayActual, inputDay) {
      if (Number(dayActual[0]) < Number(inputDay[0])) {
        return true;
      }
      if (Number(dayActual[1]) < Number(inputDay[1])) {
        return true;
      }
      if (Number(dayActual[2]) < Number(inputDay[2])) {
        return true;
      }

      return false;
    }

    const isValid = dateB_minus_dateA(dateB, dateA);
    if (!isValid && inputDate !== '00.00.0000') {
      AC.get('expirationTime').setErrors({ IsvalidDate: true });
    }
  }
}
