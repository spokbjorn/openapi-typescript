import createClient from "openapi-fetch";
import type { paths } from "./generated/petstore";

const client = createClient<paths>({
  baseUrl: "https://petstore3.swagger.io/api/v3",
});

async function getPet(id: number) {
  const { data, error } = await client.GET("/pet/{petId}", {
    params: { path: { petId: id } },
  });

  if (error) {
    console.error("Failed to fetch pet:", error);
    return;
  }

  console.log("Pet:", data);
  document.body.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

getPet(1);
