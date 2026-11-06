<script setup lang="ts">
import type { BackgroundImage, DesignElement } from "~/utils/document";

defineProps<{
  elements: DesignElement[];
  selectedId: string | null;
  pageWidth: number;
  pageHeight: number;
  pageBackground: string;
  backgroundImage?: BackgroundImage;
}>();

const emit = defineEmits<{
  select: [id: string];
  elementPointerDown: [event: PointerEvent, element: DesignElement];
  elementPointerMove: [event: PointerEvent];
  elementPointerEnd: [event: PointerEvent];
  resizePointerDown: [event: PointerEvent, element: DesignElement];
}>();
</script>

<template>
  <section class="canvas-area" aria-label="Design canvas">
    <div class="canvas-heading">
      <div>
        <h2>Untitled design</h2>
        <p>{{ pageWidth }} × {{ pageHeight }} logical units</p>
      </div>
      <span>{{ elements.length }} elements</span>
    </div>
    <div class="canvas-scroller">
      <div
        class="design-page"
        :style="{ width: pageWidth + 'px', height: pageHeight + 'px', backgroundColor: pageBackground }"
        role="group"
        aria-label="Editable design page"
      >
        <img
          v-if="backgroundImage"
          class="page-background-image"
          :src="backgroundImage.data_url"
          :style="{ objectFit: backgroundImage.fit }"
          alt=""
          aria-hidden="true"
          draggable="false"
        />
        <button
          v-for="element in elements"
          :key="element.id"
          :data-element-id="element.id"
          class="design-element"
          :class="{ selected: selectedId === element.id, rectangle: element.type === 'rect', frame: element.type === 'frame', grid: element.type === 'grid' }"
          :style="{
            left: element.x + 'px',
            top: element.y + 'px',
            width: element.width + 'px',
            height: element.height + 'px',
            color: element.type === 'text' ? element.color : undefined,
            backgroundColor: element.type === 'rect' ? element.color : element.type === 'frame' ? (element.fillColor ?? 'transparent') : 'transparent',
            fontSize: element.type === 'text' ? element.fontSize + 'px' : undefined,
            border: element.type === 'frame' || element.type === 'grid' ? element.strokeWidth + 'px solid ' + element.strokeColor : undefined,
            backgroundImage: element.type === 'grid' ? 'linear-gradient(to bottom, ' + element.strokeColor + ' ' + element.strokeWidth + 'px, transparent ' + element.strokeWidth + 'px), linear-gradient(to right, ' + element.strokeColor + ' ' + element.strokeWidth + 'px, transparent ' + element.strokeWidth + 'px)' : undefined,
            backgroundSize: element.type === 'grid' ? '100% ' + (100 / element.rows) + '%, ' + (100 / element.columns) + '% 100%' : undefined,
          }"
          type="button"
          :aria-label="element.type === 'text' ? 'Select text element: ' + element.text.slice(0, 80) : element.type === 'rect' ? 'Select rectangle element' : element.type === 'frame' ? 'Select frame element' : 'Select grid element with ' + element.rows + ' rows and ' + element.columns + ' columns'"
          :aria-pressed="selectedId === element.id"
          @pointerdown="emit('elementPointerDown', $event, element)"
          @pointermove="emit('elementPointerMove', $event)"
          @pointerup="emit('elementPointerEnd', $event)"
          @pointercancel="emit('elementPointerEnd', $event)"
          @click="emit('select', element.id)"
        >
          <span v-if="element.type === 'text'">{{ element.text }}</span>
          <span v-if="selectedId === element.id" class="resize-handle" aria-hidden="true" @pointerdown="emit('resizePointerDown', $event, element)" />
        </button>
      </div>
    </div>
    <p class="canvas-note">Designs auto-save in this browser. Download JSON for a portable copy. JSON import and export use Rust/WASM validation when available, with a TypeScript fallback if the WASM runtime cannot initialize.</p>
  </section>
</template>

<style scoped>
.canvas-area { min-width: 0; border: 1px solid #e1e6ef; border-radius: 14px; background: white; padding: 18px; overflow: hidden; }
.canvas-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.canvas-heading h2 { margin: 0 0 4px; }
.canvas-heading p, .canvas-heading > span { margin: 0; color: #596780; font-size: 12px; }
.canvas-scroller { overflow: auto; padding: 10px 0 16px; background: #f3f5f9; border-radius: 10px; }
.design-page { position: relative; margin: 0 auto; overflow: hidden; background: white; box-shadow: 0 4px 20px #18274414; }
.page-background-image { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; user-select: none; }
.design-element { position: absolute; z-index: 1; display: flex; align-items: flex-start; justify-content: flex-start; padding: 2px; border: 1px solid transparent; border-radius: 2px; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.25; touch-action: none; cursor: grab; user-select: none; }
.design-element:active { cursor: grabbing; }
.design-element.selected { border: 1px dashed #234bd6; outline: 1px solid #234bd6; }
.resize-handle { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border: 2px solid white; border-radius: 2px; background: #234bd6; box-shadow: 0 0 0 1px #234bd6; cursor: nwse-resize; touch-action: none; }
.design-element.rectangle { border-radius: 0; }
.canvas-note { margin: 12px 0 0; color: #596780; font-size: 12px; line-height: 1.5; }
</style>
