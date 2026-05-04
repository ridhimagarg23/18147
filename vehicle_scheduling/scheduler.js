const axios = require('axios');

// Bearer token provided by the user (Note: If this has expired, please replace it with a fresh one)
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyaWRoaW1hZ2FyZzIzMDFAZ21haWwuY29tIiwiZXhwIjoxNzc3ODc0ODcyLCJpYXQiOjE3Nzc4NzM5NzIsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJmNTBjNWQ0Mi05YWIyLTQ4NWItOWU4Yi1mM2VmNjU0NTliN2UiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyaWRoaW1hIGdhcmciLCJzdWIiOiJlMmQ2ZDQ3MC1kOGE3LTQzM2ItOWZjOC02YzEzMDMxOWU3YmYifSwiZW1haWwiOiJyaWRoaW1hZ2FyZzIzMDFAZ21haWwuY29tIiwibmFtZSI6InJpZGhpbWEgZ2FyZyIsInJvbGxObyI6IjE4MTQ3IiwiYWNjZXNzQ29kZSI6InVrc2RXVCIsImNsaWVudElEIjoiZTJkNmQ0NzAtZDhhNy00MzNiLTlmYzgtNmMxMzAzMTllN2JmIiwiY2xpZW50U2VjcmV0IjoiSERGdWFzcmF6SHRNbWV3RSJ9.TcqmD-gcoCingeaMdt-7TnjmzPDNxp8uVq9xdMIKpzA";

const API_BASE_URL = "http://20.207.122.201/evaluation-service";

async function fetchDepots() {
    const response = await axios.get(`${API_BASE_URL}/depots`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    return response.data.depots || [];
}

async function fetchVehicles() {
    const response = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
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
