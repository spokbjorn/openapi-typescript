import {
  isSnapshotVersion,
  parseMavenMetadata,
  resolveSnapshotVersion,
} from "../src/maven-metadata";

const METADATA_XML = `
  <?xml version="1.0" encoding="UTF-8"?>
  <metadata>
    <groupId>com.example</groupId>
    <artifactId>my-api</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <versioning>
      <snapshot>
        <timestamp>20240102.140000</timestamp>
        <buildNumber>2</buildNumber>
      </snapshot>
      <lastUpdated>20240102140000</lastUpdated>
      <snapshotVersions>
        <snapshotVersion>
          <extension>yaml</extension>
          <value>1.0.0-20240102.140000-2</value>
          <updated>20240102140000</updated>
        </snapshotVersion>
      </snapshotVersions>
    </versioning>
  </metadata>
`;

describe("isSnapshotVersion", () => {
  it("returns true for a SNAPSHOT version", () => {
    expect(isSnapshotVersion("1.0.0-SNAPSHOT")).toBe(true);
  });

  it("returns false for a release version", () => {
    expect(isSnapshotVersion("1.0.0")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isSnapshotVersion("")).toBe(false);
  });
});

describe("parseMavenMetadata", () => {
  it("parses timestamp and buildNumber from metadata xml", () => {
    expect(parseMavenMetadata(METADATA_XML)).toEqual({
      timestamp: "20240102.140000",
      buildNumber: 2,
    });
  });

  it("defaults to empty timestamp and 0 buildNumber when snapshot missing", () => {
    const xml = "<metadata><versioning></versioning></metadata>";
    expect(parseMavenMetadata(xml)).toEqual({
      timestamp: "",
      buildNumber: 0,
    });
  });

  it("defaults to empty timestamp and 0 buildNumber for empty xml", () => {
    expect(parseMavenMetadata("")).toEqual({
      timestamp: "",
      buildNumber: 0,
    });
  });
});

describe("resolveSnapshotVersion", () => {
  it("replaces SNAPSHOT suffix with timestamped version", () => {
    expect(
      resolveSnapshotVersion("1.0.0-SNAPSHOT", {
        timestamp: "20240102.140000",
        buildNumber: 2,
      }),
    ).toBe("1.0.0-20240102.140000-2");
  });
});
