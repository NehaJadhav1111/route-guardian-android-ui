
// Calculate distance between two coordinates in kilometers (Haversine formula)
export function calculateDist(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

// Heuristic function for A* algorithm (straight-line distance)
function heuristic(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return calculateDist(lat1, lng1, lat2, lng2);
}

// Check if a point is near a hotspot
function isNearHotspot(
  lat: number, 
  lng: number, 
  hotspots: any[],
  safetyMargin: number = 1.5
): { isNear: boolean; risk: number } {
  let maxRisk = 0;
  let isNear = false;
  
  for (const hotspot of hotspots) {
    const dist = calculateDist(lat, lng, hotspot.center[0], hotspot.center[1]);
    
    if (dist <= hotspot.radius * safetyMargin) {
      isNear = true;
      // Convert risk level to numeric value (1 = low, 5 = high)
      let riskValue = 1;
      
      if (hotspot.riskLevel === "medium") {
        riskValue = 3;
      } else if (hotspot.riskLevel === "high") {
        riskValue = 5;
      }
      
      // Adjust risk based on distance to hotspot center
      riskValue *= (1 - dist / (hotspot.radius * safetyMargin));
      
      if (riskValue > maxRisk) {
        maxRisk = riskValue;
      }
    }
  }
  
  return { isNear, risk: maxRisk };
}

// Generate a grid of nodes for pathfinding
function generateGrid(
  src: { lat: number; lng: number },
  dst: { lat: number; lng: number },
  hotspots: any[],
  gridSize: number = 20
): any[][] {
  // Determine bounds of the grid
  const latMin = Math.min(src.lat, dst.lat) - 0.01;
  const latMax = Math.max(src.lat, dst.lat) + 0.01;
  const lngMin = Math.min(src.lng, dst.lng) - 0.01;
  const lngMax = Math.max(src.lng, dst.lng) + 0.01;
  
  const latStep = (latMax - latMin) / gridSize;
  const lngStep = (lngMax - lngMin) / gridSize;
  
  const grid = [];
  
  // Create nodes for the grid
  for (let i = 0; i <= gridSize; i++) {
    const row = [];
    const lat = latMin + i * latStep;
    
    for (let j = 0; j <= gridSize; j++) {
      const lng = lngMin + j * lngStep;
      const { risk } = isNearHotspot(lat, lng, hotspots);
      
      row.push({
        lat,
        lng,
        f: 0, // f = g + h (total cost)
        g: 0, // g = cost from start to current node
        h: 0, // h = heuristic (estimated cost from current to goal)
        risk,
        parent: null,
      });
    }
    
    grid.push(row);
  }
  
  return grid;
}

// Find the closest grid point to a given coordinate
function findClosestGridPoint(
  grid: any[][],
  lat: number,
  lng: number
): { i: number; j: number } {
  let minDist = Infinity;
  let closest = { i: 0, j: 0 };
  
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const node = grid[i][j];
      const dist = calculateDist(lat, lng, node.lat, node.lng);
      
      if (dist < minDist) {
        minDist = dist;
        closest = { i, j };
      }
    }
  }
  
  return closest;
}

// A* algorithm implementation for finding safe routes
export async function astar(
  start: { lat: number; lng: number },
  goal: { lat: number; lng: number },
  hotspots: any[]
): Promise<Array<{ lat: number; lng: number }>> {
  // Generate a grid of nodes
  const grid = generateGrid(start, goal, hotspots);
  
  // Find the closest grid points to start and goal
  const startPos = findClosestGridPoint(grid, start.lat, start.lng);
  const goalPos = findClosestGridPoint(grid, goal.lat, goal.lng);
  
  const startNode = grid[startPos.i][startPos.j];
  const goalNode = grid[goalPos.i][goalPos.j];
  
  // Initialize both open and closed lists
  const openList: any[] = [];
  const closedList: any[] = [];
  
  // Add the start node to the open list
  openList.push(startNode);
  
  // Loop until you find the goal or the open list is empty
  while (openList.length > 0) {
    // Find the node with the least f on the open list
    let lowestIndex = 0;
    
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    
    const currentNode = openList[lowestIndex];
    
    // If goal reached, reconstruct the path
    if (currentNode === goalNode) {
      const path = [];
      let temp = currentNode;
      
      path.push({ lat: temp.lat, lng: temp.lng });
      
      while (temp.parent) {
        temp = temp.parent;
        path.push({ lat: temp.lat, lng: temp.lng });
      }
      
      return path.reverse();
    }
    
    // Remove current node from open list and add to closed list
    openList.splice(lowestIndex, 1);
    closedList.push(currentNode);
    
    // Find the current node in the grid
    let currentI = 0;
    let currentJ = 0;
    
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] === currentNode) {
          currentI = i;
          currentJ = j;
          break;
        }
      }
    }
    
    // Get all adjacent nodes
    const neighbors = [];
    
    // Check all 8 adjacent cells
    for (let i = Math.max(0, currentI - 1); i <= Math.min(grid.length - 1, currentI + 1); i++) {
      for (let j = Math.max(0, currentJ - 1); j <= Math.min(grid[0].length - 1, currentJ + 1); j++) {
        // Skip current node
        if (i === currentI && j === currentJ) continue;
        
        neighbors.push(grid[i][j]);
      }
    }
    
    // For each neighbor
    for (const neighbor of neighbors) {
      // Skip if already evaluated
      if (closedList.includes(neighbor)) continue;
      
      // Calculate g score for this neighbor
      const gScore = currentNode.g + calculateDist(
        currentNode.lat, 
        currentNode.lng, 
        neighbor.lat, 
        neighbor.lng
      );
      
      // Apply risk factor to increase cost (higher risk = higher cost)
      const riskFactor = 1 + neighbor.risk * 0.5;
      const weightedGScore = gScore * riskFactor;
      
      // If not in open list or better path found
      let newPath = false;
      
      if (!openList.includes(neighbor)) {
        // Discover a new node
        openList.push(neighbor);
        newPath = true;
      } else if (weightedGScore < neighbor.g) {
        // Better path found
        newPath = true;
      }
      
      if (newPath) {
        // Update the neighbor's values
        neighbor.parent = currentNode;
        neighbor.g = weightedGScore;
        neighbor.h = heuristic(neighbor.lat, neighbor.lng, goalNode.lat, goalNode.lng);
        neighbor.f = neighbor.g + neighbor.h;
      }
    }
  }
  
  // No path found, return direct line
  return [
    { lat: start.lat, lng: start.lng },
    { lat: goal.lat, lng: goal.lng }
  ];
}
