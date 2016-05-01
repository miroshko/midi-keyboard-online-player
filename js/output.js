var outContainer = global.document.querySelector('#output');

function output(msg) {
  outContainer.innerHTML += msg + '\n';
  global.window.scrollTo(0,document.body.scrollHeight);
}

module.exports = output;
