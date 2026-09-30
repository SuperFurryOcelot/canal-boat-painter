// Find every colour picker on the page
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

pickers.forEach(function (picker) {
  // Apply the starting colour when the page loads
  paintPart(picker.dataset.part, picker.value);

  // Repaint whenever the user changes the colour
  picker.addEventListener('input', function () {
    paintPart(picker.dataset.part, picker.value);
  });
});

// Reset button: put every picker back to its starting colour.
// defaultValue is the value written in the HTML, so the defaults only live in one place.
document.getElementById('reset').addEventListener('click', function () {
  pickers.forEach(function (picker) {
    picker.value = picker.defaultValue;
    paintPart(picker.dataset.part, picker.value);
  });
});
