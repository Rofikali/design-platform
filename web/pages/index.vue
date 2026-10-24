<script setup lang="ts">
type TextElement = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
};

type RectElement = {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type DesignElement = TextElement | RectElement;

const pageWidth = 800;
const pageHeight = 600;
const nextId = ref(3);
const selectedId = ref<string | null>("heading-1");
const elements = ref<DesignElement[]>([
  {
    id: "heading-1",
    type: "text",
    text: "Your design starts here",
    x: 48,
    y: 56,
    width: 500,
    height: 70,
    fontSize: 32,
    color: "#172033",
  },
  {
    id: "rect-2",
    type: "rect",
    x: 48,
    y: 160,
    width: 250,
    height: 110,
    color: "#dbeafe",
  },
]);

const selectedElement = computed(
  () => elements.value.find((element) => element.id === selectedId.value) ?? null,
);

function addText() {
  const id = `text-${nextId.value++}`;
  elements.value.push({
    id,
    type: "text",
    text: "New text",
    x: 80,
    y: 100 + elements.value.length * 18,
    width: 240,
    height: 48,
    fontSize: 24,
    color: "#172033",
  });
  selectedId.value = id;
}

function addRectangle() {
  const id = `rect-${nextId.value++}`;
  elements.value.push({
    id,
    type: "rect",
    x: 100 + elements.value.length * 12,
    y: 220 + elements.value.length * 12,
    width: 180,
    height: 90,
    color: "#dbeafe",
  });
  selectedId.value = id;
}

function moveSelected(dx: number, dy: number) {
  const element = selectedElement.value;
  if (!element) return;
  element.x = Math.max(0, Math.min(pageWidth - element.width, element.x + dx));
  element.y = Math.max(0, Math.min(pageHeight - element.height, element.y + dy));
}
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">DESIGN PLATFORM · EARLY PROTOTYPE</p>
        <h1>Make a design</h1>
      </div>
      <span class="status">Local-only prototype</span>
    </header>

    <section class="workspace">
      <aside class="panel tools-panel" aria-label="Design tools">
        <h2>Elements</h2>
        <button class="primary" type="button" @click="addText">＋ Add text</button>
        <button type="button" @click="addRectangle">＋ Add rectangle</button>
        <p class="hint">Select an element on the page to edit it.</p>
        <hr />
        <h2>Selection</h2>
        <template v-if="selectedElement">
          <p class="selected-name">{{ selectedElement.type === "text" ? "Text element" : "Rectangle" }}</p>
          <label v-if="selectedElement.type === 'text'" class="field">
            Text
            <textarea v-model="selectedElement.text" rows="4" maxlength="10000" />
          </label>
          <label class="field">
            Color
            <input v-model="selectedElement.color" type="color" />
          </label>
          <label v-if="selectedElement.type === 'text'" class="field">
            Font size
            <input v-model.number="selectedElement.fontSize" type="number" min="1" max="512" />
          </label>
          <p class="field-label">Move selected element</p>
          <div class="move-grid" aria-label="Move selected element">
            <span></span><button type="button" aria-label="Move up" @click="moveSelected(0, -10)">↑</button><span></span>
            <button type="button" aria-label="Move left" @click="moveSelected(-10, 0)">←</button>
            <button type="button" aria-label="Move down" @click="moveSelected(0, 10)">↓</button>
            <button type="button" aria-label="Move right" @click="moveSelected(10, 0)">→</button>
          </div>
        </template>
        <p v-else class="hint">Nothing selected.</p>
      </aside>

      <section class="canvas-area" aria-label="Design canvas">
        <div class="canvas-heading">
          <div>
            <h2>Untitled design</h2>
            <p>800 × 600 logical pixels</p>
          </div>
          <span>{{ elements.length }} elements</span>
        </div>
        <div class="canvas-scroller">
          <div
            class="design-page"
            :style="{ width: pageWidth + 'px', height: pageHeight + 'px' }"
            aria-label="Editable design page"
          >
            <button
              v-for="element in elements"
              :key="element.id"
              class="design-element"
              :class="{ selected: selectedId === element.id, rectangle: element.type === 'rect' }"
              :style="{
                left: element.x + 'px',
                top: element.y + 'px',
                width: element.width + 'px',
                height: element.height + 'px',
                color: element.type === 'text' ? element.color : undefined,
                backgroundColor: element.type === 'rect' ? element.color : 'transparent',
                fontSize: element.type === 'text' ? element.fontSize + 'px' : undefined,
              }"
              type="button"
              :aria-label="'Select ' + element.type + ' element'"
              :aria-pressed="selectedId === element.id"
              @click="selectedId = element.id"
            >
              <span v-if="element.type === 'text'">{{ element.text }}</span>
            </button>
          </div>
        </div>
        <p class="canvas-note">Prototype note: changes live in this browser session only. Saving, reopening, dragging, undo/redo and export are not implemented yet.</p>
      </section>
    </section>
  </main>
