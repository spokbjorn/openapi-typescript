import { getPetById } from "./api";

async function main() {
  const { data, error } = await getPetById(1);

  if (error) {
    console.error("Failed to fetch pet:", error);
    return;
  }

  console.log("Pet:", data);
  document.body.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

main();
