<template>
    <canvas ref="canvas"></canvas>
</template>

<script lang="ts">
    import { defineComponent, onMounted, ref } from 'vue';

    export default defineComponent({
        setup() {
            const canvas = ref<HTMLCanvasElement>(null);

            function drawCurve() {

            }

            onMounted(() => {
                console.log({canvas});
            });

            return {
                canvas,
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
</style>