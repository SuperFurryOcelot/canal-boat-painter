// boat.js draws the boat from a boat specification.
// The specification says what kind of boat it is; the layout code works out where
// everything goes; and the drawing is assembled from generated shapes (the parts that
// stretch with length) and drawn pieces (copied from the hidden #pieces block in index.html).

// ---------------------------------------------------------------------------
// The boat specification
// ---------------------------------------------------------------------------

// The boat shown when the page loads.
//   length:  in feet
//   bow:     a key of BOWS
//   stern:   a key of STERNS
//   pramCover: true to show a pram cover (semi-trad and cruiser sterns only)
//   panels:  'single', 'split' or 'none'
//   windows: window types from bow to stern, spread evenly along the window area
//   roof:    roof features; "at" is how far along the cabin, from 0 (front) to 1 (rear)
const DEFAULT_BOAT = {
  length: 55,
  bow: 'standard',
  stern: 'trad',
  pramCover: false,
  panels: 'split',
  windows: ['porthole', 'porthole', 'porthole'],
  roof: [{ type: 'chimney', at: 0.54 }]
};

// Lengths offered in the length control, in feet
const LENGTHS = [30, 35, 40, 45, 50, 55, 57, 60, 65, 70];

// ---------------------------------------------------------------------------
// Sizes. Drawing units are the same as in the original 55 ft drawing horizontally.
// Heights are true to scale, based on Sunflower: about 3 ft of cabin side above
// the gunwale, and about 2 ft from the gunwale top down to the waterline.
// ---------------------------------------------------------------------------

const UNITS_PER_FOOT = 920 / 55;   // the original drawing is 55 ft over 920 units
const MAX_LENGTH = 70;             // the picture is wide enough for the longest boat
const VIEW_WIDTH = 1240;
const VIEW_TOP = 40;               // the picture shows from y 40 down to y 240
const VIEW_HEIGHT = 200;

const CABIN_TOP = 113;
const CABIN_BOTTOM = 165;          // also the top of the gunwale
const GUNWALE_BOTTOM = 180;        // the upper rubbing strake
const LOWER_STRAKE = 190;
const HULL_TOP = 172;
const HULL_BOTTOM = 205;
const WATERLINE = 198;
const ROOF_TOP = 104;

const PANEL_INSET = 20;            // gap between the cabin ends and the panels
const PANEL_GAP = 20;              // gap between the two panels in the split style
const PANEL_TOP = 118;
const PANEL_HEIGHT = 41;
const REAR_PANEL_MAX = 6 * UNITS_PER_FOOT;  // the rear panel is at most 6 ft long
const WINDOW_CENTRE_Y = 138.5;

// Window types.
//   piece: the drawn piece in index.html
//   width: overall width in drawing units, including the frame
//   code:  the letter used for this type in shareable links
//   name:  the name shown in the window type control
const WINDOW_TYPES = {
  porthole: { piece: 'window-porthole', width: 26, code: 'p', name: 'Porthole' },
  hopper:   { piece: 'window-hopper',   width: 52, code: 'h', name: 'Hopper' }
};
const WINDOW_GAP = 12;             // the smallest gap allowed between windows

// Bow types. Distances are in drawing units, measured back from the bow tip.
//   anchorX:       where the bow tip is in the drawn piece
//   straightStart: where the drawn bow ends and the straight hull and gunwale begin
//   cabinStart:    where the cabin begins
//   strakeStarts:  where the upper and lower rubbing strakes begin
const BOWS = {
  standard: { piece: 'bow-standard', anchorX: 30, straightStart: 100, cabinStart: 170, strakeStarts: [22, 44] }
};

// Stern types. Distances are in drawing units, measured forward from the stern end.
//   anchorX:   where the stern end is in the drawn piece
//   cabinEnd:  where the roofed cabin ends (the rear hatch sits at the rear of the roof)
//   wallsEnd:  semi-trad only: where the open-topped cabin side walls end
//   pramCover: the drawn pram cover piece, for sterns that can have one
const STERNS = {
  trad:     { piece: 'stern-trad',     anchorX: 950, cabinEnd: 70 },
  semitrad: { piece: 'stern-semitrad', anchorX: 950, cabinEnd: 176, wallsEnd: 48, pramCover: 'pram-semitrad' },
  cruiser:  { piece: 'stern-cruiser',  anchorX: 950, cabinEnd: 134, pramCover: 'pram-cruiser' }
};

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

