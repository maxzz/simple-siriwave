//#region old definitions

enum CurveStyle {
    "ios" = "ios",
    "ios9" = "ios9",
}

export type Options = {
    // The DOM container where the DOM canvas element will be added
    container: HTMLElement;
    // The style of the wave: `ios` or `ios9`
    style?: CurveStyle;
    //  Ratio of the display to use. Calculated by default.
    ratio?: number;
    // The speed of the animation.
    speed?: number;
    // The amplitude of the complete wave.
    amplitude?: number;
    // The frequency for the complete wave (how many waves). - Not available in iOS9 Style
    frequency?: number;
    // The color of the wave, in hexadecimal form (`#336699`, `#FF0`). - Not available in iOS9 Style
    color?: string;
    // The `canvas` covers the entire width or height of the container.
    cover?: boolean;
    // Width of the canvas. Calculated by default.
    width?: number;
    // Height of the canvas. Calculated by default.
    height?: number;
    // Decide wether start the animation on boot.
    autostart?: boolean;
    // Number of step (in pixels) used when drawed on canvas.
    pixelDepth?: number;
    // Lerp speed to interpolate properties.
    lerpSpeed?: number;
    // Curve definition override
    curveDefinition?: ICurveDefinition[];
};

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

//#endregion old definitions


function getDefinition(): IClassicCurveDefinition[] {
    return [
        {
            attenuation: -2,
            lineWidth: 1,
            opacity: 0.1,
        },
        {
            attenuation: -6,
            lineWidth: 1,
            opacity: 0.2,
        },
        {
            attenuation: 4,
            lineWidth: 1,
            opacity: 0.4,
        },
        {
            attenuation: 2,
            lineWidth: 1,
            opacity: 0.6,
        },
        {
            attenuation: 1,
            lineWidth: 1.5,
            opacity: 1,
        },
    ];
}

type Params = {
    ctrl: {
        color: string;
        heightMax: number;
        width: number;
        amplitude: number;
        phase: number;
        opt: {
            pixelDepth: number;
            frequency: number;
        }
    },
    definition: {
        opacity: number;
        lineWidth: number;
        attenuation: number;
    },

    GRAPH_X: number;
    AMPLITUDE_FACTOR: number;
    ATT_FACTOR: number;
};

let params: Params = {
    ctrl: {
        color: 'rgb(25, 127, 30)',
        // heightMax: number;
        // width: number;
        // amplitude: number;
        // phase: number;
        opt: {
            pixelDepth: 0.02,
            frequency: 6,
        }
    },
    // definition: {
    //     opacity: number;
    //     lineWidth: number;
    //     attenuation: number;
    // },

    GRAPH_X: 2,
    AMPLITUDE_FACTOR: 0.6,
    ATT_FACTOR: 4,
};

function globalAttFn(x: number, params: Params): number {
    return Math.pow(params.ATT_FACTOR / (params.ATT_FACTOR + Math.pow(x, params.ATT_FACTOR)), params.ATT_FACTOR);
}

function _xpos(i: number, params: Params): number {
    return params.ctrl.width * ((i + params.GRAPH_X) / (params.GRAPH_X * 2));
}

function _ypos(i: number, params: Params): number {
    return (
        params.AMPLITUDE_FACTOR * (
            globalAttFn(i, params) *
            (params.ctrl.heightMax * params.ctrl.amplitude) * (1 / params.definition.attenuation) *
            Math.sin(params.ctrl.opt.frequency! * i - params.ctrl.phase)
        )
    );
}

function draw(ctx: CanvasRenderingContext2D, params: Params): void {
    ctx.moveTo(0, 0);
    ctx.beginPath();

    const color = params.ctrl.color.replace(/rgb\(/g, "").replace(/\)/g, "");
    ctx.strokeStyle = `rgba(${color}, ${params.definition.opacity})`;
    ctx.lineWidth = params.definition.lineWidth;

    // Cycle the graph from -X to +X every PX_DEPTH and draw the line
    for (let i = -params.GRAPH_X; i <= params.GRAPH_X; i += params.ctrl.opt.pixelDepth!) {
        ctx.lineTo(_xpos(i, params), params.ctrl.heightMax + _ypos(i, params));
    }

    ctx.stroke();
}
