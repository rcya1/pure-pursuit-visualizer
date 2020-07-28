import { SettingsContainer } from './settings-container'
// import * as p5 from 'p5';

export interface SplinesSettings {
    
}

export class SplinesSettingsContainer extends SettingsContainer {

    // constructor(sketch: p5) {
    //     super(true);
    // }

    constructor() {
        super(true);
    }
    
    updateComponents(): void {

    }

    getSettings(): SplinesSettings {
        return {

        };
    }

    // setSettings(settings: SplinesSettings): void {
        
    // }
}