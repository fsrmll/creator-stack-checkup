import { describe, expect, it } from "vitest";
import { parseToolsJson } from "./exporters";

describe("JSON import", () => {
  it("normalizes imported tools before they enter local storage", () => {
    const [tool] = parseToolsJson(
      JSON.stringify({
        tools: [
          {
            name: "Imported Tool",
            category: "Unknown category",
            price: "19.5",
            billingCycle: "annual",
            renewalDate: "bad-date",
            usageFrequency: "sometimes",
            businessValue: "nice",
            cancellationRisk: "scary",
            paymentMethod: 123,
            notes: null,
            status: "active",
          },
        ],
      }),
    );

    expect(tool).toMatchObject({
      name: "Imported Tool",
      category: "Other",
      price: 19.5,
      billingCycle: "monthly",
      renewalDate: "",
      usageFrequency: "weekly",
      businessValue: "useful",
      cancellationRisk: "medium",
      paymentMethod: "",
      notes: "",
      status: "active",
    });
    expect(tool.id).toBeTruthy();
  });

  it("rejects imported tools without a name", () => {
    expect(() => parseToolsJson(JSON.stringify({ tools: [{ price: 5 }] }))).toThrow(
      "Every imported tool needs a name.",
    );
  });
});
