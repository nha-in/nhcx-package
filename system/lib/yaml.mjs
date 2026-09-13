/**
 * A YAML writer, small enough to keep in the repo.
 *
 * The collection's two catalogues are YAML because they are read by people as
 * often as by tools, and a dependency for a hundred lines of emitter is not
 * worth the supply chain. Everything the catalogues hold is a string, a
 * number, a boolean, a list or a map, so that is all this handles: anything
 * else throws rather than being written out wrong.
 */

const PLAIN = /^[A-Za-z0-9_][A-Za-z0-9 _\-./@()+:,'"]*$/;

/**
 * Values YAML would read back as something other than a string.
 *
 * The dates matter here: an OpenAPI `version: 2026-09-10` left unquoted comes
 * back as a date object rather than the string the document is supposed to
 * carry, and a `x-hcx-timestamp` example does the same. A round-trip test
 * catches it, and quoting is the fix.
 */
const AMBIGUOUS =
  /^(true|false|null|yes|no|on|off|~|-?\d+(\.\d+)?([eE][-+]?\d+)?|\d{4}-\d{2}-\d{2}([T ].*)?|\d+:\d+(:\d+)?)$/i;

/** A mapping key, quoted when YAML would read it as anything but a string. */
function key(name) {
  const text = String(name);
  return PLAIN.test(text) && !AMBIGUOUS.test(text) && !text.includes(': ') ? text : `'${text.replace(/'/g, "''")}'`;
}

function scalar(value, indent) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value);
  if (text === '') return "''";

  // A multi-line value keeps its shape in a literal block, which is what
  // makes the prose in these files readable at all.
  if (text.includes('\n')) {
    const body = text
      .replace(/\s+$/, '')
      .split('\n')
      .map((line) => (line ? `${' '.repeat(indent + 2)}${line}` : ''))
      .join('\n');
    return `|-\n${body}`;
  }
  if (PLAIN.test(text) && !AMBIGUOUS.test(text) && !text.includes(': ') && !text.endsWith(':')) return text;
  return `'${text.replace(/'/g, "''")}'`;
}

function emit(value, indent, out) {
  const pad = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return;
    for (const item of value) {
      if (item !== null && typeof item === 'object') {
        out.push(`${pad}-`);
        const at = out.length - 1;
        const before = out.length;
        emit(item, indent + 2, out);
        // Pull the first line of the item up onto the dash, the way YAML is
        // normally written by hand.
        if (out.length > before) {
          out[at] = `${pad}- ${out[before].slice(indent + 2)}`;
          out.splice(before, 1);
        }
      } else {
        out.push(`${pad}- ${scalar(item, indent)}`);
      }
    }
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const [name, item] of Object.entries(value)) {
      if (item === undefined) continue;
      if (Array.isArray(item) && item.length === 0) {
        out.push(`${pad}${key(name)}: []`);
      } else if (item !== null && typeof item === 'object') {
        out.push(`${pad}${key(name)}:`);
        emit(item, indent + 2, out);
      } else {
        out.push(`${pad}${key(name)}: ${scalar(item, indent)}`);
      }
    }
    return;
  }

  throw new Error(`Cannot write ${typeof value} to YAML`);
}

/** `header` is the comment block that opens the file, without the # marks. */
export function toYaml(value, header = '') {
  const out = [];
  emit(value, 0, out);
  const comments = header
    ? `${header
        .trim()
        .split('\n')
        .map((line) => (line ? `# ${line}` : '#'))
        .join('\n')}\n\n`
    : '';
  return `${comments}${out.join('\n')}\n`;
}
