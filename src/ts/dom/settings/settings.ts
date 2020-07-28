import * as p5 from 'p5'; 

import { FollowingSettingsContainer, FollowingSettings } from './following-settings';
import { VisualSettingsContainer,    VisualSettings }    from './visual-settings';
import { SmoothingSettingsContainer, SmoothingSettings } from './smoothing-settings';
import { SplinesSettingsContainer,   SplinesSettings }   from './splines-settings';

export class Settings {

    private followingSettingsContainer : FollowingSettingsContainer;
    private visualSettingsContainer    : VisualSettingsContainer;
    private smoothingSettingsContainer : SmoothingSettingsContainer;
    private splinesSettingsContainer   : SplinesSettingsContainer;

    private lastFollowingSettings : FollowingSettings;
    private lastVisualSettings    : VisualSettings;
    private lastSmoothingSettings : SmoothingSettings;
    private lastSplinesSettings   : SplinesSettings;

    private changes: string[];

    constructor(sketch: p5) {
        this.followingSettingsContainer = new FollowingSettingsContainer(sketch);
        this.visualSettingsContainer    = new VisualSettingsContainer(sketch);
        this.smoothingSettingsContainer = new SmoothingSettingsContainer(sketch);
        this.splinesSettingsContainer   = new SplinesSettingsContainer(/*sketch*/);
    }

    calculateChanges(): void {
        this.changes = [];

        if(this.lastFollowingSettings != null) {
            this.addChanges(this.lastFollowingSettings, this.followingSettingsContainer.getSettings());
            this.addChanges(this.lastVisualSettings   , this.visualSettingsContainer.getSettings());
            this.addChanges(this.lastSmoothingSettings, this.smoothingSettingsContainer.getSettings());
            this.addChanges(this.lastSplinesSettings  , this.splinesSettingsContainer.getSettings());
        }

        this.lastFollowingSettings = this.followingSettingsContainer.getSettings();
        this.lastVisualSettings    = this.visualSettingsContainer.getSettings();
        this.lastSmoothingSettings = this.smoothingSettingsContainer.getSettings();
        this.lastSplinesSettings   = this.splinesSettingsContainer.getSettings();
    }

    private addChanges(original: Object, modified: Object) {
        Object.keys(original).forEach((key) => {
            if(!modified.hasOwnProperty(key)) {
                console.log("Mismatch in object keys when comparing!");
                console.log(Object.keys(original));
                console.log(Object.keys(modified));
            }
            else {
                if(Reflect.get(original, key) != Reflect.get(modified, key)) {
                    this.changes.push(key);
                }
            }
        });
    }

    getChanges(): Object {
        return this.changes;
    }

    getFollowingSettings(): FollowingSettings {
        return this.followingSettingsContainer.getSettings();
    }

    getVisualSettings(): VisualSettings {
        return this.visualSettingsContainer.getSettings();
    }

    getSmoothingSettings(): SmoothingSettings {
        return this.smoothingSettingsContainer.getSettings();
    }

    getSplinesSettings(): SplinesSettings {
        return this.splinesSettingsContainer.getSettings();
    }

    hideFollowingSettings(): void {
        this.followingSettingsContainer.hide();
    }

    hideVisualSettings(): void {
        this.visualSettingsContainer.hide();
    }

    hideSmoothingSettings(): void {
        this.smoothingSettingsContainer.hide();
    }

    hideSplinesSettings(): void {
        this.splinesSettingsContainer.hide();
    }

    showFollowingSettings(): void {
        this.followingSettingsContainer.show();
    }

    showVisualSettings(): void {
        this.visualSettingsContainer.show();
    }

    showSmoothingSettings(): void {
        this.smoothingSettingsContainer.show();
    }

    showSplinesSettings(): void {
        this.splinesSettingsContainer.show();
    }
}