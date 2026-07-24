import createClient from "openapi-fetch";
import type { paths } from "./generated/petstore";

export const client = createClient<paths>({
  baseUrl: "https://petstore3.swagger.io/api/v3",
});

export async function getPetById(id: number) {
  return client.GET("/pet/{petId}", {
    params: { path: { petId: id } },
  });
}

export async function findPetsByStatus(
  status: "available" | "pending" | "sold",
) {
  return client.GET("/pet/findByStatus", {
    params: { query: { status } },
  });
}

export async function getInventory() {
  return client.GET("/store/inventory");
}
