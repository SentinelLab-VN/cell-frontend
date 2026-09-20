import { expect, test } from "vitest";
import { formatAmount, gte, parseAmount, subtract, sum } from "./amount";

test("parses what a person types into whole units", () => {
  expect(parseAmount("1", 7)).toBe("10000000");
  expect(parseAmount("0.5", 7)).toBe("5000000");
  expect(parseAmount("1,250.25", 7)).toBe("12502500000");
  expect(parseAmount("0.0000001", 7)).toBe("1");
});

test("refuses what cannot be an amount", () => {
  for (const text of ["", "abc", "-1", "1.2.3", "0.00000001"]) expect(parseAmount(text, 7)).toBeNull();
});

test("formats without ever going through a float", () => {
  expect(formatAmount("12502500000", 7)).toBe("1,250.25");
  expect(formatAmount("10000000", 7)).toBe("1.00");
  expect(formatAmount("1", 7)).toBe("0.0000001");
  expect(formatAmount("-5000000", 7)).toBe("-0.50");
  expect(formatAmount("92233720368547758070000000", 7)).toBe("9,223,372,036,854,775,807.00");
});

test("does arithmetic on strings of any size", () => {
  expect(sum(["1", "2", "3"])).toBe("6");
  expect(subtract("10", "4")).toBe("6");
  expect(gte("10", "10")).toBe(true);
  expect(gte("9", "10")).toBe(false);
});
