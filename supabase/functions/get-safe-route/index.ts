
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DBSCAN } from "https://esm.sh/density-clustering@0.1.6";
import { calculateDist, astar } from "./route-algorithms.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
const supabaseUrl = "https://pyasrqfmrjbhclhiihfq.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Risk levels for crime clusters
enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

type CrimeData = {
  nm_pol: string;
  lat: number | null;
  long: number | null;
  totalcrime: number | null;
  "crime/area": number;
};

type CrimeCluster = {
  center: [number, number];
  radius: number;
  crimeCount: number;
  riskLevel: RiskLevel;
};

type Node = {
  lat: number;
  lng: number;
  f: number;
  g: number;
  h: number;
  parent: Node | null;
  risk: number;
};

type RouteSegment = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  risk: RiskLevel;
};

type SafeRouteResponse = {
  route: Array<{ lat: number; lng: number }>;
  segments: RouteSegment[];
  alternativeRoutes?: Array<{
    route: Array<{ lat: number; lng: number }>;
    segments: RouteSegment[];
    safetyScore: number;
  }>;
  overallSafetyScore: number;
  hotspots: CrimeCluster[];
};

// Load crime data from Supabase and run clustering to find hotspots
async function analyzeCrimeData(): Promise<CrimeCluster[]> {
  const { data: crimeData, error } = await supabase
    .from("crime")
    .select("nm_pol, lat, long, totalcrime, crime/area")
    .not("lat", "is", null)
    .not("long", "is", null);

  if (error) {
    console.error("Error fetching crime data:", error);
    return [];
  }

  // Format data for clustering algorithm
  const points = crimeData
    .filter((crime: CrimeData) => crime.lat !== null && crime.long !== null)
    .map((crime: CrimeData) => [crime.lat!, crime.long!]);

  // Run DBSCAN clustering
  const dbscan = new DBSCAN();
  
  // Parameters: epsilon (neighborhood radius) and minPoints (minimum points in cluster)
  const clusters = dbscan.run(points, 0.01, 2);
  
  const hotspots: CrimeCluster[] = [];
  
  clusters.forEach((clusterPoints: number[]) => {
    if (clusterPoints.length < 2) return;
    
    // Calculate cluster center
    const clusterCoords = clusterPoints.map((idx: number) => points[idx]);
    const sumLat = clusterCoords.reduce((sum, coord) => sum + coord[0], 0);
    const sumLng = clusterCoords.reduce((sum, coord) => sum + coord[1], 0);
    const center: [number, number] = [
      sumLat / clusterCoords.length,
      sumLng / clusterCoords.length,
    ];
    
    // Calculate cluster radius (max distance from center to any point)
    let maxDist = 0;
    clusterCoords.forEach((coord) => {
      const dist = calculateDist(center[0], center[1], coord[0], coord[1]);
      if (dist > maxDist) maxDist = dist;
    });
    
    // Determine risk level based on crime count and density
    const crimeCount = clusterPoints.length;
    let riskLevel = RiskLevel.LOW;
    
    if (crimeCount > 10) {
      riskLevel = RiskLevel.HIGH;
    } else if (crimeCount > 5) {
      riskLevel = RiskLevel.MEDIUM;
    }
    
    hotspots.push({
      center,
      radius: maxDist,
      crimeCount,
      riskLevel,
    });
  });
  
  return hotspots;
}

// Calculate risk for a route segment based on proximity to hotspots
function calculateRouteRisk(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  hotspots: CrimeCluster[]
): RiskLevel {
  let maxRisk = RiskLevel.LOW;
  
  // Check if line segment passes near any hotspot
  hotspots.forEach((hotspot) => {
    // Calculate minimum distance from line segment to hotspot center
    const dist = calculateMinDistanceToLineSegment(
      hotspot.center[0],
      hotspot.center[1],
      start.lat,
      start.lng,
      end.lat,
      end.lng
    );
    
    // If within radius + safety margin, assign risk
    if (dist <= hotspot.radius * 1.5) {
      if (hotspot.riskLevel === RiskLevel.HIGH) {
        maxRisk = RiskLevel.HIGH;
      } else if (hotspot.riskLevel === RiskLevel.MEDIUM && maxRisk !== RiskLevel.HIGH) {
        maxRisk = RiskLevel.MEDIUM;
      }
    }
  });
  
  return maxRisk;
}

// Calculate minimum distance from point to line segment
function calculateMinDistanceToLineSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy) * 111; // Convert to km (approx)
}

// Color segments of the route based on risk level
function colorRouteSegments(
  route: Array<{ lat: number; lng: number }>,
  hotspots: CrimeCluster[]
): RouteSegment[] {
  const segments: RouteSegment[] = [];
  
  for (let i = 0; i < route.length - 1; i++) {
    const start = route[i];
    const end = route[i + 1];
    const risk = calculateRouteRisk(start, end, hotspots);
    
    segments.push({
      start,
      end,
      risk,
    });
  }
  
  return segments;
}

// Store route in the database
async function storeRouteHistory(
  userId: string,
  sourceLat: number,
  sourceLng: number,
  destLat: number,
  destLng: number,
  routeData: SafeRouteResponse
) {
  const { error } = await supabase
    .from("route_history")
    .insert({
      user_id: userId,
      source_lat: sourceLat,
      source_lng: sourceLng,
      destination_lat: destLat,
      destination_lng: destLng,
      route_data: routeData,
    });
  
  if (error) {
    console.error("Error storing route history:", error);
  }
}

// Main function to compute the safest route
async function computeSafeRoute(
  srcLat: number,
  srcLng: number,
  dstLat: number,
  dstLng: number,
  userId?: string
): Promise<SafeRouteResponse> {
  // Analyze crime data to find hotspots
  const hotspots = await analyzeCrimeData();
  
  // Create a grid of nodes for pathfinding
  const route = await astar(
    { lat: srcLat, lng: srcLng },
    { lat: dstLat, lng: dstLng },
    hotspots
  );
  
  // Color the route segments based on risk
  const segments = colorRouteSegments(route, hotspots);
  
  // Calculate overall safety score (0-100)
  const highRiskSegments = segments.filter((s) => s.risk === RiskLevel.HIGH).length;
  const mediumRiskSegments = segments.filter((s) => s.risk === RiskLevel.MEDIUM).length;
  const totalSegments = segments.length;
  
  const overallSafetyScore = Math.round(
    100 - ((highRiskSegments * 30 + mediumRiskSegments * 15) / totalSegments)
  );
  
  // Store route in history if user is logged in
  if (userId) {
    const safeRouteResponse: SafeRouteResponse = {
      route,
      segments,
      overallSafetyScore,
      hotspots,
    };
    
    await storeRouteHistory(userId, srcLat, srcLng, dstLat, dstLng, safeRouteResponse);
    return safeRouteResponse;
  }
  
  return {
    route,
    segments,
    overallSafetyScore,
    hotspots,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const src = url.searchParams.get("src");
      const dst = url.searchParams.get("dst");
      
      if (!src || !dst) {
        return new Response(
          JSON.stringify({
            error: "Missing source or destination parameters",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const [srcLat, srcLng] = src.split(",").map(Number);
      const [dstLat, dstLng] = dst.split(",").map(Number);
      
      // Get user ID if authenticated
      let userId: string | undefined;
      const authHeader = req.headers.get("Authorization");
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          userId = user.id;
        }
      }
      
      const safeRoute = await computeSafeRoute(
        srcLat,
        srcLng,
        dstLat,
        dstLng,
        userId
      );
      
      return new Response(JSON.stringify(safeRoute), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
