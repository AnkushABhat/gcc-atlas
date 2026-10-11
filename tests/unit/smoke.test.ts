import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import * as schema from "@/db/schema";

describe("Schema structure and ADR compliance", () => {
  it("defines all 9 required tables per src/db/AGENTS.md", () => {
    expect(schema.states).toBeDefined();
    expect(schema.cities).toBeDefined();
    expect(schema.facts).toBeDefined();
    expect(schema.incentives).toBeDefined();
    expect(schema.gccs).toBeDefined();
    expect(schema.providers).toBeDefined();
    expect(schema.leads).toBeDefined();
    expect(schema.leadOffers).toBeDefined();
    expect(schema.creditLedger).toBeDefined();
  });

  it("strictly enforces ADR 003: cities table has NO numeric data columns", () => {
    const columns = getTableColumns(schema.cities);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("slug");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("state_slug");

    for (const [colName, colDef] of Object.entries(columns)) {
      expect(colDef.dataType).not.toBe("number");
      const colType = (colDef.columnType || "").toLowerCase();
      expect(colType).not.toContain("integer");
      expect(colType).not.toContain("real");
      expect(colType).not.toContain("numeric");
      expect(colType).not.toContain("float");
      expect(colType).not.toContain("double");
      console.log(`Verified city column '${colName}': dataType=${colDef.dataType}, columnType=${colDef.columnType}`);
    }
  });

  it("enforces NOT NULL on fact source columns per ADR 003", () => {
    const columns = getTableColumns(schema.facts);
    expect(columns.source_name?.notNull).toBe(true);
    expect(columns.source_url?.notNull).toBe(true);
    expect(columns.as_of?.notNull).toBe(true);
    expect(columns.confidence?.notNull).toBe(true);
  });

  it("verifies credit_ledger delta is present for SUM(delta) balance calculation", () => {
    const columns = getTableColumns(schema.creditLedger);
    expect(columns.delta).toBeDefined();
    expect(columns.delta?.notNull).toBe(true);
    expect(columns.delta?.dataType).toBe("number");
  });
});
