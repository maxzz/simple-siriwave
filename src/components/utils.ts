import { IClassicCurveDefinition } from "./wave";

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
/*
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
*/
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
