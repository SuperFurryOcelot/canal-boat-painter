# Canal Boat Painter: Project Checkpoint

Last updated: 2 October 2026 (end of usability stage)

## Purpose

This is a learning project covering coding with Claude, deploying code through GitHub, and building a working prototype app.

The app is a simple web page that lets users try out paint schemes on a canal boat. It starts with a single side view of a narrowboat, and more boat designs (different bow and stern types) will be added later.

## Key links and locations

| Item | Value |
|---|---|
| Live site | https://superfurryocelot.github.io/canal-boat-painter/ |
| Repository | https://github.com/superfurryocelot/canal-boat-painter |
| GitHub username | superfurryocelot |
| Local folder | `Documents/canal-boat-painter` (Windows) |
| Default branch | `main` |
| Hosting | GitHub Pages, deploying from `main`, root folder |

## Tooling

- **Windows PC:** the development machine.
- **Git for Windows:** includes Git Bash, which is used for all Git commands. Sublime Text is set as Git's default editor.
- **Sublime Text:** the code editor. VS Code was deliberately not used, to keep the toolset small.
- **Browser:** for local testing, by opening `index.html` directly. No local server is needed.
- **Git credentials:** handled by Git Credential Manager, which uses a browser sign-in on the first push.
- **Claude Cowork:** used for development from 30 September 2026, working directly in the local folder.

## Deployment workflow

1. Edit the files locally.
2. Test by opening `index.html` in a browser.
3. Commit and push, adding the app files by name so that working files are not published:
   ```
   git add index.html app.js style.css
   git commit -m "Describe the change"
   git push
   ```
4. GitHub Pages redeploys automatically, usually within a minute or two. Progress is visible in the repository's **Actions** tab.

## Technical approach

The app is static HTML, CSS and JavaScript, with no build tools, framework, server, database or third-party libraries. The boat is drawn as an inline SVG.

| File | Role |
|---|---|
| `index.html` | Page layout, the SVG boat drawing, the collapsible Preset schemes and Colours sections, the action buttons, and the default colours |
| `style.css` | Appearance: palette, typography (Alegreya from Google Fonts), and a responsive layout |
| `app.js` | The colour palette and preset lists, the swatch and preset buttons, painting the drawing, and the Reset, Download picture and Copy link buttons |

### How colouring works

- Every paintable SVG shape has a `data-part` attribute, for example `data-part="panels"`.
- Each part has a row in the controls: its name, a row of palette swatches, and a "Custom" colour picker (`<input type="color">`) with the matching `data-part` value.
- The Custom picker holds the part's current colour. Its `value` in the HTML is the part's default colour, which is the only place defaults are set.
- `app.js` builds the swatch buttons from the `PALETTE` list. Clicking a swatch, or choosing a custom colour, updates the picker and recolours all shapes with that part.
- The chosen swatch has a ring around it. If the colour is not in the palette, the ring goes on the Custom picker instead.
- By default the colour sets a shape's `fill`. Shapes marked `data-paint="stroke"` (such as the coachlines) have their outline recoloured instead.
- The **Reset colours** button sets every picker back to its `defaultValue` (the value written in the HTML) and repaints. It does not ask for confirmation.
- To add a new region: tag the shape in the SVG and add a matching control row in the HTML. The JavaScript does not need to change.
- To add or change a palette colour: edit the `PALETTE` list at the top of `app.js`. Hex values must be lower case.

### Page layout

- Below the drawing are two collapsible sections, **Preset schemes** and **Colours**, both closed when the page loads. They use HTML's built-in `<details>` element, so no JavaScript is involved.
- Below those, always visible, are three buttons: **Reset colours**, **Download picture** and **Copy link**.

### Preset schemes

- The `PRESETS` list in `app.js` sits under the palette. Each preset names a palette colour (by name, not hex) for every part.
- If a preset names a colour that is not in the palette, an error appears in the browser console.
- Clicking a preset button sets every part at once. The button shows a small strip of the scheme's cabin, panel, coachline and gunwale colours.
- A preset's button stays highlighted while the boat matches that scheme exactly.

