import { describe, expect, it } from "vitest";
import { getAll, getById, count } from "@/lib/json-db";

describe("json-db", () => {
  it("lee la colección de ejemplo", async () => {
    const result = await getAll("example");
    expect(result.total).toBe(1);
    expect(result.data[0]?.id).toBe("ex_001");
  });

  it("encuentra por id y cuenta registros", async () => {
    await expect(getById("example", "missing")).resolves.toBeNull();
    await expect(count("example")).resolves.toBe(1);
  });
});
