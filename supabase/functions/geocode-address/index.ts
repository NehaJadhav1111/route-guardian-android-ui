
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Nominatim API for geocoding (OpenStreetMap)
const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      console.error("No address provided in request");
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Geocoding address: "${address}"`);

    // Call the Nominatim API to geocode the address
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
    });

    const nominatimURL = `${NOMINATIM_API}?${params.toString()}`;
    console.log(`Calling Nominatim API: ${nominatimURL}`);

    const response = await fetch(nominatimURL, {
      headers: {
        "User-Agent": "SafeRoute App (contact@saferoute.com)",
      },
    });

    if (!response.ok) {
      console.error(`Nominatim API returned status: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Geocoding service error: ${response.statusText}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log(`Nominatim response for "${address}":`, JSON.stringify(data).substring(0, 200) + "...");
    
    if (!data || data.length === 0) {
      console.log(`No results found for address: "${address}"`);
      return new Response(
        JSON.stringify({ error: "Location not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract latitude and longitude from the response
    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };

    console.log(`Geocoded "${address}" to:`, result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing geocoding request:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to geocode address", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
