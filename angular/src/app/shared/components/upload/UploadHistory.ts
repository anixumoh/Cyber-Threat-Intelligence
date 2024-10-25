export class UploadHistory {
  constructor(public id: string, public file, public inProgress = 0, public error?, public timeRemaining?) {}
}
