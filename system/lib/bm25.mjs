/**
 * The NHCX chatbot's retrieval, ported line for line from services/chatbot
 * (chatbot/retrieval/bm25.py: tokenizer, query expansion, field weighting, boosts
 * and chunk selection), so the corpus can be scored against what the chatbot will
 * actually put in front of its model.
 */

const TOKEN = /[a-z0-9][a-z0-9_./-]*[a-z0-9]|[a-z0-9]/g;
const STOP = new Set(`a an the and or of to in on at by with from as is are was were be been being it its this
that these those we you they i do does did can could should would may might must will shall have has
had there here when where which who what why how all any both each more most other some such only own
same so than too very just also into over under again once about above below between during before
after up down out off through your our their them us me my for if not no yes`.split(/\s+/));
const BRIT = /isation\b/g;
const ALIAS = new Map(Object.entries({
  auth: "authentication", token: "token", cert: "certificate", certs: "certificate",
  eligibility: "eligibility", plan: "insuranceplan", money: "payment", paid: "payment",
  settle: "settlement", settled: "settlement", reject: "rejection", rejected: "rejection",
  approve: "approval", approved: "approval", callback: "callback", webhook: "callback",
  encrypt: "encryption", decrypt: "decryption", bundle: "bundle", resource: "resource",
}));

export const tokenize = (text) => (String(text).toLowerCase().match(TOKEN) || []).filter((t) => !STOP.has(t) && t.length > 1);

function variants(tok) {
  const out = new Set([tok]);
  if (/isation\b/.test(tok)) out.add(tok.replace(BRIT, "ization"));
  if (tok.includes("ization")) out.add(tok.replaceAll("ization", "isation"));
  if (tok.includes("-")) out.add(tok.replaceAll("-", ""));
  if (tok.startsWith("pre-auth") || tok === "preauth") for (const v of ["preauth", "preauthorization", "preauthorisation", "pre-authorisation"]) out.add(v);
  if (["cancel", "cancelling", "canceled", "cancelled"].includes(tok)) for (const v of ["cancellation", "cancel"]) out.add(v);
  if (tok === "error" || tok === "errors") for (const v of ["error", "errors"]) out.add(v);
  return out;
}

export class Bm25 {
  constructor(chunks) {
    this.chunks = chunks;
    this.docs = [];
    const df = new Map();
    for (const c of chunks) {
      // Python's str * 3 repeats with no separator; kept, so the scores match.
      const weighted = [c.text, c.breadcrumb.repeat(3), c.heading.repeat(3), c.keywords.join(" ").repeat(3), c.page.repeat(2)].join(" ");
      const counts = new Map();
      let len = 0;
      for (const t of tokenize(weighted)) {
        counts.set(t, (counts.get(t) || 0) + 1);
        len += 1;
      }
      this.docs.push({ counts, len });
      for (const t of counts.keys()) df.set(t, (df.get(t) || 0) + 1);
    }
    this.N = this.docs.length;
    this.avglen = this.docs.reduce((n, d) => n + d.len, 0) / Math.max(1, this.N);
    this.idf = new Map([...df].map(([t, n]) => [t, Math.log(1 + (this.N - n + 0.5) / (n + 0.5))]));
  }

  expand(query) {
    const out = [];
    for (const t of tokenize(query)) out.push(...variants(ALIAS.get(t) ?? t));
    return out;
  }

  /** Every chunk that scores, best first: [{ score, i }]. */
  rank(query, k1 = 1.5, b = 0.75) {
    const qt = this.expand(query);
    const ql = query.toLowerCase();
    const scores = [];
    this.docs.forEach((d, i) => {
      const dl = d.len || 1;
      let s = 0;
      for (const t of qt) {
        const f = d.counts.get(t) || 0;
        if (f) s += (this.idf.get(t) || 0) * (f * (k1 + 1)) / (f + k1 * (1 - b + (b * dl) / this.avglen));
      }
      if (s <= 0) return;
      const c = this.chunks[i];
      const low = c.text.toLowerCase();
      if (low.includes(ql)) s *= 1.6;
      if (qt.some((t) => c.heading.toLowerCase().includes(t))) s *= 1.25;
      const kw = c.keywords.join(" ").toLowerCase();
      if (qt.some((t) => kw.includes(t))) s *= 1.2;
      for (const t of qt) if (/[/\-_.]/.test(t) && low.includes(t)) s *= 1.35;
      if (c.kind === "payload") s *= 0.75;
      scores.push({ score: s, i });
    });
    return scores.sort((a, b2) => b2.score - a.score || b2.i - a.i);
  }

  search(query, { k = 6, perPage = 2, budget = 3500 } = {}) {
    return select(this.rank(query).map(({ i }) => this.chunks[i]), { k, perPage, budget });
  }
}

/** At most `perPage` chunks from a page, `k` in all, within a `budget` of tokens. */
export function select(ranked, { k, perPage, budget }) {
  const picked = [];
  const seen = new Map();
  let used = 0;
  for (const c of ranked) {
    const page = c.page || c.id || "";
    if ((seen.get(page) || 0) >= perPage) continue;
    const sn = Math.floor((c.snippet || "").length / 4);
    const t = Math.min(Math.trunc(c.tokens || 0) || sn, sn);
    if (budget && used + t > budget) continue;
    seen.set(page, (seen.get(page) || 0) + 1);
    picked.push(c);
    used += t;
    if (picked.length >= k) break;
    if (budget && used >= budget) break;
  }
  return picked;
}
