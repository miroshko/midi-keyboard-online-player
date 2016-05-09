var outContainer = global.document.querySelector('#output');
var activityEl = global.document.querySelector('#activity');

function output(msg) {
  outContainer.innerHTML += msg + '\n';
  global.window.scrollTo(0,document.body.scrollHeight);
}

function activity(value) {
  value ? activityEl.classList.add('active') : activityEl.classList.remove('active');
}

module.exports = {output, activity};
