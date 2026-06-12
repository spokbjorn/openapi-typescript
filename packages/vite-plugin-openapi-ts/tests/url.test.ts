import { describe, it, expect } from "vitest";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isRemoteUrl, resolveInput } from "../src/internal/url";

describe("isRemoteUrl", () => {
  it("returns true for https URLs", () => {
    expect(isRemoteUrl("https://example.com/api.yaml")).toBe(true);
  });

  it("returns true for http URLs", () => {
    expect(isRemoteUrl("http://example.com/api.yaml")).toBe(true);
  });

  it("returns true for URL objects with https", () => {
    expect(isRemoteUrl(new URL("https://example.com/api.yaml"))).toBe(true);
  });

  it("returns false for local file paths", () => {
    expect(isRemoteUrl("./spec.yaml")).toBe(false);
  });

  it("returns false for absolute file paths", () => {
    expect(isRemoteUrl("/home/user/spec.yaml")).toBe(false);
  });

  it("returns false for file:// URLs", () => {
    expect(isRemoteUrl(new URL("file:///home/user/spec.yaml"))).toBe(false);
  });
});

describe("resolveInput", () => {
  it("returns remote URLs as-is", () => {
    const result = resolveInput("https://example.com/api.yaml", "/root");
    expect(result).toBe("https://example.com/api.yaml");
  });

  it("resolves relative paths against root to file:// URL", () => {
    const result = resolveInput("./spec.yaml", "/root/project");
    const expected = pathToFileURL(
      path.resolve("/root/project", "./spec.yaml"),
    );
    expect(result).toBeInstanceOf(URL);
    expect((result as URL).href).toBe(expected.href);
  });

  it("resolves absolute paths to file:// URL", () => {
    const result = resolveInput("/home/user/spec.yaml", "/root");
    const expected = pathToFileURL(path.resolve("/home/user/spec.yaml"));
    expect(result).toBeInstanceOf(URL);
    expect((result as URL).href).toBe(expected.href);
  });

  it("passes through file:// URL objects", () => {
    const url = new URL("file:///home/user/spec.yaml");
    const result = resolveInput(url, "/root");
    expect(result).toBe(url);
  });

  it("passes through https URL objects", () => {
    const url = new URL("https://example.com/api.yaml");
    const result = resolveInput(url, "/root");
    expect(result).toBe(url);
  });
});
