import { UntypedFormGroup } from '@angular/forms';
import { emailRegexp } from 'app/utils/validators';
import {
  getCardingSubmmodulesTypeAdmin,
  getModulesTypeAdmin,
  ModuleTypeAdmin
} from '../organization/modules-types-admin';

export class CommonAdmin {
  constructor() {}

  id = this.id_crazy;
  isLoading = false;
  isNew = true;
  listTypeMod: ModuleTypeAdmin[];
  subTypesList_: any[];

  get id_crazy() {
    const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ID_LENGTH = 12;
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return `id_crazy_${rtn}`;
  }

  get regexEmail() {
    return emailRegexp;
  }

  get regexPhone(): string {
    return '(^$|^(\\+\\s?[0-9]{2}[\\-\\.\\s]?)?([0-9][\\-\\.\\s]?){9,12}$)';
  }

  markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  removeEmpty(data) {
    for (const key of Object.keys(data)) {
      if (data[key] === '' || data[key] === null) {
        delete data[key];
      } else if (data[key] && typeof data[key] === 'object') {
        this.removeEmpty(data[key]);
        if (Object.keys(data[key]).length === 0) {
          delete data[key];
        }
      }
    }
    return data;
  }

  /**
   * Nombre:                  loadModules
   * Descripcion:             funcion que carga los tipo de modulos que se pueden ccrear
   * @author                  lguzman
   * @since                   9/14/2018 - 5:47 PM
   */
  loadModules(modules?: any[]) {
    getModulesTypeAdmin().subscribe((typesHash) => {
      this.listTypeMod = Object.keys(typesHash).map((e) => {
        const type = typesHash[e];
        type.key = e;
        type.type = type.type.toUpperCase();
        return type;
      });
      if (modules) {
        this.checkUniqueModulesPresence(modules);
      }
    });
    getCardingSubmmodulesTypeAdmin().subscribe((credit_card) => {
      this.subTypesList_ = Object.keys(credit_card).map((e) => {
        const subtype = credit_card[e];
        subtype.key = e;
        subtype.type = subtype.key.toUpperCase();
        return subtype;
      });
    });
  }

  checkUniqueModulesPresence(modules) {
    const intelligence = modules?.filter?.((m) => m.type.toLowerCase() === 'threat_context');
    const explorer = modules?.filter?.((m) => m.type.toLowerCase() === 'explorer');
    this.removeUniqueModulesFromListOfTypes(intelligence, explorer);
  }

  removeUniqueModulesFromListOfTypes(threat_context, explorer) {
    if (threat_context?.length) {
      this.listTypeMod = this.listTypeMod.filter((m) => m.type.toLowerCase() !== 'threat_context');
    }
  }
}
