

function showPaneForObject(obj) {


    const pane = new Pane({
      expanded: true,
      container: document.querySelector(".viewerContainer")
    });

    console.log(pane)
    window.pane = pane

    // Helper: auto-add inputs based on value type
    for (const key in obj) {
          const value = obj[key];
          let options = {};

          if (typeof value === 'number') {
            options = { min: 0, max: typeof value === 'boolean' ? 1 : 100 };
          }

        try{

        pane.addBinding(obj, key, options);

        } catch(e) {
            console.log(key,'not working');
        }
    }

    // Watch for changes
    pane.on('change', ev => {
      console.log('Updated:', ev.presetKey, '=', ev.value);
    });


}

/**
 * Generates a color map for NiiVue by interpolating between two colors
 * @param {Object} color1 - Starting color with r,g,b properties (0-255)
 * @param {Object} color2 - Ending color with r,g,b properties (0-255)
 * @param {number} steps - Number of steps in the color map (default: 256)
 * @returns {Object} Color map object compatible with NiiVue
 */
function generateColorMap(color1, color2, steps = 256) {
  const cmap = {
    R: [],
    G: [],
    B: [],
    A: [],
    I: [],
  };

  console.log(color1, color2);

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const r = Math.round(color1.r + t * (color2.r - color1.r));
    const g = Math.round(color1.g + t * (color2.g - color1.g));
    const b = Math.round(color1.b + t * (color2.b - color1.b));

    cmap.R.push(r);
    cmap.G.push(g);
    cmap.B.push(b);
    cmap.A.push(255);
    cmap.I.push(Math.round((r + g + b) / 3));
  }

  // console.log(cmap);

  return cmap;
}


window.generateColorMap = generateColorMap;
window.showPaneForObject = showPaneForObject;
window.generateColorMap = generateColorMap;
