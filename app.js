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
// The hatch matches the roof in every preset.
// To add or change a scheme, edit this list. Colour names must match the PALETTE list above.
const PRESETS = [
  { name: 'Traditional Green',
    colours: { cabin: 'Brunswick Green', panels: 'Signal Red', coachline: 'Golden Yellow', roof: 'Signal Red', gunwale: 'Black', hull: 'Black',
                hatch: 'Signal Red', pramcover: 'Brunswick Green' } },
  { name: 'Maroon and Cream',
    colours: { cabin: 'Maroon', panels: 'Cream', coachline: 'Golden Yellow', roof: 'Maroon', gunwale: 'Cream', hull: 'Black',
                hatch: 'Maroon', pramcover: 'Maroon' } },
  { name: 'Royal Blue',
    colours: { cabin: 'Navy Blue', panels: 'Royal Blue', coachline: 'Off White', roof: 'Battleship Grey', gunwale: 'Navy Blue', hull: 'Black',
                hatch: 'Battleship Grey', pramcover: 'Navy Blue' } },
  { name: 'Plum and Gold',
    colours: { cabin: 'Plum', panels: 'Maroon', coachline: 'Golden Yellow', roof: 'Cream', gunwale: 'Plum', hull: 'Black',
                hatch: 'Cream', pramcover: 'Plum' } },
  { name: 'Green and Cream',
    colours: { cabin: 'Cream', panels: 'Mid Green', coachline: 'Maroon', roof: 'Mid Green', gunwale: 'Mid Green', hull: 'Black',
                hatch: 'Mid Green', pramcover: 'Mid Green' } },
  { name: 'Sky and Orange',
    colours: { cabin: 'Sky Blue', panels: 'Navy Blue', coachline: 'Orange', roof: 'Off White', gunwale: 'Navy Blue', hull: 'Black',
                hatch: 'Off White', pramcover: 'Navy Blue' } }
];

// Look up a palette colour's hex value from its name
function hexFor(colourName) {
  const colour = PALETTE.find(function (c) { return c.name === colourName; });
  if (!colour) console.error(`Preset colour "${colourName}" is not in the palette`);
  return colour ? colour.hex : '#000000';
}

// The boat currently shown: a copy of DEFAULT_BOAT from boat.js, changed by the Boat controls
const currentBoat = Object.assign({}, DEFAULT_BOAT);

// Windows are written in links as one letter per window, from bow to stern (see WINDOW_TYPES).
function windowCodes(windows) {
  return windows.map(function (type) { return WINDOW_TYPES[type].code; }).join('');
}
function windowsFromCodes(codes) {
  const types = Object.keys(WINDOW_TYPES);
  const windows = codes.split('').map(function (code) {
    return types.find(function (type) { return WINDOW_TYPES[type].code === code; });
  });
  return windows.length && windows.every(Boolean) ? windows : null;
}

// Read the boat options from the web address. Anything that isn't valid uses the default.
function readLinkBoat() {
  const params = new URLSearchParams(location.hash.slice(1));
  const length = Number(params.get('length'));
  return {
    length: LENGTHS.includes(length) ? length : DEFAULT_BOAT.length,
    windows: windowsFromCodes(params.get('windows') || '') || DEFAULT_BOAT.windows.slice()
  };
}

// If there are more windows than fit, drop windows from the rear until they do
function fitWindows(boat) {
  const widest = boat.windows.reduce(function (a, b) {
    return WINDOW_TYPES[a].width >= WINDOW_TYPES[b].width ? a : b;
  });
  boat.windows = boat.windows.slice(0, maxWindows(boat, widest));
}

// If the page was opened with a link that includes boat options, draw that boat
Object.assign(currentBoat, readLinkBoat());
fitWindows(currentBoat);
drawBoat(currentBoat);

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
  updateLink();
}

// Shareable links: the boat options and colours are kept in the end of the web address
// (the "hash"), for example #length=57&cabin=e9d9a6&panels=1f4d34. Opening a link like
// that shows the same boat and scheme.

// Read colours from the web address. Anything that isn't a valid colour is ignored.
function readLinkColours() {
  const colours = {};
  new URLSearchParams(location.hash.slice(1)).forEach(function (value, part) {
    if (/^[0-9a-f]{6}$/i.test(value)) colours[part] = '#' + value.toLowerCase();
  });
  return colours;
}

// Write the current boat options and colours into the web address, without reloading the page.
// Only settings that differ from the defaults are included, so a default boat has a clean address.
function updateLink() {
  const settings = [];
  if (currentBoat.length !== DEFAULT_BOAT.length) settings.push('length=' + currentBoat.length);
  if (windowCodes(currentBoat.windows) !== windowCodes(DEFAULT_BOAT.windows)) {
    settings.push('windows=' + windowCodes(currentBoat.windows));
  }
  pickers.forEach(function (picker) {
    if (picker.value !== picker.defaultValue) settings.push(picker.dataset.part + '=' + picker.value.slice(1));
  });
  const hash = settings.length ? '#' + settings.join('&') : '';
  try {
    history.replaceState(null, '', location.pathname + location.search + hash);
  } catch (error) {
    // Some browsers block this for files opened from your computer. The live site is unaffected.
  }
}

