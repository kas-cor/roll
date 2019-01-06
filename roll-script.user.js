// ==UserScript==
// @name Auto Roll freebitco.in
// @namespace Violentmonkey Scripts
// @match https://freebitco.in/
// @grant none
// ==/UserScript==

var timer = {};

(function clickToRoll() {
  var roll = document.querySelector("#free_play_form_button");
  if (roll.style.display !== 'none') {
    roll.click();
    console.log('Click to roll - ' + (new Date).toTimeString());
  }
  window.clearTimeout(timer);
  timer = window.setTimeout(clickToRoll, 1000);
})();
