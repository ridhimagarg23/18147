// http://20.207.122.201/evaluation-service/logs

const axios = require('axios');

async function Log(stack, level, package, message) {
    try {
        const logData = {
            stack: stack,
            level: level,
            package: package,
            message: message
        };

        const response = await axios.post('http://20.207.122.201/evaluation-service/logs', logData);
        console.log('Log sent successfully:', response.status);
    } catch (error) {
        console.error('Error sending log:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Example usage with different scenarios
(async () => {
    // Simulate error in application layer
    await Log("backend", "error", "handler", "received string, expected bool");

    // Simulate critical database connection failure
    await Log("backend", "fatal", "db", "critical database connection failure");

    // Additional test log
    await Log('test-stack', 'info', 'test-package', 'This is a test log message');

    console.log('All test logs completed');
})();