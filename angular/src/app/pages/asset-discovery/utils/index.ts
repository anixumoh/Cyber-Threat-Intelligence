export const domainTooltip = {
  finished: 'Loaded',
  ongoing: 'Loading',
  pending: 'Queued'
};

export function getStatus(key: number, finished: number[], ongoing: number[], pending: number[]) {
  const isFinished = finished.includes(key);
  const isOngoing = ongoing.includes(key);
  const isPending = pending.includes(key);

  if (isFinished) return 'finished';
  if (isOngoing) return 'ongoing';
  if (isPending) return 'pending';
}
