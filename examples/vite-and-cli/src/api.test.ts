import { getPetById, findPetsByStatus, getInventory } from "./api";

describe("API client (jest — runs outside Vite)", () => {
  it("fetches pet by ID", async () => {
    const { data, error } = await getPetById(1);
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data).toHaveProperty("name");
  });

  it("finds pets by status", async () => {
    const { data, error } = await findPetsByStatus("available");
    expect(error).toBeUndefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it("gets inventory", async () => {
    const { data, error } = await getInventory();
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
  });
});
