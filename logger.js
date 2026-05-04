const apiClient = require('./apiClient');

async function Log(stack, level, package, message) {
    try {
        const logData = {
            stack: stack,
            level: level,
            package: package,
            message: message
        };

        const response = await apiClient.post('/register', logData);
        console.log('Log sent successfully:', response.status);
    } catch (error) {
        console.error('Error sending log:', error.message);
    }
}

module.exports = { Log };