// Make an SVG element with the given attributes and add it to a parent
function addShape(parent, tag, attributes) {
  const shape = document.createElementNS(SVG_NS, tag);
  Object.keys(attributes).forEach(function (name) {
    shape.setAttribute(name, attributes[name]);
  });
  parent.appendChild(shape);
  return shape;
}

// Copy a drawn piece (or one layer of it) into the drawing, moved by (dx, dy)
function addPiece(parent, pieceId, layer, dx, dy) {
  const piece = document.getElementById(pieceId);
  if (!piece) {
    console.error(`Drawn piece "${pieceId}" is missing from index.html`);
    return;
  }
  const source = layer ? piece.querySelector(`[data-layer="${layer}"]`) : piece;
  if (!source) return;  // this piece has nothing in that layer
  const group = addShape(parent, 'g', { transform: `translate(${dx} ${dy})` });
  Array.from(source.childNodes).forEach(function (child) {
    group.appendChild(child.cloneNode(true));
  });
}

// ---------------------------------------------------------------------------
// Layout: work out where everything goes, in drawing units
// ---------------------------------------------------------------------------

function layOut(boat) {
  const bow = BOWS[boat.bow];
  const stern = STERNS[boat.stern];
  const boatLength = boat.length * UNITS_PER_FOOT;

  // Centre the boat in the picture
  const bowX = (VIEW_WIDTH - boatLength) / 2;
  const sternX = bowX + boatLength;
  const cabinFront = bowX + bow.cabinStart;
  const cabinRear = sternX - stern.cabinEnd;

  // Panels, from front to rear
  const panelFront = cabinFront + PANEL_INSET;
  const panelRear = cabinRear - PANEL_INSET;
  let panels = [];
  if (boat.panels === 'single') {
    panels = [{ x: panelFront, width: panelRear - panelFront }];
  } else if (boat.panels === 'split') {
    const rearWidth = Math.min(REAR_PANEL_MAX, (panelRear - panelFront) * 0.3);
    const rearX = panelRear - rearWidth;
    panels = [
      { x: panelFront, width: rearX - PANEL_GAP - panelFront },
      { x: rearX, width: rearWidth }
    ];
  }

  // Windows go in the front (or only) panel, or along the cabin if there are no panels.
  // They are spread evenly: each window sits in the middle of an equal share of the area.
  const windowArea = panels.length ? panels[0] : { x: panelFront, width: panelRear - panelFront };
  const spacing = windowArea.width / boat.windows.length;
  const windows = boat.windows.map(function (type, i) {
    return { type: type, x: windowArea.x + spacing * (i + 0.5) };
  });

  // Roof features
  const roofFeatures = boat.roof.map(function (feature) {
    return { type: feature.type, x: cabinFront + feature.at * (cabinRear - cabinFront) };
  });

  return {
    bow: bow, stern: stern, bowX: bowX, sternX: sternX,
    cabinFront: cabinFront, cabinRear: cabinRear,
    panels: panels, windowArea: windowArea, windows: windows, roofFeatures: roofFeatures
  };
}

// The most windows of one type that fit on a boat without crowding
function maxWindows(boat, type) {
  const area = layOut(boat).windowArea;
  return Math.max(1, Math.floor(area.width / (WINDOW_TYPES[type].width + WINDOW_GAP)));
}

// ---------------------------------------------------------------------------
// Drawing: build the SVG from the layout. Shapes are added from back to front.
// ---------------------------------------------------------------------------

