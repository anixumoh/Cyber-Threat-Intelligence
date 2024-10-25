import { Injectable } from '@angular/core';

@Injectable()
export class SvelteService {
    setResolve;
    isReady = new Promise(resolve => {
        this.setResolve = resolve;
    })

    setSvelteReady() {
        this.setResolve();
    }

    sendEvent(type: string, detail?: any) {
        const e = new CustomEvent(type, { detail });
        document.dispatchEvent(e);
    }

    async safeSendEvent(type: string, detail?: any) {
        await this.isReady;
        this.sendEvent(type, detail);
    }
}
