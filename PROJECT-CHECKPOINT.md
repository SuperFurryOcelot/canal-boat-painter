# Canal Boat Painter: Project Checkpoint

Last updated: 2 October 2026

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
| `index.html` | Page layout, the SVG boat drawing, the colour controls and the default colours |
| `style.css` | Appearance: palette, typography (Alegreya from Google Fonts), and a responsive layout |
| `app.js` | The colour palette, the swatch buttons, the reset button, and painting the drawing |

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

## Current state (version 1.2, committed)

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
- **Water:** covers the hull below the waterline.

## Open items

- **Untracked files:** `boat.svg`, `tiller.svg` and the `Claude outputs` folder are in the local folder but not in Git. Decide whether to commit them, delete them, or list them in a `.gitignore` file.
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
- The repository is public, which GitHub Pages on a free account requires.

## Roadmap

1. ~~Setup: accounts, tools, repository, first push~~ Done
2. ~~Basic prototype: SVG boat and colour pickers~~ Done
3. ~~Deployment to GitHub Pages~~ Done
4. **Usability features (in progress):**
   - ~~Reset button~~ Done
   - ~~Traditional colour palette swatches~~ Done
   - Preset traditional schemes (next)
   - PNG export
   - Saving a scheme to a shareable link
5. **Multiple designs:** split the drawing into modular parts, so users can swap bow and stern types (trad, semi-trad, cruiser) and change the boat's length.
6. **Later ideas:** an optional handrail in a new style, custom panel layouts, signwriting or boat name text, and roses and castles motifs.

## Working approach

- Work in small steps, confirming each one before moving to the next.
- Keep required actions clearly separate from explanation.
- Use British English spelling, and avoid em dashes.
- Avoid adding new tools unless there is a clear need.
