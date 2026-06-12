import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

function isAxiosError(err: unknown): err is { response?: AxiosResponse } {
  return typeof err === "object" && err !== null && "isAxiosError" in err;
}

function shapeSuccess(res: AxiosResponse) {
  return { data: res.data, error: undefined, response: res };
}

function shapeError(err: unknown) {
  if (isAxiosError(err) && err.response) {
    return {
      data: undefined,
      error: err.response.data,
      response: err.response,
    };
  }
  throw err;
}

function addMethods(proto: Record<string, any>) {
  if (!proto.GET) {
    proto.GET = function GET(this: AxiosInstance, url: string, config?: any) {
      return this.get(url, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.POST) {
    proto.POST = function POST(
      this: AxiosInstance,
      url: string,
      data?: any,
      config?: any,
    ) {
      return this.post(url, data, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.PUT) {
    proto.PUT = function PUT(
      this: AxiosInstance,
      url: string,
      data?: any,
      config?: any,
    ) {
      return this.put(url, data, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.DELETE) {
    proto.DELETE = function DELETE(
      this: AxiosInstance,
      url: string,
      config?: any,
    ) {
      return this.delete(url, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.PATCH) {
    proto.PATCH = function PATCH(
      this: AxiosInstance,
      url: string,
      data?: any,
      config?: any,
    ) {
      return this.patch(url, data, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.OPTIONS) {
    proto.OPTIONS = function OPTIONS(
      this: AxiosInstance,
      url: string,
      config?: any,
    ) {
      return this.options(url, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.HEAD) {
    proto.HEAD = function HEAD(this: AxiosInstance, url: string, config?: any) {
      return this.head(url, config).then(shapeSuccess).catch(shapeError);
    };
  }

  if (!proto.typed) {
    proto.typed = function typed(
      this: AxiosInstance,
      options?: { baseURL?: string },
    ) {
      if ((this as any).__openapiSetupDone) return this;
      (this as any).__openapiSetupDone = true;

      if (options?.baseURL) {
        this.defaults.baseURL = options.baseURL;
      }

      this.interceptors.request.use((config) => {
        const pathParams = (config as any).pathParams as
          | Record<string, unknown>
          | undefined;
        if (pathParams && config.url) {
          let url = config.url;
          for (const [key, value] of Object.entries(pathParams)) {
            url = url.replace(`{${key}}`, String(value));
          }
          config.url = url;
          delete (config as any).pathParams;
        }
        return config;
      });

      return this;
    };
  }
}

const proto = Object.getPrototypeOf(axios) as Record<string, any>;
addMethods(proto);

export { addMethods };
