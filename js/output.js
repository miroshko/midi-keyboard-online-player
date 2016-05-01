var outContainer = global.document.querySelector('#output');

function output(msg) {
  outContainer.innerHTML = msg + '\n' + outContainer.innerHTML;
}

module.exports = output;