| Preset | Cabin | Panels | Coachline | Roof | Gunwale | Hull |
|---|---|---|---|---|---|---|
| Traditional Green | Brunswick Green | Signal Red | Golden Yellow | Signal Red | Black | Black |
| Maroon and Cream | Maroon | Cream | Golden Yellow | Maroon | Cream | Black |
| Royal Blue | Navy Blue | Royal Blue | Off White | Battleship Grey | Navy Blue | Black |
| Plum and Gold | Plum | Maroon | Golden Yellow | Cream | Plum | Black |
| Green and Cream | Cream | Mid Green | Maroon | Mid Green | Mid Green | Black |
| Sky and Orange | Sky Blue | Navy Blue | Orange | Off White | Navy Blue | Black |

### Download picture

- Saves the drawing as a PNG, 2000 x 500 pixels (twice the drawing's size).
- The SVG is copied with its current colours, drawn onto a canvas over a sky background, and saved. The sky colour is read from `--sky` in `style.css`.
- The file is named after the preset if the boat matches one (for example `canal-boat-royal-blue.png`), otherwise `canal-boat-scheme.png`.
- It uses only built-in browser features and works when `index.html` is opened directly from the folder.

### Shareable links

- The current colours are kept at the end of the web address (the "hash"), for example `#cabin=4d2a4d&panels=6e1d25&...`. The address updates on every change without reloading the page.
- Opening a link like that shows the same scheme. Invalid colours in a link are ignored, and those parts use their defaults.
- When every part is at its default, the address is left clean, with no hash.
- Pasting a different scheme link into an open page's address bar switches to that scheme.
- **Copy link** copies the address and shows "Link copied". If the browser blocks copying, it suggests copying from the address bar instead.
- Reset still returns to the HTML defaults, even on a page opened from a link.

### Palette

Fifteen traditional colours, offered for every part:

| Colour | Hex |
|---|---|
| Brunswick Green | `#1f4d34` |
| Mid Green | `#2f6b3f` |
| Maroon | `#6e1d25` |
| Signal Red | `#b3202a` |
| Raspberry | `#e30b5d` |
| Plum | `#4d2a4d` |
| Navy Blue | `#1c2a44` |
| Royal Blue | `#1f3f8f` |
| Sky Blue | `#6a9ec4` |
| Golden Yellow | `#d9a521` |
| Orange | `#d8641e` |
| Cream | `#e9d9a6` |
| Off White | `#f4f1e8` |
| Battleship Grey | `#6f7375` |
| Black | `#1c1c1c` |

The hex values are on-screen estimates and are not matched to any paint manufacturer's range.

## Current state (version 1.3, committed)

The drawing is a side view of a trad-stern narrowboat, with the bow on the left. The SVG `viewBox` is `0 0 1000 250`. The drawing was revised on 2 October 2026, and now carries `id` attributes and some `transform` and `style` attributes from that editing.

### Paintable regions and default colours

| Region | Default colour | Notes |
|---|---|---|
| Cabin sides | `#e9d9a6` (Cream) | x 200 to 880, y 64 to 143 |
| Panels | `#1f4d34` (Brunswick Green) | Three panels at y 74, height 60: two 180 wide at x 284 and 504, and a shorter one (about 142 wide) at about x 724 |
| Coachline | `#e30b5d` (Raspberry) | A border on the outside edge of each panel, the same dimensions as the panel |
| Roof | `#e30b5d` (Raspberry) | Roof strip: about x 198, y 52, 685 x 12 |
| Gunwale | `#e9d9a6` (Cream) | From the top ledge (y 143) down to the upper rubbing strake (y 170), following the bow curve |
| Hull | `#1c1c1c` (Black) | Vertical stern at x 950, waterline at about y 198 |

### Fixed-colour details

- **Rubbing strakes:** at y 170 and y 188, drawn as semi-transparent dark lines over the paintwork.
- **Portholes:** three, with brass rims and dark glass, now at about x 264, 484 and 704, one in front of each panel.
- **Chimney:** on the roof, at about x 559.
- **Tiller:** redrawn as a brass swan neck rising from the stern, with a small base block. Both shapes are tagged `data-part="tiller"`, but there is no tiller control, so the colour stays fixed.
- **Cabin shadow:** a soft gradient strip along the base of the cabin side (x 200, y 135, 680 x 8), clear at the top and darkening to 30% black at the bottom. It keeps the cabin side distinct from the gunwale when both are the same colour. The gradient is `cabin-shadow` in the SVG's `<defs>`; change `stop-opacity` to adjust its strength.
- **Water:** covers the hull below the waterline.

## Open items

- **Untracked files:** `boat.svg` and the `Claude outputs` folder are in the local folder but not in Git. Decide whether to commit them, delete them, or list them in a `.gitignore` file.
- **README.md:** Git shows it as changed, but only its line endings differ (Windows CRLF). It can be committed or restored with `git restore README.md`.
- **Phones:** on narrow screens the boat scrolls out of view while working through the lower control rows. Keeping the drawing pinned at the top is a possible tweak.

## Decisions made

- Version 1 is limited to the six regions above. The following were considered and deferred: cants, bow and stern flashes, a separate top band on the cabin side, and window frames.
- Coachlines are drawn as panel borders, not inset lines.
- The gunwale colour extends down to the highest rubbing strake.
- The stern is vertical.
- The handrail has been removed from the drawing and the controls. On many boats it is just a raised edge that would not be visible in this type of drawing. It may return later in a different style as an optional element.
- The default scheme is cream cabin sides, Brunswick green panels, raspberry coachlines and roof, cream gunwale and a black hull.
- Browsers' built-in colour pickers vary widely, and some offer only a few unsuitable colours. Rather than rely on them or add a third-party picker library, the app has its own swatches of traditional colours. The built-in picker is kept as the "Custom" option.
- The palette was drafted by Claude and approved by Simon, with Raspberry added at Simon's request. Deep Cream was later removed, and the gunwale default changed to Cream.
- Default colours live only in the HTML. The reset button reads them from there, so there is no duplicate list.
- Presets refer to palette colours by name, for readability. Traditional Green's roof was changed to Signal Red at Simon's request.
- The Preset schemes and Colours sections are collapsible and start closed, to keep the page clean.
- The downloaded picture is twice the drawing's size so that it stays sharp.
- Shareable links use the web address hash rather than any server or database, so the site stays static.
- A fixed shadow at the base of the cabin side was added so the cabin and gunwale stay distinct when they share a colour.
- When Claude checks the repository, it uses `GIT_OPTIONAL_LOCKS=0 git status` so that no `.git/index.lock` file is left behind.
- The repository is public, which GitHub Pages on a free account requires.

## Roadmap

1. ~~Setup: accounts, tools, repository, first push~~ Done
2. ~~Basic prototype: SVG boat and colour pickers~~ Done
3. ~~Deployment to GitHub Pages~~ Done
4. ~~**Usability features:** reset button, traditional colour palette swatches, preset schemes with collapsible sections, PNG download, shareable links, and a cabin shadow~~ Done
5. **Multiple designs (next):** split the drawing into modular parts, so users can swap bow and stern types (trad, semi-trad, cruiser) and change the boat's length.
6. **Later ideas:** an optional handrail in a new style, custom panel layouts, signwriting or boat name text, and roses and castles motifs.

## Working approach

- Work in small steps, confirming each one before moving to the next.
- Keep required actions clearly separate from explanation.
- Use British English spelling, and avoid em dashes.
- Avoid adding new tools unless there is a clear need.
