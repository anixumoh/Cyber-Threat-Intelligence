import { Subject } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TargetListRoles } from '../targets-list/targets-table.component';
import { ActorsService } from '../../../core/models/actors.service';
import { CountriesService } from '../../../core/models/countries.service';

enum tabs {
  map = 1,
  organizations = 2,
  sectors = 3,
  specifics = 4,
}

enum TargetTypes {
  Region,
  Country,
  Actor,
}

@Component({
  selector: 'app-actors-target-tab',
  templateUrl: './actors-target-tab.component.html',
  styleUrls: ['./actors-target-tab.component.scss'],
})
export class ActorsTargetTabComponent implements OnInit, OnDestroy {
  @Input() actor;
  @Input() actorId;
  @Output() change = new EventEmitter();
  items: any[] = [];
  loading = false;
  searchText = '';
  page = 0;
  count = 0;
  limit = 300;
  roles = TargetListRoles;
  organizationsData = [];
  regionsData = [];
  countriesData = [];
  sectorsData = [];
  specificsData = [];
  totalItems = 0;
  allData = [];
  mapData: any[] = [];
  tabs = tabs;
  activeTab: tabs = tabs.map;
  legend = {};
  private regionColor = '#ecb5ac';
  private countryColor = '#b73632';
  private countryActorColor = '#60453f';
  private regionActorColor = '#795548';
  private actorColor = '#333333';
  private actorCountryId;
  private readonly destroy$ = new Subject<void>();

  constructor(private actorsService: ActorsService, private countriesService: CountriesService) {
    this.legend = {
      width: 235,
      backgroundAlpha: 0.5,
      backgroundColor: '#FFFFFF',
      borderColor: '#c3c3c3',
      borderAlpha: 0.9,
      bottom: 15,
      left: 15,
      horizontalGap: 10,
      markerType: 'circle',
      maxColumns: 1,
      data: [
        { title: 'Threat Actor country', color: this.actorColor },
        { title: 'Threat Actor country & Targeted country', color: this.countryActorColor },
        { title: 'Targeted country', color: this.countryColor },
        { title: 'Targeted region', color: this.regionColor },
      ],
    };
  }

  ngOnInit() {
    if (this.actor) {
      this.actorCountryId = (((this.actor.relationships || {}).country || {}).data || {}).id;
      if (this.actorCountryId) {
        this.getActorCountryForMap(this.actorCountryId);
      }
    }

    this.init();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private init() {
    this.more(0);
  }

  private more(page, limit = 100) {
    setTimeout(() => {
      this.change.emit({ isLoading: true });
    });
    this.actorsService
      .targetsList({
        limit,
        page,
        actorId: this.actorId,
        searchValue: this.searchText,
        searchField: 'name',
      })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => {
          this.change.emit({ isLoading: false });
        })
      )
      .subscribe(({ data, meta }: any) => {
        if (data) {
          const items = data.map(({ id, attributes, relationships }) => ({
            id,
            relationships,
            ...attributes,
          }));
          this.items = this.items.concat(items);
          this.count = meta.pagination.count;
          if (this.count > (page + 1) * limit) {
            this.processDataChange({ data: this.items, count: this.count });
            this.more(page + 1);
          } else {
            this.processDataChange({ data: this.items, count: this.count });
          }
        }
      });
  }

  private processDataChange({ data, count }) {
    if (data) {
      this.totalItems = count;
      this.organizationsData = this.filterData(data, 'organizations', 'category');
      this.sectorsData = this.filterData(data, 'sectors', 'category');
      this.countriesData = this.filterData(data, 'countries', 'category');
      this.regionsData = this.filterData(data, 'regions', 'category');
      this.specificsData = this.filterData(data, 'specifics', 'category');
      this.allData = data;
      this.processContries(this.countriesData);
      this.getRegionsForMap(this.regionsData);
    }
  }

  private filterData(data, filter, key) {
    const output = [];
    for (const item of data) {
      if (item.hasOwnProperty(key)) {
        if (item[key] === filter) {
          output.push(item);
        }
      }
    }
    return output;
  }

  private processContries(targetsCountries: any[]) {
    const countries = targetsCountries
      .filter((item) => ((item.relationships || {}).country || {}).data)
      .map((item) => ((item.relationships || {}).country || {}).data);
    this.getCountriesForMap(countries);
  }

  private getCountriesForMap(targetsCountries) {
    for (const target of targetsCountries) {
      const country_data = target;
      const color = this.actorCountryId === target.id ? this.countryActorColor : this.countryColor;
      const countryName = country_data.name || 'Target Country';
      this.buildMapData(country_data, color, countryName, TargetTypes.Country);
    }
  }

  private getRegionsForMap(regions) {
    for (const region of regions) {
      const color = this.actorCountryId === region.id ? this.regionActorColor : this.regionColor;
      const regionName = region.name || 'Target Region';
      const countriesRelations = region.relationships.region;
      if (countriesRelations.data && countriesRelations.data.countries) {
        const countries = countriesRelations.data.countries;
        for (const country of countries) {
          this.buildMapData(country, color, regionName, TargetTypes.Region);
        }
      }
    }
  }

  private getActorCountryForMap(actorCountryId) {
    this.countriesService
      .findOneById(actorCountryId)
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((country: any) => {
        const country_data = country.data.attributes;
        this.buildMapData(country_data, this.actorColor, `${country_data.name}`, TargetTypes.Actor);
      });
  }

  private buildMapData(item, color, groupId, type) {
    const newCountry = {
      color,
      title: groupId,
      id: item['iso_code'],
      groupId,
      rollOverColor: `${color}d0`,
      types: { [type]: true },
    };
    const exists = this.mapData.find((mapItem) => mapItem.id === newCountry.id);
    if (exists) {
      if (type !== TargetTypes.Region) {
        exists.title = groupId;
        exists.groupId = groupId;
      }
      exists.types[type] = true;
      const auxColor = this.getColor(exists.types);
      exists.color = auxColor ? auxColor : newCountry.color;
      exists.rollOverColor = auxColor ? `${auxColor}d0` : newCountry.color;
    } else {
      this.mapData = [...this.mapData, newCountry];
    }
  }

  private getColor(types) {
    const hasRegion = types[TargetTypes.Region];
    const hasCountry = types[TargetTypes.Country];
    const hasActor = types[TargetTypes.Actor];
    if (hasCountry) {
      if (hasActor) {
        return this.countryActorColor;
      }
      return this.countryColor;
    } else if (hasRegion) {
      if (hasActor) {
        return this.actorColor;
      }
      return this.regionColor;
    } else if (hasActor) {
      return this.actorColor;
    }
  }
}
