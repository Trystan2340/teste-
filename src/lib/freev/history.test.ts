import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { capture, describeChange, sameSnapshot } from "./history.ts";
import { ACCOUNTS, DEBTS, GOALS, INVOICES, NOTIFS, PLANS, RULES, SEED_TX, SUBS } from "./data.ts";

const seed = {
  txs: SEED_TX,
  accounts: ACCOUNTS,
  goals: GOALS,
  debts: DEBTS,
  rules: RULES,
  subs: SUBS,
  plans: PLANS,
  invoices: INVOICES,
  budgets: { Logement: 900 },
  settings: { notifEmail: true, notifPush: false, notifWeekly: true, advice: true },
  pro: {
    tradeName: "Studio",
    siret: "1",
    vat: "2",
    address: "3",
    prefix: "FAC-",
    delay: "30",
    mention: "4",
    remind: true,
    remindLate: true,
  },
  notifs: NOTIFS,
  closedSessions: [],
  twoFa: false,
  duplicated: [],
};

describe("history snapshot", () => {
  it("captures every undoable slice and ignores chrome state", () => {
    const snap = capture({ ...seed, month: "2026-12", dialog: null } as never);
    assert.equal(snap.txs.length, SEED_TX.length);
    assert.equal("month" in snap, false);
    assert.equal("dialog" in snap, false);
  });

  it("treats immutably replaced slices as changed", () => {
    const before = capture(seed);
    assert.equal(sameSnapshot(before, capture({ ...seed })), true);
    assert.equal(sameSnapshot(before, capture({ ...seed, txs: [...seed.txs] })), false);
  });

  it("names an added line", () => {
    const before = capture(seed);
    const after = capture({ ...seed, txs: [{ ...SEED_TX[0], id: "new" }, ...seed.txs] });
    assert.equal(describeChange(before, after), "Opération ajoutée");
    assert.equal(describeChange(after, before), "Opération supprimée");
  });

  it("falls back to a generic label when several slices move at once", () => {
    const before = capture(seed);
    const after = capture({ ...seed, txs: [], goals: [] });
    assert.equal(describeChange(before, after), "Modifications enregistrées");
  });

  it("names a settings toggle", () => {
    const before = capture(seed);
    const after = capture({ ...seed, settings: { ...seed.settings, advice: false } });
    assert.equal(describeChange(before, after), "Réglage mis à jour");
  });

  it("reports nothing when the click changed nothing", () => {
    const before = capture(seed);
    assert.equal(describeChange(before, capture(seed)), "Modification");
  });
});
