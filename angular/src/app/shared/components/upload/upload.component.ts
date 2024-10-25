import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UploadHistory } from './UploadHistory';

@Component({
	selector: 'app-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
	file;
	files = [];
	maximized = false;
	openReport = false;
	list;
	isUploading;
	filesPending;
	filesErrors;
	filesUploaded;
	timeRemaining;

	@Input()
	set history(data: UploadHistory[]) {
		this.list = data || [];
		this.filesPending = 0;
		this.filesUploaded = 0;
		this.filesErrors = 0;
		let timeRemaining = 0;
		for (let item of this.list) {
			if (item.inProgress) {
				this.filesPending++;
				timeRemaining += item.inProgress;
			} else if (item.error) {
				this.filesErrors++;
			} else {
				this.filesUploaded++;
			}
		}
		this.isUploading = this.filesPending > 0;
		this.timeRemaining = timeRemaining >= 9999999 ? 'Calculating...' : this.getRemainingTime(timeRemaining);
	}

	@Output() upload = new EventEmitter();
	@Output() removeHistory = new EventEmitter();

	add() {
		const { files } = this;
		if (files) {
			this.openReport = true;
			const filesToEmit = files.map(file => {
				const id = this.getFieldId(file);
				return new UploadHistory(id, file);
			});
			this.emit(filesToEmit);
		}
	}

	getRemainingTime(seconds) {
		let remaining = seconds;
		if (remaining >= 86400) {
			remaining = remaining / 86400;
			return `${remaining.toFixed(0)} days remaining`;
		}
		if (remaining > 3600) {
			remaining = remaining / 3600;
			return `${remaining.toFixed(0)} hours remaining`;
		}
		if (remaining > 60) {
			remaining = remaining / 60;
			return `${remaining.toFixed(0)} minutes remaining`;
		}
		return `${remaining} seconds remaining`;
	}

	emit(data: UploadHistory[]) {
		this.upload.emit(data);
	}

	remove(data: UploadHistory) {
		this.removeHistory.emit([data]);
	}

	closeReport() {
		this.openReport = false;
		setTimeout(() => (this.maximized = false), 700);
	}

	onFileInputChange(event) {
		const { files } = event.target;
		this.file = files[0];
		this.files = [...files];
	}

	getFilesNames() {
		return this.files.map(file => file.name).join(', ');
	}

	getFieldId(file) {
		return `${file.name}:${file.lastModified}:${file.size}`;
	}
}
