var outContainer = global.document.querySelector('#output');

function output(msg) {
  outContainer.innerHTML += msg + '\n';
}

module.exports = output;
