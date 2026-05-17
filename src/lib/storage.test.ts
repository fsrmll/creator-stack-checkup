import { afterEach, describe, expect, it, vi } from "vitest";
import { loadTools, saveTools } from "./storage";

const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

afterEach(() => {
  vi.restoreAllMocks();
  if (storageDescriptor) {
    Object.defineProperty(globalThis, "localStorage", storageDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

describe("local tool storage", () => {
  it("normalizes saved browser data on load", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () =>
          JSON.stringify([
            {
              name: "Stored Tool",
              category: "Unknown",
              price: "12",
              billingCycle: "annual",
              renewalDate: "not-a-date",
            },
          ]),
      },
    });

    expect(loadTools()[0]).toMatchObject({
      name: "Stored Tool",
      category: "Other",
      price: 12,
      billingCycle: "yearly",
      renewalDate: "",
    });
  });

  it("does not throw when localStorage is unavailable", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });

    expect(loadTools()).toEqual([]);
    expect(() => saveTools([])).not.toThrow();
  });
});
