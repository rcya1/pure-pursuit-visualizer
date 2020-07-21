export interface Component {
    hide(): void;
    show(): void;
}

export abstract class SettingsContainer {

    private components: Component[];

    constructor(visible: boolean) {
        this.components = [];

        if(visible) {
            this.show();
        }
        else {
            this.hide();
        }
    }

    register(component: Component): void {
        this.components.push(component);
    }

    abstract updateComponents(): void;

    show(): void {
        this.components.forEach(component => {
            component.show();
        });
    }

    hide(): void {
        this.components.forEach(component => {
            component.hide();
        });
    }
}