const apiClient = require('../apiClient');

async function fetchDepots() {
    const response = await apiClient.get('/depots');
    return response.data.depots || [];
}

async function fetchVehicles() {
    const response = await apiClient.get('/vehicles');
    return response.data.vehicles || [];
}

function solveKnapsack(vehicles, totalCapacity) {
    const n = vehicles.length;
    // dp[i][j] will store the maximum impact for first i vehicles with capacity j
    const dp = Array(n + 1).fill(0).map(() => Array(totalCapacity + 1).fill(0));

    // Build the DP table
    for (let i = 1; i <= n; i++) {
        const vehicle = vehicles[i - 1];
        const weight = vehicle.Duration;
        const value = vehicle.Impact;

        for (let j = 0; j <= totalCapacity; j++) {
            if (weight <= j) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weight] + value);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    // Backtrack to find the selected vehicles
    let res = dp[n][totalCapacity];
    let w = totalCapacity;
    const selectedTaskIDs = [];
    let totalDurationUsed = 0;

    for (let i = n; i > 0 && res > 0; i--) {
        // If the value came from the top, the item was not included
        if (res === dp[i - 1][w]) {
            continue;
        } else {
            // Item was included
            const vehicle = vehicles[i - 1];
            selectedTaskIDs.push(vehicle.TaskID);
            res -= vehicle.Impact;
            w -= vehicle.Duration;
            totalDurationUsed += vehicle.Duration;
        }
    }

    return {
        maxImpact: dp[n][totalCapacity],
        totalDurationUsed,
        selectedTaskIDs
    };
}

async function main() {
    try {
        console.log("Fetching depots and vehicles...");
        const depots = await fetchDepots();
        const vehicles = await fetchVehicles();

        // Calculate total mechanic hours available
        const totalMechanicHours = depots.reduce((sum, depot) => sum + depot.MechanicHours, 0);
        
        console.log(`\nFound ${depots.length} depots with a total of ${totalMechanicHours} Mechanic Hours.`);
        console.log(`Found ${vehicles.length} vehicles requiring maintenance.`);

        if (totalMechanicHours === 0 || vehicles.length === 0) {
            console.log("No capacity or no vehicles to process.");
            return;
        }

        console.log("\nCalculating optimal schedule...");
        const result = solveKnapsack(vehicles, totalMechanicHours);

        console.log(`\n--- Optimization Results ---`);
        console.log(`Maximum Operational Impact: ${result.maxImpact}`);
        console.log(`Total Mechanic Hours Used: ${result.totalDurationUsed} / ${totalMechanicHours}`);
        console.log(`Number of Vehicles Serviced: ${result.selectedTaskIDs.length}`);
        console.log(`Selected Task IDs:`);
        console.log(JSON.stringify(result.selectedTaskIDs, null, 2));

    } catch (error) {
        console.error("Error occurred:", error.message);
        if (error.response && error.response.status === 401) {
            console.error("Authentication failed. Your Bearer token may have expired. Please update the TOKEN variable.");
        }
    }
}

main();
