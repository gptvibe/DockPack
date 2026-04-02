import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseSourceInput,
  validateSourceInput,
  type ParseSourceResult,
  type ParseSourceSuccess,
  type SourceMessage,
} from "../src/lib/source-input.js";

describe("parseSourceInput", () => {
  it("parses official Docker Hub image references", () => {
    const result = expectSuccess(parseSourceInput("nginx:latest"));

    assert.equal(result.source.kind, "docker-hub");
    assert.equal(result.source.repository.fullName, "library/nginx");
    assert.equal(result.source.reference.type, "tag");
    assert.equal(result.source.reference.value, "latest");
    assert.equal(result.source.canonicalReference, "docker.io/library/nginx:latest");
    assert.equal(result.messages.length, 0);
  });

  it("normalizes Docker Hub repository URLs from the current hub format", () => {
    const result = expectSuccess(parseSourceInput("https://hub.docker.com/repository/docker/acme/notes-desktop?name=1.4.0"));

    assert.equal(result.source.kind, "docker-hub");
    assert.equal(result.source.repository.fullName, "acme/notes-desktop");
    assert.equal(result.source.reference.type, "tag");
    assert.equal(result.source.reference.value, "1.4.0");
    assert.equal(result.source.repositoryUrl, "https://hub.docker.com/r/acme/notes-desktop");
  });

  it("rejects non-Docker Hub registries with a friendly error", () => {
    const result = parseSourceInput("ghcr.io/acme/notes-desktop:1.4.0");

    assert.equal(result.ok, false);
    assert.equal(result.messages[0]?.code, "unsupported-docker-registry");
    assert.match(result.messages[0]?.message ?? "", /only supports Docker Hub/i);
  });

  it("rejects incomplete Docker tags instead of silently defaulting", () => {
    const result = parseSourceInput("nginx:");

    assert.equal(result.ok, false);
    assert.equal(result.messages[0]?.code, "invalid-docker-tag");
  });

  it("parses GitHub repository URLs without a ref", () => {
    const result = expectSuccess(parseSourceInput("https://github.com/octocat/Hello-World"));

    assert.equal(result.source.kind, "github");
    assert.equal(result.source.owner, "octocat");
    assert.equal(result.source.repo, "Hello-World");
    assert.equal(result.source.ref, undefined);
    assert.equal(result.source.repositoryUrl, "https://github.com/octocat/Hello-World");
  });

  it("preserves an explicit GitHub ref when one is supplied via query string", () => {
    const result = expectSuccess(parseSourceInput("https://github.com/octocat/Hello-World?ref=release/v1"));

    assert.equal(result.source.kind, "github");
    assert.deepEqual(result.source.ref, {
      exact: true,
      source: "query",
      type: "unknown",
      value: "release/v1",
    });
    assert.equal(result.source.normalizedInput, "https://github.com/octocat/Hello-World?ref=release%2Fv1");
  });

  it("parses commit-specific GitHub URLs", () => {
    const result = expectSuccess(
      parseSourceInput("https://github.com/octocat/Hello-World/commit/7fd1a60b01f91b314f59955a4e4d201274f3402e"),
    );

    assert.equal(result.source.kind, "github");
    assert.deepEqual(result.source.ref, {
      exact: true,
      source: "commit",
      type: "commit",
      value: "7fd1a60b01f91b314f59955a4e4d201274f3402e",
    });
  });

  it("captures simple blob URLs when the ref and file path are unambiguous", () => {
    const result = expectSuccess(parseSourceInput("https://github.com/octocat/Hello-World/blob/main/README.md"));

    assert.equal(result.source.kind, "github");
    assert.equal(result.source.ref?.value, "main");
    assert.equal(result.source.ref?.exact, true);
    assert.equal(result.source.subpath, "README.md");
  });

  it("returns a warning when a GitHub URL includes an ambiguous nested ref path", () => {
    const result = expectSuccess(parseSourceInput("https://github.com/octocat/Hello-World/tree/main/apps/web"));

    assert.equal(result.source.kind, "github");
    assert.equal(result.source.ref?.exact, false);
    assert.equal(result.messages[0]?.code, "ambiguous-github-ref");
  });

  it("accepts repository hosts without an explicit scheme", () => {
    const result = expectSuccess(parseSourceInput("github.com/octocat/Hello-World"));

    assert.equal(result.source.kind, "github");
    assert.equal(result.source.repositoryUrl, "https://github.com/octocat/Hello-World");
  });
});

describe("validateSourceInput", () => {
  it("returns a human-friendly error for empty input", () => {
    const messages = validateSourceInput("   ");

    assert.equal(messages[0]?.code, "empty-input");
    assert.match(messages[0]?.message ?? "", /paste a docker hub image/i);
  });

  it("flags GitHub links that do not include a repository name", () => {
    const result = parseSourceInput("https://github.com/octocat");

    assert.equal(result.ok, false);
    assert.equal(result.messages[0]?.code, "invalid-github-url");
  });
});

function expectSuccess(result: ParseSourceResult): ParseSourceSuccess {
  assert.equal(
    result.ok,
    true,
    result.messages.map((message: SourceMessage) => `${message.severity}: ${message.message}`).join("\n"),
  );

  return result as ParseSourceSuccess;
}
