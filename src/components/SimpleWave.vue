<template>
    <canvas ref="canvas"></canvas>
    <div ref="siriHolder" class="siri-holder"></div>
    <input type="button" value="run" @click="onRunClick">
</template>

<script lang="ts">
    import { defineComponent, onMounted, ref } from 'vue';
    import SiriWave from './wave';

    export default defineComponent({
        setup() {
            const canvas = ref<HTMLCanvasElement>(null);

            function drawCurve() {

            }

            const siriHolder = ref<HTMLElement>(null);
            let siriWave = null;

            onMounted(() => {
                console.log({canvas});

                siriWave = new SiriWave({
                    container: siriHolder.value,
                    width: 340,
                    height: 200,
                    color: '#777',
                    autostart: false,
                });
            });

            function onRunClick() {
                if (siriWave) {
                    if (siriWave.run) {
                        siriWave.stop();
                    } else {
                        siriWave.start();
                    }
                }
            }

            return {
                canvas,
                siriHolder,
                onRunClick,
            };
        }
    });
</script>

<style lang="scss">
    canvas {
        width: 200px;
        height: 200px;
        border: 1px solid red;
    }
    .siri-holder {
        // width: 600px;
        // height: 300px;
        background-color: black;
        background-size: cover;
        margin: 20px;
        margin: 0 auto;
        border: 1px dashed rgba(255, 255, 255, 0.4);        
    }
</style>
