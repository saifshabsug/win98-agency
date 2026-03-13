const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const mainJs = fs.readFileSync('js/main.js', 'utf8');
const timeMachineJs = fs.readFileSync('js/time-machine.js', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost:3000/index.html?modern=true",
  runScripts: "dangerously",
  resources: "usable"
});

// Wait for scripts to execute
setTimeout(() => {
  const window = dom.window;
  const document = window.document;
  
  console.log("Body Classes:", document.body.className);
  console.log("Desktop Area Display:", document.querySelector('.desktop-area')?.style.display);
  console.log("Modern App Hidden?", document.getElementById('modern-app')?.classList.contains('hidden'));
}, 1000);
