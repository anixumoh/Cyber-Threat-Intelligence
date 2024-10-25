import type { parseSelectedForDetails, parseThreatResource } from '$lib/utils/parseData';

export type Resource = ReturnType<typeof parseThreatResource>;
export type ResourceDetail = ReturnType<typeof parseSelectedForDetails>;