// Colours from the link the page was opened with (empty if there were none)
const linkColours = readLinkColours();

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

  // Apply the starting colour when the page loads: from the link if it has one, otherwise the default
  setColour(picker, linkColours[picker.dataset.part] || picker.value);

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

// Download button: save the drawing as a PNG picture.
// The SVG is copied, drawn onto a canvas at twice its normal size, and saved from there.
document.getElementById('download').addEventListener('click', function () {
  const svg = document.getElementById('boat');
  const scale = 2;
  const width = svg.viewBox.baseVal.width * scale;
  const height = svg.viewBox.baseVal.height * scale;

  // Copy the drawing with its current colours and give it a fixed size
  const copy = svg.cloneNode(true);
  copy.setAttribute('width', width);
  copy.setAttribute('height', height);
  const svgText = new XMLSerializer().serializeToString(copy);

  const image = new Image();
  image.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Fill in the sky first, using the same colour as the page (the --sky setting in style.css)
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--sky').trim();
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    // Name the file after the preset if the boat matches one, otherwise use a general name
    const activePreset = document.querySelector('.preset[aria-pressed="true"]');
    const label = activePreset ? PRESETS[activePreset.dataset.index].name : 'scheme';
    const fileName = 'canal-boat-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';

    // Save the picture by clicking a temporary download link
    canvas.toBlob(function (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    }, 'image/png');
  };
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
});

// If a different scheme link is pasted into the address bar of an open page, show that scheme
window.addEventListener('hashchange', function () {
  Object.assign(currentBoat, readLinkBoat());
  fitWindows(currentBoat);
  showBoatOptions();
  drawBoat(currentBoat);
  const colours = readLinkColours();
  pickers.forEach(function (picker) {
    setColour(picker, colours[picker.dataset.part] || picker.defaultValue);
  });
});

// Copy link button: copy the web address, which always holds the current colours
const shareStatus = document.getElementById('share-status');
document.getElementById('share').addEventListener('click', function () {
  navigator.clipboard.writeText(location.href).then(function () {
    shareStatus.textContent = 'Link copied';
  }).catch(function () {
    shareStatus.textContent = 'Could not copy. You can copy the link from the address bar instead.';
  });
  setTimeout(function () { shareStatus.textContent = ''; }, 4000);
});

// Boat controls: redraw the boat, then repaint it in the current colours
function redrawBoat() {
  drawBoat(currentBoat);
  pickers.forEach(function (picker) {
    paintPart(picker.dataset.part, picker.value);
  });
  updateLink();
}

// Length: one choice for each length in the LENGTHS list
const lengthControl = document.getElementById('length');
LENGTHS.forEach(function (length) {
  const option = document.createElement('option');
  option.value = length;
  option.textContent = length + ' ft';
  lengthControl.appendChild(option);
});
lengthControl.addEventListener('change', function () {
  currentBoat.length = Number(lengthControl.value);
  changeWindows(windowTypeControl.value, Number(windowCountControl.value));
});

// Window type: one choice for each type in WINDOW_TYPES
const windowTypeControl = document.getElementById('window-type');
Object.keys(WINDOW_TYPES).forEach(function (type) {
  const option = document.createElement('option');
  option.value = type;
  option.textContent = WINDOW_TYPES[type].name;
  windowTypeControl.appendChild(option);
});
windowTypeControl.addEventListener('change', function () {
  changeWindows(windowTypeControl.value, Number(windowCountControl.value));
});

// Number of windows: from 1 up to as many as fit on this boat
const windowCountControl = document.getElementById('window-count');
windowCountControl.addEventListener('change', function () {
  changeWindows(windowTypeControl.value, Number(windowCountControl.value));
});

// Set the windows to a number of one type (reduced if they don't all fit), then redraw
function changeWindows(type, count) {
  currentBoat.windows = Array(Math.min(count, maxWindows(currentBoat, type))).fill(type);
  showBoatOptions();
  redrawBoat();
}

// Make the Boat controls show the current boat
function showBoatOptions() {
  lengthControl.value = currentBoat.length;
  const type = currentBoat.windows[0];
  windowTypeControl.value = type;
  windowCountControl.replaceChildren();
  for (let count = 1; count <= maxWindows(currentBoat, type); count++) {
    const option = document.createElement('option');
    option.value = count;
    option.textContent = count;
    windowCountControl.appendChild(option);
  }
  windowCountControl.value = currentBoat.windows.length;
}
showBoatOptions();
