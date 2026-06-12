import "./setup";

import type {
  PathsWithMethod,
  OpenApiConfig,
  AxiosOpenApiResponse,
  AxiosOpenApi,
  RequestBody,
} from "./types";

export type {
  PathsWithMethod,
  OpenApiConfig,
  AxiosOpenApiResponse,
  AxiosOpenApi,
  RequestBody,
};

declare module "axios" {
  interface AxiosInstance {
    typed<Paths extends Record<string, any>>(options?: {
      baseURL?: string
    }): AxiosOpenApi<Paths>
  }

  interface AxiosRequestConfig {
    pathParams?: Record<string, unknown>
  }
}