function drawBoat(boat) {
  const svg = document.getElementById('boat');
  const drawing = document.getElementById('boat-drawing');
  const plan = layOut(boat);
  const bowShift = plan.bowX - plan.bow.anchorX;
  const sternShift = plan.sternX - plan.stern.anchorX;
  const straightStart = plan.bowX + plan.bow.straightStart;
  const cabinWidth = plan.cabinRear - plan.cabinFront;

  svg.setAttribute('viewBox', `0 ${VIEW_TOP} ${VIEW_WIDTH} ${VIEW_HEIGHT}`);
  drawing.replaceChildren();

  // Straight hull
  addShape(drawing, 'rect', { 'data-part': 'hull', x: straightStart, y: HULL_TOP,
    width: plan.sternX - straightStart, height: HULL_BOTTOM - HULL_TOP });

  // Bow and stern: hull and gunwale shapes
  addPiece(drawing, plan.bow.piece, 'base', bowShift, 0);
  addPiece(drawing, plan.stern.piece, 'base', sternShift, 0);

  // Straight gunwale, from the top ledge down to the upper rubbing strake
  addShape(drawing, 'rect', { 'data-part': 'gunwale', x: straightStart, y: CABIN_BOTTOM,
    width: plan.sternX - straightStart, height: GUNWALE_BOTTOM - CABIN_BOTTOM });

  // Rubbing strakes: darker lines that follow whatever colour is beneath them
  const upperStart = plan.bowX + plan.bow.strakeStarts[0];
  const lowerStart = plan.bowX + plan.bow.strakeStarts[1];
  addShape(drawing, 'path', {
    d: `M${upperStart} ${GUNWALE_BOTTOM} L${plan.sternX} ${GUNWALE_BOTTOM} M${lowerStart} ${LOWER_STRAKE} L${plan.sternX} ${LOWER_STRAKE}`,
    stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 3, fill: 'none' });

  // Roof, slightly overhanging the cabin at each end
  addShape(drawing, 'rect', { 'data-part': 'roof', x: plan.cabinFront - 2.3, y: ROOF_TOP,
    width: cabinWidth + 5, height: CABIN_TOP - ROOF_TOP, rx: 3 });

  // Roof features, such as the chimney
  plan.roofFeatures.forEach(function (feature) {
    addPiece(drawing, 'roof-' + feature.type, null, feature.x, ROOF_TOP);
  });

  // Rear hatch, sliding cover closed at the rear of the roof
  addPiece(drawing, 'roof-hatch', null, plan.cabinRear + 2.5, ROOF_TOP);

  // Cabin side. On a semi-trad it carries on past the roof as open-topped walls.
  const sideRear = plan.stern.wallsEnd !== undefined ? plan.sternX - plan.stern.wallsEnd : plan.cabinRear;
  addShape(drawing, 'rect', { 'data-part': 'cabin', x: plan.cabinFront, y: CABIN_TOP,
    width: sideRear - plan.cabinFront, height: CABIN_BOTTOM - CABIN_TOP });

  // Semi-trad: a capping strip in the roof colour along the top of the open walls
  if (sideRear > plan.cabinRear) {
    addShape(drawing, 'rect', { 'data-part': 'roof', x: plan.cabinRear + 2.5, y: CABIN_TOP - 3,
      width: sideRear - plan.cabinRear - 2.5, height: 3 });
  }

  // Cabin shadow (fixed): keeps the cabin side distinct from the gunwale
  addShape(drawing, 'rect', { x: plan.cabinFront, y: CABIN_BOTTOM - 6,
    width: sideRear - plan.cabinFront, height: 6, fill: 'url(#cabin-shadow)' });

  // Panels, then coachlines around their outside edge
  plan.panels.forEach(function (panel) {
    addShape(drawing, 'rect', { 'data-part': 'panels', x: panel.x, y: PANEL_TOP,
      width: panel.width, height: PANEL_HEIGHT, rx: 6 });
  });
  plan.panels.forEach(function (panel) {
    addShape(drawing, 'rect', { 'data-part': 'coachline', 'data-paint': 'stroke',
      x: panel.x, y: PANEL_TOP, width: panel.width, height: PANEL_HEIGHT, rx: 6,
      fill: 'none', 'stroke-width': 2.5 });
  });

  // Windows
  plan.windows.forEach(function (item) {
    addPiece(drawing, WINDOW_TYPES[item.type].piece, null, item.x, WINDOW_CENTRE_Y);
  });

  // Bow and stern: details drawn on top, such as the tiller
  addPiece(drawing, plan.bow.piece, 'top', bowShift, 0);
  addPiece(drawing, plan.stern.piece, 'top', sternShift, 0);
  addPiece(drawing, 'stern-tiller', null, sternShift, 0);

  // Pram cover, if chosen and this stern can have one
  if (boat.pramCover && plan.stern.pramCover) {
    addPiece(drawing, plan.stern.pramCover, null, sternShift, 0);
  }

  // Water, drawn last so it covers the hull below the waterline
  addShape(drawing, 'rect', { x: 0, y: WATERLINE, width: VIEW_WIDTH, height: VIEW_TOP + VIEW_HEIGHT - WATERLINE,
    fill: '#5f7f7a', opacity: 0.9 });
}

drawBoat(DEFAULT_BOAT);
