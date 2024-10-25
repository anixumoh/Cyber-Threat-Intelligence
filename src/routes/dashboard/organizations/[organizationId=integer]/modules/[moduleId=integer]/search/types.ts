export type DarkWebSearch = {
  docs: DarkWebSearchItem[];
  numFound: number;
  start: number;
  took: number;
  parsed_query: string;
  rank: [number, string, number][];
};

export type DarkWebSearchItem = {
  _version_: string;
  content: string;
  hl: string;
  mime: string;
  site_readable: string;
  size: number;
  title: string;
  text_size: number;
  updated_at: string;
  url: string;
  url_hash: string;
  tags: string[];
  counts: string;
  last_update_timestamp: string;
};
