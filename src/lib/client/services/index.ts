import notifications from '$stores/notification';
import type { Axios } from 'axios';

export default class Service {
  constructor(protected client: Axios) {}

  abort() {}

  openFile(data: any, status: number, type = 'application/vnd.ms-excel') {
    const blob = new Blob([data], {
      type
    });
    if (status === 200) {
      const dwldLink = document.createElement('a');
      const urlObject = URL.createObjectURL(blob);
      dwldLink.setAttribute('target', '_blank');
      dwldLink.setAttribute('href', urlObject);
      dwldLink.setAttribute('download', 'exportedExcel.xlsx');
      dwldLink.style.visibility = 'hidden';
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    } else {
      notifications.notify({
        title: 'Something went wrong while trying to export selected resources.'
      });
    }
  }
}
