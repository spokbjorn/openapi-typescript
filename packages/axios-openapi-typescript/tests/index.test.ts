import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { type AxiosInstance } from "axios";
import "../src/index";

describe("prototype extensions", () => {
  let instance: AxiosInstance;

  beforeEach(() => {
    instance = axios.create();
  });

  it("adds GET to instance prototype", () => {
    expect(typeof (instance as any).GET).toBe("function");
  });

  it("adds POST to instance prototype", () => {
    expect(typeof (instance as any).POST).toBe("function");
  });

  it("adds PUT to instance prototype", () => {
    expect(typeof (instance as any).PUT).toBe("function");
  });

  it("adds DELETE to instance prototype", () => {
    expect(typeof (instance as any).DELETE).toBe("function");
  });

  it("adds PATCH to instance prototype", () => {
    expect(typeof (instance as any).PATCH).toBe("function");
  });

  it("adds OPTIONS to instance prototype", () => {
    expect(typeof (instance as any).OPTIONS).toBe("function");
  });

  it("adds HEAD to instance prototype", () => {
    expect(typeof (instance as any).HEAD).toBe("function");
  });

  it("adds typed to instance prototype", () => {
    expect(typeof (instance as any).typed).toBe("function");
  });
});

describe("typed", () => {
  let instance: AxiosInstance;

  beforeEach(() => {
    instance = axios.create();
  });

  it("adds a request interceptor", () => {
    const spy = vi.spyOn(instance.interceptors.request, "use");
    (instance as any).typed();
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("returns the same instance", () => {
    const result = (instance as any).typed();
    expect(result).toBe(instance);
  });

  it("sets baseURL from options", () => {
    (instance as any).typed({ baseURL: "https://api.example.com" });
    expect(instance.defaults.baseURL).toBe("https://api.example.com");
  });

  it("is idempotent (only adds interceptor once)", () => {
    const spy = vi.spyOn(instance.interceptors.request, "use");
    (instance as any).typed();
    (instance as any).typed();
    (instance as any).typed();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("path substitution interceptor", () => {
  let instance: AxiosInstance;
  let interceptorHandler: Function;

  beforeEach(() => {
    instance = axios.create();
    vi.spyOn(instance.interceptors.request, "use").mockImplementation(
      (fn: any) => {
        interceptorHandler = fn;
        return 0;
      },
    );
    (instance as any).typed();
  });

  it("substitutes a single path param", () => {
    const config = { url: "/pet/{petId}", pathParams: { petId: 1 } };
    const result = interceptorHandler(config);
    expect(result.url).toBe("/pet/1");
    expect(result.pathParams).toBeUndefined();
  });

  it("substitutes multiple path params", () => {
    const config = {
      url: "/pet/{petId}/owner/{ownerId}",
      pathParams: { petId: 1, ownerId: 42 },
    };
    const result = interceptorHandler(config);
    expect(result.url).toBe("/pet/1/owner/42");
  });

  it("does nothing when no pathParams", () => {
    const config = { url: "/pet/list" };
    const result = interceptorHandler(config);
    expect(result.url).toBe("/pet/list");
  });

  it("does nothing when no url", () => {
    const config = { pathParams: { petId: 1 } };
    const result = interceptorHandler(config);
    expect(result.url).toBeUndefined();
  });
});

describe("GET method", () => {
  let instance: AxiosInstance;

  beforeEach(() => {
    instance = axios.create();
  });

  it("returns shaped response on success", async () => {
    const responseData = { id: 1, name: "Fluffy" };
    const axiosResponse = {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    vi.spyOn(instance, "get").mockResolvedValue(axiosResponse);

    const result = await (instance as any).GET("/pet/1");
    expect(result).toEqual({
      data: responseData,
      error: undefined,
      response: axiosResponse,
    });
  });

  it("returns error shape on HTTP error", async () => {
    const errorData = { message: "Not Found" };
    const axiosError = {
      isAxiosError: true,
      response: {
        data: errorData,
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {},
      },
    };
    vi.spyOn(instance, "get").mockRejectedValue(axiosError);

    const result = await (instance as any).GET("/pet/1");
    expect(result).toEqual({
      data: undefined,
      error: errorData,
      response: axiosError.response,
    });
  });

  it("throws on network error (no response)", async () => {
    const networkError = new Error("Network Error");
    (networkError as any).isAxiosError = true;
    vi.spyOn(instance, "get").mockRejectedValue(networkError);

    await expect((instance as any).GET("/pet/1")).rejects.toThrow(
      "Network Error",
    );
  });

  it("passes config to axios.get", async () => {
    const spy = vi.spyOn(instance, "get").mockResolvedValue({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    const config = { headers: { Authorization: "Bearer token" } };
    await (instance as any).GET("/pet/1", config);
    expect(spy).toHaveBeenCalledWith("/pet/1", config);
  });
});

describe("POST method", () => {
  let instance: AxiosInstance;

  beforeEach(() => {
    instance = axios.create();
  });

  it("sends data and returns shaped response", async () => {
    const requestData = { name: "Fluffy", photoUrls: [] };
    const responseData = { id: 1, ...requestData };
    const axiosResponse = {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
    const spy = vi.spyOn(instance, "post").mockResolvedValue(axiosResponse);

    const result = await (instance as any).POST("/pet", requestData);
    expect(spy).toHaveBeenCalledWith("/pet", requestData, undefined);
    expect(result).toEqual({
      data: responseData,
      error: undefined,
      response: axiosResponse,
    });
  });

  it("passes config as third arg", async () => {
    vi.spyOn(instance, "post").mockResolvedValue({
      data: null,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    const data = { name: "Fluffy" };
    const config = { headers: { "X-Custom": "value" } };
    await (instance as any).POST("/pet", data, config);
    expect(instance.post).toHaveBeenCalledWith("/pet", data, config);
  });
});

describe("DELETE method", () => {
  it("returns shaped response", async () => {
    const instance = axios.create();
    const axiosResponse = {
      data: null,
      status: 204,
      statusText: "No Content",
      headers: {},
      config: {},
    };
    vi.spyOn(instance, "delete").mockResolvedValue(axiosResponse);

    const result = await (instance as any).DELETE("/pet/1");
    expect(result).toEqual({
      data: null,
      error: undefined,
      response: axiosResponse,
    });
  });
});
