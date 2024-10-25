import {Injectable} from '@angular/core';
import {AttackPatternsTransformer} from "app/dashboard/intelligence/tranforms/attack-patterns.transformer";
import {CampaignsTransformer} from "app/dashboard/intelligence/tranforms/campaigns.transformer";
import {ThreatActorsTransformer} from "app/dashboard/intelligence/tranforms/threat-actors.transformer";
import {ToolsTransformer} from "app/dashboard/intelligence/tranforms/tools.transformer";
import {MalwaresTransformer} from "app/dashboard/intelligence/tranforms/malwares.transformer";
import {CrimeServersTransformer} from "app/dashboard/intelligence/tranforms/crime-servers.transformer";
import {IpsTransformer} from "app/dashboard/intelligence/tranforms/ips.transformer";
import {SignaturesTransformer} from 'app/dashboard/intelligence/tranforms/signatures.transformer';
import {FqdnsTransformer} from 'app/dashboard/intelligence/tranforms/fqdns.transformer';
import {CveTransformer} from 'app/dashboard/intelligence/tranforms/cve.transformer';

@Injectable()
export class TransformFactory {

  constructor(
    protected attackPatternTransformer: AttackPatternsTransformer,
    protected campaignTransformer: CampaignsTransformer,
    protected threatActorsTransformer: ThreatActorsTransformer,
    protected toolTransformer: ToolsTransformer,
    protected signatureTransformer: SignaturesTransformer,
    protected malwareTransformer: MalwaresTransformer,
    protected crimeServerTransformer: CrimeServersTransformer,
    protected ipTransformer: IpsTransformer,
    protected fqdnTransformer: FqdnsTransformer,
    protected cveTransformer: CveTransformer
  ) {
  }

  getTransformedData(target, data, state, currentOrganizationId = null, currentModuleId = null) {
    if (target === "threat-actor") {
      return this.threatActorsTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "attack-pattern") {
      return this.attackPatternTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "tool") {
      return this.toolTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "signature") {
      return this.signatureTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "campaign") {
      return this.campaignTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "malware") {
      return this.malwareTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "crime-server") {
      return this.crimeServerTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "ip") {
      return this.ipTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === "fqdn") {
      return this.fqdnTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
    else if (target === 'cve') {
      return this.cveTransformer.transformData(data, state, currentOrganizationId, currentModuleId);
    }
  }
}
