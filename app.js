// Traditional narrowboat colours offered as swatches for every part of the boat.
// To add or change a colour, edit this list. Hex values must be lower case.
const PALETTE = [
  { name: 'Brunswick Green', hex: '#1f4d34' },
  { name: 'Mid Green',       hex: '#2f6b3f' },
  { name: 'Maroon',          hex: '#6e1d25' },
  { name: 'Signal Red',      hex: '#b3202a' },
  { name: 'Raspberry',       hex: '#e30b5d' },
  { name: 'Plum',            hex: '#4d2a4d' },
  { name: 'Navy Blue',       hex: '#1c2a44' },
  { name: 'Royal Blue',      hex: '#1f3f8f' },
  { name: 'Sky Blue',        hex: '#6a9ec4' },
  { name: 'Golden Yellow',   hex: '#d9a521' },
  { name: 'Orange',          hex: '#d8641e' },
  { name: 'Cream',           hex: '#e9d9a6' },
  { name: 'Off White',       hex: '#f4f1e8' },
  { name: 'Battleship Grey', hex: '#6f7375' },
  { name: 'Black',           hex: '#1c1c1c' }
];

// Preset schemes. Each one names a palette colour for every part of the boat.
// To add or change a scheme, edit this list. Colour names must match the PALETTE list above.
const PRESETS = [
  { name: 'Traditional Green',
    colours: { cabin: 'Brunswick Green', panels: 'Signal Red', coachline: 'Golden Yellow', roof: 'Signal Red', gunwale: 'Black', hull: 'Black' } },
  { name: 'Maroon and Cream',
    colours: { cabin: 'Maroon', panels: 'Cream', coachline: 'Golden Yellow', roof: 'Maroon', gunwale: 'Cream', hull: 'Black' } },
  { name: 'Royal Blue',
    colours: { cabin: 'Navy Blue', panels: 'Royal Blue', coachline: 'Off White', roof: 'Battleship Grey', gunwale: 'Navy Blue', hull: 'Black' } },
  { name: 'Plum and Gold',
    colours: { cabin: 'Plum', panels: 'Maroon', coachline: 'Golden Yellow', roof: 'Cream', gunwale: 'Plum', hull: 'Black' } },
  { name: 'Green and Cream',
    colours: { cabin: 'Cream', panels: 'Mid Green', coachline: 'Maroon', roof: 'Mid Green', gunwale: 'Mid Green', hull: 'Black' } },
  { name: 'Sky and Orange',
    colours: { cabin: 'Sky Blue', panels: 'Navy Blue', coachline: 'Orange', roof: 'Off White', gunwale: 'Navy Blue', hull: 'Black' } }
];

// Look up a palette colour's hex value from its name
function hexFor(colourName) {
  const colour = PALETTE.find(function (c) { return c.name === colourName; });
  if (!colour) console.error(`Preset colour "${colourName}" is not in the palette`);
  return colour ? colour.hex : '#000000';
}

// Find every colour picker on the page. Each picker holds the current colour for its part.
const pickers = document.querySelectorAll('input[type="color"][data-part]');

// Paint one part of the boat in the given colour
function paintPart(part, colour) {
  const shapes = document.querySelectorAll(`#boat [data-part="${part}"]`);
  shapes.forEach(function (shape) {
    // Use "stroke" for outlines such as the coachline, otherwise "fill"
    const property = shape.dataset.paint || 'fill';
    shape.setAttribute(property, colour);
  });
}

// Highlight the swatch that matches the picker's colour.
// If no swatch matches, the colour is a custom one, so highlight "Custom" instead.
function showSelected(picker) {
  const row = picker.closest('.control');
  let matched = false;
  row.querySelectorAll('.swatch').forEach(function (swatch) {
    const isMatch = swatch.dataset.hex === picker.value;
    swatch.setAttribute('aria-pressed', isMatch);
    if (isMatch) matched = true;
  });
  row.querySelector('.custom').classList.toggle('selected', !matched);
}

// Set a part to a colour: update its picker, the drawing and the highlight
function setColour(picker, colour) {
  picker.value = colour;
  paintPart(picker.dataset.part, picker.value);
  showSelected(picker);
  showSelectedPreset();
}

// Highlight a preset button if the boat currently matches that scheme exactly
function showSelectedPreset() {
  document.querySelectorAll('.preset').forEach(function (button) {
    const preset = PRESETS[button.dataset.index];
    const matches = Array.from(pickers).every(function (picker) {
      return hexFor(preset.colours[picker.dataset.part]) === picker.value;
    });
    button.setAttribute('aria-pressed', matches);
  });
}

// Add a button for each preset, with a small strip showing its main colours
const presetArea = document.querySelector('.presets');
PRESETS.forEach(function (preset, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'preset';
  button.dataset.index = index;

  const strip = document.createElement('span');
  strip.className = 'preset-strip';
  ['cabin', 'panels', 'coachline', 'gunwale'].forEach(function (part) {
    const chip = document.createElement('span');
    chip.style.background = hexFor(preset.colours[part]);
    strip.appendChild(chip);
  });
  button.appendChild(strip);
  button.appendChild(document.createTextNode(preset.name));

  button.addEventListener('click', function () {
    pickers.forEach(function (picker) {
      setColour(picker, hexFor(preset.colours[picker.dataset.part]));
    });
  });
  presetArea.appendChild(button);
});

pickers.forEach(function (picker) {
  // Add a swatch button for each palette colour
  const swatches = picker.closest('.control').querySelector('.swatches');
  PALETTE.forEach(function (colour) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'swatch';
    swatch.style.background = colour.hex;
    swatch.dataset.hex = colour.hex;
    swatch.title = colour.name;
    swatch.setAttribute('aria-label', `${picker.dataset.name}: ${colour.name}`);
    swatch.addEventListener('click', function () {
      setColour(picker, colour.hex);
    });
    swatches.appendChild(swatch);
  });

  // Apply the starting colour when the page loads
  setColour(picker, picker.value);

  // Repaint whenever the user picks a custom colour
  picker.addEventListener('input', function () {
    setColour(picker, picker.value);
  });
});

// Reset button: put every part back to its starting colour.
// defaultValue is the value written in the HTML, so the defaults only live in one place.
document.getElementById('reset').addEventListener('click', function () {
  pickers.forEach(function (picker) {
    setColour(picker, picker.defaultValue);
  });
});
