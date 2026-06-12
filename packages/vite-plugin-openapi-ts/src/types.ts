import type { OpenAPITSOptions } from "openapi-typescript";

export interface MavenInput {
  groupId: string;
  artifactId: string;
  version: string;
  extension?: string;
  repository?: string;
}

export type SchemaInput = string | URL | MavenInput;

export interface SchemaConfig {
  input: SchemaInput;
  output: string;
  openapiTS?: OpenAPITSOptions;
}

export type PluginOptions = SchemaConfig | SchemaConfig[];
