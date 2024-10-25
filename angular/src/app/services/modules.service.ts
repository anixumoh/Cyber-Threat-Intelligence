import { Injectable } from "@angular/core";

@Injectable()
export class ModulesService {
  private modules = {
    credential: 1,
    malware: 2,
    credit_card: 3
  };

  getModuleId(name) {
    return this.modules[name];
  }
}
