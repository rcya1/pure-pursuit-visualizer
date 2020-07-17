import { SettingsContainer } from './settings-container'
import * as p5 from 'p5';
import { Slider } from '../dom-elements';
import { PurePursuitFollower } from '../../robot/pure-pursuit'

export interface FollowingSettings {
    maxVelocity: number;
    maxAcceleration: number;
    lookahead: number;
    turningConstant: number;
}

export class FollowingSettingsContainer extends SettingsContainer {

    private maxVelocitySlider: Slider;
    private maxAccelerationSlider: Slider;
    private lookaheadSlider: Slider;
    private turningConstantSlider: Slider;

    constructor(sketch: p5, recalculateVelocitiesFunction: () => void, follower: PurePursuitFollower) {
        super(true);
        
        this.maxVelocitySlider = new Slider('#max-velocity-slider', 10, 100, 50, 1, sketch);
        this.maxVelocitySlider.setCallback(function() {
            recalculateVelocitiesFunction();
        });
        this.maxAccelerationSlider = new Slider('#max-acceleration-slider', 10, 100, 75, 1, sketch);
        this.maxAccelerationSlider.setCallback((function() {
            follower.maxAcceleration = this.maxAccelerationSlider.getValue();
        }).bind(this));
        this.lookaheadSlider = new Slider('#lookahead-slider', 5, 40, 15, 1, sketch);
        this.lookaheadSlider.setCallback((function() {
            follower.lookaheadDist = this.lookaheadSlider.getValue();
        }).bind(this));
        this.turningConstantSlider = new Slider('#turning-constant-slider', 0.5, 2.0, 1.5, 0.1, sketch);
        this.turningConstantSlider.setCallback(function() {
            recalculateVelocitiesFunction();
        });
    }
    
    updateComponents(): void {

    }

    getSettings(): FollowingSettings {
        return {
            maxVelocity: this.getMaxVelocity(),
            maxAcceleration: this.getMaxAcceleration(),
            lookahead: this.getLookahead(),
            turningConstant: this.getTurningConstant()
        };
    }

    setSettings(settings: FollowingSettings): void {
        this.setMaxVelocity(settings.maxVelocity);
        this.setMaxVelocity(settings.maxVelocity);
        this.setMaxVelocity(settings.maxVelocity);
        this.setMaxVelocity(settings.maxVelocity);
    }

    getMaxVelocity(): number {
        return this.maxVelocitySlider.getValue();
    }

    getMaxAcceleration(): number {
        return this.maxAccelerationSlider.getValue();
    }

    getLookahead(): number {
        return this.lookaheadSlider.getValue();
    }

    getTurningConstant(): number {
        return this.turningConstantSlider.getValue();
    }

    setMaxVelocity(maxVelocity: number): void {
        this.maxVelocitySlider.setValue(maxVelocity);
    }

    setMaxAcceleration(maxAcceleration: number): void {
        this.maxAccelerationSlider.setValue(maxAcceleration);
    }

    setLookahead(lookahead: number): void {
        this.lookaheadSlider.setValue(lookahead);
    }

    setTurningConstant(turningConstant: number): void {
        this.turningConstantSlider.setValue(turningConstant);
    }
}