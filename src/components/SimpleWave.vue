<template>
    <div ref="siriHolder" class="siri-holder"></div>
    <div>
        <input type="button" value="run" @click="onRunClick">
    </div>
</template>

<script lang="ts">
    import { defineComponent, onMounted, ref } from 'vue';
    import SiriWave from './curve/curve';

    export default defineComponent({
        setup() {
            const siriHolder = ref<HTMLElement>(null);
            let siriWave = null;

            onMounted(() => {
                siriWave = new SiriWave({
                    container: siriHolder.value,
                    width: 340,
                    height: 120,
                    color: '#777',
                    cover: true,
                    autostart: false,
                });

                siriWave.start();
                siriWave.stop();
            });

            function onRunClick() {
                if (siriWave.run) {
                    siriWave.stop();
                } else {
                    siriWave.start();
                }
            }

            return {
                siriHolder,
                onRunClick,
            };
        }
    });
</script>

<style lang="scss">
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
