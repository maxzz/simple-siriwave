//#region definitions

import { Curve_ios8, getDefaultCurves as getDefaultCurves_ios8 } from "./icurve-ios8";
import { Curve_ios9, getDefaultCurves as getDefaultCurves_ios9 } from "./icurve-ios9";

enum CurveStyle {
    "ios" = "ios", // as classic curve view i.e. before ios9
    "ios9" = "ios9",
}

export type Options = {
    container: HTMLElement;                 // The DOM container where the DOM canvas element will be added
    style?: CurveStyle;                     // The style of the wave: `ios` or `ios9`
    ratio?: number;                         //  Ratio of the display to use. Calculated by default.
    speed?: number;                         // The speed of the animation.
    amplitude?: number;                     // The amplitude of the complete wave.
    frequency?: number;                     // The frequency for the complete wave (how many waves). - Not available in iOS9 Style
    color?: string;                         // The color of the wave, in hexadecimal form (`#336699`, `#FF0`). - Not available in iOS9 Style
    cover?: boolean;                        // The `canvas` covers the entire width or height of the container.
    width?: number;                         // Width of the canvas. Calculated by default.
    height?: number;                        // Height of the canvas. Calculated by default.
    autostart?: boolean;                    // Decide wether start the animation on boot.
    pixelDepth?: number;                    // Number of step (in pixels) used when drawed on canvas.
    lerpSpeed?: number;                     // Lerp speed to interpolate properties.
    curveDefinition?: ICurveDefinition[]    // Curve definition override
};

export type OptionsEnv = {
    frequency?: number;                     // The frequency for the complete wave (how many waves). - Not available in iOS9 Style
    pixelDepth?: number;                    // Number of step (in pixels) used when drawed on canvas.
}

export type IiOS9CurveDefinition = {
    supportLine?: boolean;
    color: string;
};

export type IClassicCurveDefinition = {
    attenuation: number;
    lineWidth: number;
    opacity: number;
};

export type ICurveDefinition = IiOS9CurveDefinition | IClassicCurveDefinition;

//#endregion definitions

export interface ICurve {
    draw: () => void;
}

export default class SiriWave {

    /**/
    private opt: Options;
    public optEnv: OptionsEnv;      // These options are exposed to workers.

    public phase: number = 0;       // Phase of the wave (passed to Math.sin function)
    public run: boolean = false;    // Boolean value indicating the the animation is running
    private curves: ICurve[] = [];  // Curves objects to animate

    public speed: number;           // Actual speed of the animation. Is not safe to change this value directly, use `setSpeed` instead.
    public amplitude: number;       // Actual amplitude of the animation. Is not safe to change this value directly, use `setAmplitude` instead.
    public width: number;           // Width of the canvas multiplied by pixel ratio
    private height: number;         // Height of the canvas multiplied by pixel ratio
    public heightMax: number;       // Maximum height for a single wave
    public color: string;           // Color of the wave (used in Classic iOS)
    private interpolation: {        // An object containing controller variables that need to be interpolated to an another value before to be actually changed
        speed: number | null;
        amplitude: number | null;
    };

    private canvas: HTMLCanvasElement;      // Canvas DOM Element where curves will be drawn
    public ctx: CanvasRenderingContext2D;   //2D Context from Canvas

    private animationFrameId: number | undefined;
    private timeoutId: ReturnType<typeof setTimeout> | undefined;
    /**/


    constructor({ container, ...rest }: Options) {
        const csStyle = window.getComputedStyle(container);

        this.opt = {
            container,
            style: CurveStyle.ios,
            ratio: window.devicePixelRatio || 1,
            speed: 0.2,
            amplitude: 1,
            frequency: 6,
            color: "#fff",
            cover: false,
            width: parseInt(csStyle.width.replace("px", ""), 10),
            height: parseInt(csStyle.height.replace("px", ""), 10),
            autostart: true,
            pixelDepth: 0.02,
            lerpSpeed: 0.1,
            ...rest,
        };

        this.optEnv = {
            frequency: this.opt.frequency,
            pixelDepth: this.opt.pixelDepth,
        };

        this.speed = Number(this.opt.speed);
        this.amplitude = Number(this.opt.amplitude);
        this.width = Number(this.opt.ratio! * this.opt.width!);
        this.height = Number(this.opt.ratio! * this.opt.height!);
        this.heightMax = Number(this.height / 2) - 6;
        this.color = `rgb(${hex2rgb(this.opt.color!)})`;

        this.interpolation = {
            speed: this.speed,
            amplitude: this.amplitude,
        };

        this.canvas = document.createElement("canvas");

        const ctx = this.canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Unable to create 2D Context");
        }
        this.ctx = ctx;

