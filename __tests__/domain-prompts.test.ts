import { buildSystemPrompt } from "@/lib/domain-prompts";
import type { DomainId } from "@/types";

const ALL_DOMAINS: DomainId[] = ["info", "marketing", "rh", "finance", "droit", "other"];

describe("buildSystemPrompt", () => {
  it.each(ALL_DOMAINS)("returns a non-empty string for domain '%s'", (domain) => {
    const prompt = buildSystemPrompt(domain);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes domain-specific content for 'info'", () => {
    const prompt = buildSystemPrompt("info");
    expect(prompt).toContain("informatique");
  });

  it("includes domain-specific content for 'marketing'", () => {
    const prompt = buildSystemPrompt("marketing");
    expect(prompt).toContain("marketing");
  });

  it("includes JSON output format instruction", () => {
    const prompt = buildSystemPrompt("info");
    expect(prompt).toContain("JSON");
  });

  it("produces different prompts for different domains", () => {
    const infoPrompt = buildSystemPrompt("info");
    const marketingPrompt = buildSystemPrompt("marketing");
    expect(infoPrompt).not.toBe(marketingPrompt);
  });
});
