# Canal Boat Painter: Project Checkpoint

Last updated: 30 September 2026

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

## Deployment workflow

1. Edit the files locally.
2. Test by opening `index.html` in a browser.
3. Commit and push:
   ```
   git add .
   git commit -m "Describe the change"
   git push
   ```
4. GitHub Pages redeploys automatically, usually within a minute or two. Progress is visible in the repository's **Actions** tab.

## Technical approach

The app is static HTML, CSS and JavaScript, with no build tools, framework, server or database. The boat is drawn as an inline SVG.

| File | Role |
|---|---|
| `index.html` | Page layout, the SVG boat drawing, and the colour pickers |
| `style.css` | Appearance: palette, typography (Alegreya from Google Fonts), and a responsive layout |
| `app.js` | Connects the colour pickers to the drawing |

### How colouring works

- Every paintable SVG shape has a `data-part` attribute, for example `data-part="panels"`.
- Every colour picker (`<input type="color">`) has the matching `data-part` value.
- `app.js` recolours all shapes whose part matches the changed picker.
- By default the colour sets a shape's `fill`. Shapes marked `data-paint="stroke"` (such as the coachlines) have their outline recoloured instead.
- To add a new region: tag the shape in the SVG and add a matching picker. The JavaScript does not need to change.

## Current state (version 1.1, deployed)

The drawing is a side view of a trad-stern narrowboat, with the bow on the left. The SVG `viewBox` is `0 0 1000 250`.

### Paintable regions and default colours

| Region | Default colour | Notes |
|---|---|---|
| Cabin sides | `#e9d9a6` (cream) | x 200 to 880, y 64 to 143 |
| Panels | `#1f4d34` (green) | Three panels, each 180 x 60, at x 220, 440 and 660, y 74 |
| Coachline | `#6e1d25` (maroon) | A border on the outside edge of each panel, the same dimensions as the panel |
| Roof | `#6e1d25` (maroon) | Roof strip: x 192, y 52, 696 x 12 |
| Handrail | `#e9d9a6` (cream) | Above the roof: x 205, y 45, 670 x 7 |
| Gunwale | `#e4d39b` (pale cream) | From the top ledge (y 143) down to the upper rubbing strake (y 170), following the bow curve |
| Hull | `#1c1c1c` (black) | Vertical stern at x 950, waterline at about y 198 |

### Fixed-colour details

- **Rubbing strakes:** at y 170 and y 188, drawn as semi-transparent dark lines over the paintwork.
- **Portholes:** three, with brass rims and dark glass, at x 420, 640 and 860.
- **Chimney:** on the roof.
- **Tiller:** rises from the stern and points forward over the rear deck.
- **Water:** covers the hull below the waterline.

## Decisions made

- Version 1 is limited to the seven regions above. The following were considered and deferred: cants, bow and stern flashes, a separate top band on the cabin side, and window frames.
- Coachlines are drawn as panel borders, not inset lines.
- The gunwale colour extends down to the highest rubbing strake.
- The stern is vertical.
- The roof and handrail are separate regions with their own pickers. Simon made this change manually and committed it.
- The default scheme is cream cabin sides, green panels, maroon coachlines and roof, cream handrail, pale cream gunwale and black hull.
- The repository is public, which GitHub Pages on a free account requires.

## Roadmap

1. ~~Setup: accounts, tools, repository, first push~~ Done
2. ~~Basic prototype: SVG boat and colour pickers~~ Done
3. ~~Deployment to GitHub Pages~~ Done
4. **Usability features (next):** preset traditional schemes, a reset button, PNG export, and saving a scheme to a shareable link.
5. **Multiple designs:** split the drawing into modular parts, so users can swap bow and stern types (trad, semi-trad, cruiser) and change the boat's length.
6. **Later ideas:** custom panel layouts, signwriting or boat name text, and roses and castles motifs.

## Working approach

- Work in small steps, confirming each one before moving to the next.
- Keep required actions clearly separate from explanation.
- Use British English spelling, and avoid em dashes.
- Avoid adding new tools unless there is a clear need.
