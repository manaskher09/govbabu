// Pulls the APPLICATIONS array literal out of the live app.js and evaluates
// it in an isolated vm context — not eval() in this module's own scope, and
// never touches or requires app.js as a module (it's a browser script, not
// a Node module: it references `document`/`window` at load time).
const fs = require('fs');
const vm = require('vm');

function extractApplications(appJsPath) {
  const src = fs.readFileSync(appJsPath, 'utf8');
  const declStart = src.indexOf('const APPLICATIONS=[');
  if (declStart === -1) throw new Error('Could not find "const APPLICATIONS=[" in ' + appJsPath);
  const arrStart = src.indexOf('[', declStart);

  let depth = 0;
  let inStr = false;
  let strCh = null;
  let esc = false;
  let i = arrStart;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === strCh) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = true;
      strCh = c;
      continue;
    }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  const arrText = src.slice(arrStart, i);
  const context = vm.createContext({});
  const script = new vm.Script('(' + arrText + ')');
  return script.runInContext(context, { timeout: 5000 });
}

module.exports = { extractApplications };
