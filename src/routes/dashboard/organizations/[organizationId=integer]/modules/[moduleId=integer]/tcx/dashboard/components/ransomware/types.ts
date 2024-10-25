export interface TargetResponse {
    links: TargetLinks;
    data:  Target[];
    meta:  Meta;
}

export interface Target {
    type:          DatumType;
    id:            string;
    attributes:    Attributes;
    relationships: Relationships;
    links:         DatumLinks;
}

export interface Attributes {
    description:  string;
    created_at:   string;
    name:         string;
    display_name: string;
    category:     Category;
    updated_at:   string;
}

export enum Category {
    Countries = "countries",
    Organizations = "organizations",
    Regions = "regions",
    Sectors = "sectors",
    Specifics = "specifics",
}

export interface DatumLinks {
    self: string;
}

export interface Relationships {
    region:  RegionClass;
    country: RegionClass;
}

export interface RegionClass {
    data?:  Data;
    links?: CountryLinks;
}

export interface Data {
    type:       DataType;
    id:         string;
    name:       string;
    iso_code?:  string;
    countries?: CountryElement[];
}

export interface CountryElement {
    name:     string;
    iso_code: string;
}

export enum DataType {
    Country = "Country",
    Region = "Region",
}

export interface CountryLinks {
    related: string;
}

export enum DatumType {
    Target = "Target",
}

export interface TargetLinks {
    first: string;
    last:  string;
}

export interface Meta {
    pagination: Pagination;
}

export interface Pagination {
    count:  number;
    limit:  number;
    offset: number;
}
