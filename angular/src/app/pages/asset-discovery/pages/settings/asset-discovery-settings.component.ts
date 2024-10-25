import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { AssetDiscoveryService } from '../../asset-discovery.service';
import { AddSettingsType, DeleteSettingsType } from '../../types';

@Component({
  selector: 'asset-discovery-settings',
  templateUrl: './asset-discovery-settings.component.html',
  styleUrls: ['./asset-discovery-settings.component.scss']
})
export class AssetDiscoverySettingsComponent implements OnInit {
  items;
  activeOrganization;
  discoveryLink;
  loading = true;
  settingTypes;
  allowedSettings = ['domain', 'ip'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private discoveryService: AssetDiscoveryService,
    private toastrService: ToastrService
  ) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentModule && context.currentOrganization) {
        this.activeOrganization = context.currentOrganization;
        this.discoveryLink = `dashboard/organizations/${this.activeOrganization.id}/asset-discovery/discovery`;
      }
    });
  }

  ngOnInit() {
    this.settingTypes = [
      {
        type: 1,
        name: 'domain'
      },
      {
        type: 2,
        name: 'ip'
      },
      {
        type: 3,
        name: 'email'
      }
    ];
    this.getConfigurations();
  }

  goToDiscovery() {
    this.router.navigate([this.discoveryLink]);
  }

  getConfigurations() {
    // Get configured domains and IPs
    this.discoveryService
      .getSettings(this.activeOrganization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.items = {
          domain: res.filter((x) => x.type.toLowerCase() === 'domain'),
          ip: res.filter((x) => x.type.toLowerCase() === 'ip')
        };
        this.loading = false;
      });
  }

  getSettingTypeIndex(typeName: string) {
    const typeIndex = this.settingTypes.findIndex((type: any) => type.name === typeName);
    return this.settingTypes[typeIndex].type;
  }
  addSettings({ values, type }: AddSettingsType) {
    const obj = {
      values,
      status: -1,
      date: null,
      type: this.getSettingTypeIndex(type)
    };
    this.discoveryService
      .addSetting(obj, this.activeOrganization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.getConfigurations();
        },
        () => {
          this.toastrService.error('Could not add settings', 'Error');
        }
      );
  }

  deleteSettings({ items, type }: DeleteSettingsType) {
    const settingsType = this.getSettingTypeIndex(type);
    this.discoveryService
      .deleteSetting(items, this.activeOrganization.id, settingsType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getConfigurations();
      });
  }
}
