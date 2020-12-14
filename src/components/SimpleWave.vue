<template>
    <canvas ref="canvas"></canvas>
</template>

<script>
    import { defineComponent, onMounted, ref } from 'vue';

    export default defineComponent({
        setup() {
            const canvas = ref(null);

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

<style>
    canvas {
        width: 200px;
        height: 200px;
        border: 1px solid red;
    }
</style>