</template>

<style>
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f3f5f9; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input, textarea { font: inherit; }
button { cursor: pointer; }
.app-shell { min-height: 100vh; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 28px; background: white; border-bottom: 1px solid #e2e7ef; }
.eyebrow { margin: 0 0 6px; color: #596780; font-size: 11px; font-weight: 750; letter-spacing: .12em; }
h1 { margin: 0; font-size: 24px; }
.status { padding: 7px 10px; border-radius: 999px; background: #fff4d6; color: #805b00; font-size: 12px; font-weight: 650; }
.workspace { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 20px; padding: 20px; }
.panel, .canvas-area { min-width: 0; border: 1px solid #e1e6ef; border-radius: 14px; background: white; }
.tools-panel { padding: 18px; align-self: start; }
.tools-panel > button { display: block; width: 100%; margin: 8px 0; padding: 10px 12px; border: 1px solid #d7deea; border-radius: 8px; background: white; text-align: left; color: #172033; }
.tools-panel > button.primary { border-color: #234bd6; background: #234bd6; color: white; }
.hint { color: #6c778b; font-size: 12px; line-height: 1.5; }
hr { margin: 20px 0; border: 0; border-top: 1px solid #e6eaf1; }
.selected-name { color: #52617a; font-size: 12px; }
.field { display: grid; gap: 6px; margin: 14px 0; color: #52617a; font-size: 12px; font-weight: 650; }
.field textarea, .field input:not([type="color"]) { width: 100%; padding: 9px; border: 1px solid #d7deea; border-radius: 7px; color: #172033; }
.field textarea { resize: vertical; }
.field input[type="color"] { width: 100%; height: 38px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
.field-label { margin: 16px 0 8px; color: #52617a; font-size: 12px; font-weight: 650; }
.move-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.move-grid button { min-height: 34px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
.canvas-area { padding: 18px; overflow: hidden; }
.canvas-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.canvas-heading h2 { margin: 0 0 4px; }
.canvas-heading p, .canvas-heading > span { margin: 0; color: #6c778b; font-size: 12px; }
.canvas-scroller { overflow: auto; padding: 10px 0 16px; background: #f3f5f9; border-radius: 10px; }
.design-page { position: relative; margin: 0 auto; overflow: hidden; background: white; box-shadow: 0 4px 20px #18274414; }
.design-element { position: absolute; display: flex; align-items: flex-start; justify-content: flex-start; padding: 2px; border: 1px solid transparent; border-radius: 2px; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.25; }
.design-element.selected { border: 1px dashed #234bd6; outline: 1px solid #234bd6; }
.design-element.rectangle { border-radius: 0; }
.canvas-note { margin: 12px 0 0; color: #6c778b; font-size: 12px; line-height: 1.5; }
@media (max-width: 760px) { .topbar { padding: 18px; } .workspace { grid-template-columns: 1fr; padding: 12px; gap: 12px; } .tools-panel { order: 2; } .canvas-area { order: 1; padding: 12px; } }
</style>
