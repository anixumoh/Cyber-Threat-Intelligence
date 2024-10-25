import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { ServerList } from '../../../../shared/cs/server-list';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { CvesService } from '../../../../core/models/cves.service';
import { ModuleModel, OrganizationModel } from 'app/dashboard/organization/models';
import { NewTabService } from 'app/services/new-tab.service';
import { IQuickFilter } from '../../../../shared/components/tcx-quick-filters/tcx-quick-filters.component';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';
import moment from 'moment';
import { UserAccountService } from 'app/dashboard/user/account.service';

@Component({
  selector: 'app-cves-list',
  templateUrl: './cves-list.component.html',
  styleUrls: ['./cves-list.component.scss']
})
export class CvesListComponent extends ServerList implements OnInit, OnDestroy {
  dorkFields = [];
  activeModule: ModuleModel;
  showModal = false;
  lastItem;
  activeOrganization: OrganizationModel;
  listError = '';
  scoreRangeAndColor = [
    {
      range: [0, 4],
      color: 'rgba(0,177,143,0.5)'
    },
    {
      range: [4, 7],
      color: 'rgba(235,203,0,0.65)'
    },
    {
      range: [7, 10],
      color: 'rgba(220,102,90,0.5)'
    }
  ];
  currentYear = new Date().getFullYear();
  quickFilters: IQuickFilter[] = [
    {
      title: 'CVEs by platform / software',
      filters: [
        { name: 'Windows', dork: 'platform_name:~"Microsoft Windows"' },
        {
          name: 'Linux',
          dork: 'description:~"Linux" OR description:~"Unix" OR platform_name:~"Linux" OR platform_name:~"unix" OR platform_name:~"Redhat" OR platform_name:~"Debian"  OR platform_name:~"suse" OR platform_name:~"fedora"'
        },
        { name: 'Microsoft Office', dork: 'platform_name:~"Microsoft Office"' },
        { name: 'Microsoft Exchange', dork: 'platform_name:~"Microsoft Exchange"' },
        { name: 'VPN software', dork: 'platform_name:~"vpn" OR description:~"vpn"' },
        { name: 'RDP software', dork: 'platform_name:~"rdp" OR description:~"rdp"' },
        { name: 'Zoom', dork: 'platform_cpe:^"cpe:2.3:a:zoom:zoom:"' }
      ]
    },
    {
      title: 'Relevant filters',
      filters: [
        { name: `Critical CVEs in ${this.currentYear}`, dork: `name:^"CVE-${this.currentYear}"` },
        { name: 'CVEs with exploits', dork: 'num_exploits:>0' },
        { name: 'CVEs with related malware', dork: 'num_malware:>0' },
        { name: 'CVEs with MS Bulletins', dork: 'num_bulletins:>0' },
        { name: 'CVEs used by Threat Actors', dork: 'actors:~""' },
        {
          name: 'CVEs used by Ransomware Groups',
          dork: 'actors:"Ako Group" OR actors:"APT41" OR actors:"Andariel" OR actors:"Avaddon" OR actors:"avos" OR actors:"Babuk Team" OR actors:"Black Kingdom" OR actors:"BlackMatter Gang" OR actors:"Cerber gang" OR actors:"Cring gang" OR actors:"crylock" OR actors:"DarkSide Group" OR actors:"DearCry gang" OR actors:"Dharma Group" OR actors:"DoppelPaymer Group" OR actors:"Dridex Group" OR actors:"eCh0raix" OR actors:"Egregor Gang" OR actors:"Ekans Group" OR actors:"Everest ransom team" OR actors:"FIN6" OR actors:"Grief" OR actors:"Haron Gang" OR actors:"HelloKitty" OR actors:"HimalayA" OR actors:"Hive Gang" OR actors:"Hotarus Corp" OR actors:"Jingo" OR actors:"jsworm" OR actors:"LockBit Group" OR actors:"LockFile" OR actors:"Lorenz Gang" OR actors:"Maze Team" OR actors:"Mespinoza Actor" OR actors:"MountLocker" OR actors:"Nefilim Group" OR actors:"Netwalker Group" OR actors:"Nosophoros" OR actors:"Orange" OR actors:"Prometheus" OR actors:"Ragnar Locker Actor" OR actors:"Ragnarok Gang" OR actors:"rushteam" OR actors:"SamSam Group" OR actors:"SocGholish" OR actors:"Sodinokibi" OR actors:"Sprite Spider" OR actors:"SunCrypt Group" OR actors:"TA505" OR actors:"Team Snatch" OR actors:"TimisoaraHackerTeam (THT)" OR actors:"Trickbot Group" OR actors:"UNC2447" OR actors:"Vice Society" OR actors:"WannaCry Group" OR actors:"Zeoticus"'
        },
        { name: 'CVEs used by Exploit Kits', dork: 'tools:~"Exploit Kit"' }
      ]
    }
  ];

  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private cvesService: CvesService,
    private newTabService: NewTabService,
    private accountService: UserAccountService
  ) {
    super();
  }

  ngOnInit() {
    this.loading = true;
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    const { dork } = this.route.snapshot.queryParams;
    if (dork) {
      this.searchText = dork;
    }

    this.cvesService
      .getOptions()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.dorkFields = this.improveDorks(data.dork_fields);
        }
        this.accountService.getSaveDorks('cves', this.quickFilters);
        this.loadSavedSearches();
        this.reloadData();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  improveDorks(dorks) {
    for (const key in dorks) {
      if (dorks.hasOwnProperty(key)) {
        switch (key) {
          case 'name':
            dorks[
              key
            ].description = `The CVE code or value. Example: <span class="set-dork-example">name:"CVE-2017-0199"</span>`;
            break;
          case 'score':
            dorks[
              key
            ].description = `The CVSS score of the CVE, provided by MITRE, in its version 3 if available, version 2 otherwise. Example: <span class="set-dork-example">score:>8.5</span>`;
            break;
          case 'blueliv_score':
            dorks[
              key
            ].description = `The dynamic score provided by Blueliv based on factors like exploitability, public exploits available, number of mentions/references, relations with Actors / Campaigns / Tools, etc. Example: <span class="set-dork-example">blueliv_score:>9.1</span>`;
            break;
          case 'num_exploits':
            dorks[
              key
            ].description = `Number of public exploits. Example: <span class="set-dork-example">num_exploits:>3</span>`;
            break;
          case 'num_platforms':
            dorks[key].description = `Number of platforms/products affected by the CVE. `;
            break;
          case 'num_bulletins':
            dorks[
              key
            ].description = `Number of Microsoft Bulletins related to the CVE. Example: <span class="set-dork-example">num_bulletins:>=1</span>`;
            break;
          case 'num_signatures':
            dorks[key].description = `Number of signatures (Yara / Snort / OpenIOC…) related to the CVE.`;
            break;
          case 'num_malware':
            dorks[
              key
            ].description = `Number of malware samples classified with a CVE name. Example: <span class="set-dork-example">num_malware:>100</span>`;
            break;
          case 'num_crime_servers':
            dorks[key].description = `Number of crimerservers/C2 related to the CVE. `;
            break;
          case 'actors':
            dorks[
              key
            ].description = `Finds CVEs related to the actors matching the dork. Example: <span class="set-dork-example">actors:~""</span> (all actors)`;
            break;
          case 'tools':
            dorks[key].description =
              'Finds CVEs related to tools like Exploit Kits or exploit builders. Example: <span class="set-dork-example">tools:$"Exploit Kit"</span>';
            break;
          case 'campaigns':
            dorks[
              key
            ].description = `Finds CVEs related to campaigns matching the dork. Example: <span class="set-dork-example">campaigns:~"COVID"</span>`;
            break;
          case 'tags':
            dorks[
              key
            ].description = `Tags related to the CVE. Example: <span class="set-dork-example">tags:"netgear"</span>`;
            break;
        }
      }
    }
    delete dorks.id;
    return dorks;
  }

  details(event, { name, id }) {
    if (name || id) {
      if (event.target.type === 'checkbox') {
        return;
      }
      const url = `/dashboard/organizations/${this.activeOrganization.id}/modules/${
        this.activeModule.id
      }/threat_context/cves/${name || id}`;
      this.newTabService.openNewTab(event, url, { dork: this.searchText });
    }
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  processPlatforms(platforms) {
    if (platforms && Array.isArray(platforms)) {
      const ids = [];
      for (const item of platforms) {
        const id = item.id;
        const aux = id.split(':');
        if (aux.length >= 4) {
          ids.push(this.capitalize(aux[3]));
        }
      }
      return [...new Set(ids)];
    }
    return [];
  }

  exportToCSV() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(convertToCSV(items), 'cves');
  }

  exportToJson() {
    const items = this.getExportableData(this.getCheckedItems());
    exportClientFile(JSON.stringify(items), 'cves', 'json');
  }

  reloadData() {
    this.loading = true;
    this.listError = '';
    let params: any = { limit: this.limit, page: this.page };
    if (this.sort) {
      params.sort = `${this.sort}`;
    }
    if (this.searchText) {
      const isDork = this.checkSearchCriteriaHasDorks();
      let dork = '';
      const bluelivScorePattern = /(blueliv_score:\+?\-?\=?\<?\>?\s?)([0-9]+\.?[0-9]*)/;
      if (isDork) {
        if (bluelivScorePattern.test(this.searchText)) {
          dork = this.searchText.replace(bluelivScorePattern, (match, $1, $2) => {
            const scoreValue = +$2;
            if (Number.isNaN(scoreValue)) {
              return this.searchText;
            } else {
              return `${$1}${scoreValue > 10 ? scoreValue : scoreValue * 10}`;
            }
          });
        } else {
          dork = this.searchText;
        }
      }

      if (isDork) {
        params = { ...params, ...{ dork } };
      } else {
        const newDork = this.limitDorkToBeSentByHttpGet(this.processSearchText(this.searchText));
        params = {
          ...params,
          dork: newDork.value
        };
        this.searchText = newDork.value;
        if (newDork.lastItem) {
          this.lastItem = newDork.lastItem;
          this.showModal = true;
        }
      }
    }
    this.cvesService
      .list(params)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        ({ data, meta }: any) => {
          if (data) {
            this.bulk = false;
            this.items = data.map(({ id, attributes, relationships }) => {
              return {
                id,
                ...attributes,
                bl_score: attributes && attributes.bl_score && attributes.bl_score > 0 ? attributes.bl_score : false,
                mentionsCount:
                  relationships && relationships.mentions && relationships.mentions.meta
                    ? relationships.mentions.meta.count
                    : 0,
                exploitsCount: attributes.exploits && attributes.exploits.length ? attributes.exploits.length : 0,
                platformsCount: attributes.platforms && attributes.platforms.length ? attributes.platforms.length : 0,
                platformsNames: this.processPlatforms(attributes.platforms),
                description: `${(attributes.description || '').substring(0, 120)}${
                  attributes.description && attributes.description.length > 120 ? '...' : ''
                }`,
                msBulletinsCount:
                  attributes.microsoft_bulletins && attributes.microsoft_bulletins.length
                    ? attributes.microsoft_bulletins.length
                    : 0
              };
            });
            this.count = meta.pagination.count <= 10000 ? meta.pagination.count : 10000;
            this.totalResources = meta.pagination.count;
          }
        },
        (error) => {
          if (error.status === 500) {
            this.listError = 'There was a problem with the search request.';
          } else if (error.status === 400) {
            this.listError = this.searchText
              ? 'Incorrect dork syntax. Please, check the Syntax help to guide you with this problem.'
              : 'There was a problem with the search request.';
          }
        }
      );
  }

  onOpenModalDorks(value: boolean) {
    this.openModalDorks = value;
  }

  private processSearchText(text: string): string {
    text = text.replace(/[\s|;,\n\r]+/g, ',');
    if (text) {
      const items = [
        ...new Set(
          text
            .split(',')
            .slice(0, 100)
            .filter((item) => !!item)
            .map((item) => item.trim().toLowerCase())
        )
      ];
      const dorkLikeItems = items.map((item) => `name:"${item}"`);
      return dorkLikeItems.join(' OR ');
    } else {
      return text;
    }
  }

  private getExportableData(items) {
    return items.map((item) => {
      return {
        SCORE: item.bl_score,
        CVSS: item.score,
        NAME: item.name,
        VENDORS: item.platformsNames.join(', '),
        EXPLOITS: item.exploitsCount,
        MALWARE: item.num_malware,
        MENTIONS: item.mentionsCount,
        'MS BULLETINS': item.msBulletinsCount,
        'PUBLICATION DATE': moment(item.published_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY')
      };
    });
  }
}
