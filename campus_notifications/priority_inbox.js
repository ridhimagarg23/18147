/**
 * Priority Inbox Sorting Script
 * 
 * Sorts an array of notification objects based on:
 * 1. Type Priority: Placement > Result > Event > Others
 * 2. Tie-breaker: Recent timestamp first (descending order).
 */

const TYPE_PRIORITY = {
    'Placement': 1,
    'Result': 2,
    'Event': 3,
    'Others': 4
};

function sortNotifications(notifications) {
    return notifications.sort((a, b) => {
        // Handle potentially missing/unknown types by assigning them lowest priority
        const priorityA = TYPE_PRIORITY[a.type] || 5;
        const priorityB = TYPE_PRIORITY[b.type] || 5;

        if (priorityA !== priorityB) {
            return priorityA - priorityB; // Lower number means higher priority
        }

        // Tie-breaker: Recent timestamp first (descending)
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        
        return timeB - timeA;
    });
}

// --- Test Data ---
const sampleNotifications = [
    {
        id: "1",
        type: "Others",
        title: "Campus maintenance",
        createdAt: "2024-05-20T08:00:00Z"
    },
    {
        id: "2",
        type: "Event",
        title: "Tech Talk",
        createdAt: "2024-05-20T09:00:00Z"
    },
    {
        id: "3",
        type: "Placement",
        title: "Interview Scheduled",
        createdAt: "2024-05-19T10:00:00Z" // Older placement
    },
    {
        id: "4",
        type: "Placement",
        title: "Offer Letter",
        createdAt: "2024-05-21T10:00:00Z" // Newer placement
    },
    {
        id: "5",
        type: "Result",
        title: "Semester 6 Results",
        createdAt: "2024-05-20T12:00:00Z"
    }
];

function main() {
    console.log("--- Unsorted Notifications ---");
    sampleNotifications.forEach(n => console.log(`${n.type} | ${n.createdAt} | ${n.title}`));

    const sorted = sortNotifications([...sampleNotifications]);

    console.log("\n--- Sorted Priority Inbox ---");
    sorted.forEach(n => console.log(`${n.type} | ${n.createdAt} | ${n.title}`));
}

// Export for module usage, run main if executed directly
if (require.main === module) {
    main();
}

module.exports = { sortNotifications };
