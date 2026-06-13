import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import type {
  PathsWithMethod as _PathsWithMethod,
  SuccessResponse,
  ErrorResponse,
  OperationRequestBodyContent,
  HttpMethod,
} from "openapi-typescript-helpers";

export type { SuccessResponse, ErrorResponse };

export type PathsWithMethod<
  P extends {},
  M extends HttpMethod,
> = _PathsWithMethod<P, M>;

type PathParams<Op> = Op extends { parameters: { path: Record<string, any> } }
  ? Op["parameters"]["path"]
  : never;

type QueryParams<Op> = Op extends { parameters: { query: Record<string, any> } }
  ? Op["parameters"]["query"]
  : never;

type ResponseData<Op> = Op extends { responses: Record<string, any> }
  ? SuccessResponse<Op["responses"]>
  : never;

type ResponseError<Op> = Op extends { responses: Record<string, any> }
  ? ErrorResponse<Op["responses"]>
  : never;

export type RequestBody<Op> = OperationRequestBodyContent<Op>;

export type OpenApiConfig<Op> = Omit<AxiosRequestConfig, "params"> & {
  pathParams?: PathParams<Op>
  params?: QueryParams<Op>
};

export type AxiosOpenApiResponse<Op>
  = { data: ResponseData<Op>, error?: never, response: AxiosResponse }
    | { data?: never, error: ResponseError<Op>, response: AxiosResponse };

export interface AxiosOpenApi<
  Paths extends Record<string, any>,
> extends AxiosInstance {
  GET<Path extends PathsWithMethod<Paths, "get">>(
    url: Path,
    config?: OpenApiConfig<Paths[Path]["get"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["get"]>>

  POST<Path extends PathsWithMethod<Paths, "post">>(
    url: Path,
    data?: RequestBody<Paths[Path]["post"]>,
    config?: OpenApiConfig<Paths[Path]["post"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["post"]>>

  PUT<Path extends PathsWithMethod<Paths, "put">>(
    url: Path,
    data?: RequestBody<Paths[Path]["put"]>,
    config?: OpenApiConfig<Paths[Path]["put"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["put"]>>

  DELETE<Path extends PathsWithMethod<Paths, "delete">>(
    url: Path,
    config?: OpenApiConfig<Paths[Path]["delete"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["delete"]>>

  PATCH<Path extends PathsWithMethod<Paths, "patch">>(
    url: Path,
    data?: RequestBody<Paths[Path]["patch"]>,
    config?: OpenApiConfig<Paths[Path]["patch"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["patch"]>>

  OPTIONS<Path extends PathsWithMethod<Paths, "options">>(
    url: Path,
    config?: OpenApiConfig<Paths[Path]["options"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["options"]>>

  HEAD<Path extends PathsWithMethod<Paths, "head">>(
    url: Path,
    config?: OpenApiConfig<Paths[Path]["head"]>,
  ): Promise<AxiosOpenApiResponse<Paths[Path]["head"]>>
}
