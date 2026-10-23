
const API_KEY = import.meta.env.VITE_BUNGIE_API_KEY;
const BASE_URL = "https://www.bungie.net";

// Cache the result so both game modes can reuse the shader list.
let shadersPromise = null;

async function fetchJson(url, options = {}) {
  console.log("Fetching:", url);

  const response = await fetch(url, options);

  if (!response.ok) {
    const body = await response.text();

    console.error("Request failed:", {
      url,
      status: response.status,
      body: body.slice(0, 1000),
    });

    throw new Error(
      `Request failed (${response.status}): ${url}`
    );
  }

  return response.json();
}

export async function getShaders() {
  if (!API_KEY) {
    throw new Error(
      "Missing Bungie API key. Check your .env.local file."
    );
  }

  if (shadersPromise) {
    return shadersPromise;
  }

  shadersPromise = (async () => {
    try {
      // Get the Destiny 2 manifest.
      const manifestData = await fetchJson(
        `${BASE_URL}/Platform/Destiny2/Manifest/`,
        {
          headers: {
            "X-API-Key": API_KEY,
          },
        }
      );

      const definitionPath =
        manifestData.Response.jsonWorldComponentContentPaths?.en
          ?.DestinyInventoryItemDefinition;

      if (!definitionPath) {
        throw new Error("Could not find the Destiny 2 item definitions.");
      }

      // Download item definitions.
      const definitions = await fetchJson(
        `${BASE_URL}${definitionPath}`
      );

      // Keep items that appear to be shaders and have icons.
      const shaders = Object.values(definitions)
        .filter((item) => {
          const name = item.displayProperties?.name;
          const icon = item.displayProperties?.icon;
          const itemType = item.itemTypeDisplayName?.toLowerCase() ?? "";

          return (
            name &&
            icon &&
            itemType === "shader"
          );
        })
        .map((item) => ({
          id: item.hash,
          name: item.displayProperties.name,
          icon: item.displayProperties.icon.startsWith("http")
            ? item.displayProperties.icon
            : `${BASE_URL}${item.displayProperties.icon}`,
        }));

      if (shaders.length === 0) {
        throw new Error(
          "No shaders were found. The manifest data may have changed."
        );
      }

      return shaders;
    } catch (error) {
      // Allow a later retry if the request failed.
      shadersPromise = null;
      throw error;
    }
  })();

  return shadersPromise;
}
