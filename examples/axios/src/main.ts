import axios from "axios";
import "@spokbjorn/axios-openapi-typescript";
import type { paths } from "./generated/petstore";

const api = axios.create({ baseURL: "https://petstore3.swagger.io/api/v3" });
const typedApi = api.typed<paths>();

async function getPet(id: number) {
  const { data, error } = await typedApi.GET("/pet/{petId}", {
    pathParams: { petId: id },
  });

  if (error) {
    console.error("Failed to fetch pet:", error);
    return;
  }

  console.log("Pet:", data);
  document.body.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

getPet(1);