        this._resize(this.width, this.height);

        // Instantiate all curves based on the style
        switch (this.opt.style) {
            case CurveStyle.ios9: {
                const defs = this.opt.curveDefinition  as IiOS9CurveDefinition[] || getDefaultCurves_ios9();
                this.curves = defs.map(def => new Curve_ios9(this, def));
                break;
            }
            case CurveStyle.ios:
            default: {
                const defs = this.opt.curveDefinition as IClassicCurveDefinition[] || getDefaultCurves_ios8();
                this.curves = defs.map(def => new Curve_ios8(this, def));
            }
        }

        // Attach to the container
        this.opt.container.appendChild(this.canvas);

        // Start the animation
        if (this.opt.autostart) {
            this.start();
        }
    }

    private _resize(width: number, height: number) {
        // yak:
        // this.width = width;
        // this.height = height;
        // this.heightMax = Number(this.height / 2) - 6;

        // this.width = Number(this.opt.ratio! * width);
        // this.height = Number(this.opt.ratio! * height);

        // Set dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // By covering, we ensure the canvas is in the same size of the parent
        if (this.opt.cover === true) {
            this.canvas.style.width = this.canvas.style.height = "100%";
        } else {
            this.canvas.style.width = `${this.width / this.opt.ratio!}px`;
            this.canvas.style.height = `${this.height / this.opt.ratio!}px`;
        }
    }

    /**
     * Interpolate a property to the value found in this.interpolation
     */
    private lerp(propName: "amplitude" | "speed"): number | null {
        const prop = this.interpolation[propName];
        if (prop !== null) {
            this[propName] = intLerp(this[propName], prop, this.opt.lerpSpeed!);
            if (this[propName] - prop === 0) {
                this.interpolation[propName] = null;
            }
        }
        return this[propName];
    }

    /**
     * Clear the canvas
     */
    private _clear() {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
    }

    /**
     * Draw all curves
     */
    private _draw() {
        this.curves.forEach((curve) => curve.draw());
    }

    /**
     * Clear the space, interpolate values, calculate new steps and draws
     */
    private startDrawCycle() {
        this._clear();

        // Interpolate values
        this.lerp("amplitude");
        this.lerp("speed");

        this._draw();
        this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);

        if (window.requestAnimationFrame) {
            this.animationFrameId = window.requestAnimationFrame(this.startDrawCycle.bind(this));
        } else {
            this.timeoutId = setTimeout(this.startDrawCycle.bind(this), 20);
        }
    }

    /* API */

    /**
     * Start the animation
     */
    public start() {
        this.phase = 0;

        // Ensure we don't re-launch the draw cycle
        if (!this.run) {
            this.run = true;
            this.startDrawCycle();
        }
    }

    /**
     * Stop the animation
     */
    public stop() {
        this.phase = 0;
        this.run = false;

        // Clear old draw cycle on stop
        this.animationFrameId && window.cancelAnimationFrame(this.animationFrameId);
        this.timeoutId && clearTimeout(this.timeoutId);
    }

    /**
     * Set a new value for a property (interpolated)
     */
    public set(propName: "amplitude" | "speed", value: number) {
        this.interpolation[propName] = value;
    }

    /**
     * Set a new value for the speed property (interpolated)
     */
    public setSpeed(value: number) {
        this.set("speed", value);
    }

    /**
     * Set a new value for the amplitude property (interpolated)
     */
    public setAmplitude(value: number) {
        this.set("amplitude", value);
    }
}

/**
 * Convert an HEX color to RGB
 */
function hex2rgb(hex: string): string | null {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16).toString()}, ${parseInt(result[2], 16).toString()}, ${parseInt(result[3], 16).toString()}` : null;
}

function intLerp(v0: number, v1: number, t: number): number {
    return v0 * (1 - t) + v1 * t;
}
