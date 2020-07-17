export abstract class SettingsContainer {

    visible: boolean;

    constructor(visible: boolean) {
        this.visible = visible;
    }

    abstract updateComponents(): void;
}