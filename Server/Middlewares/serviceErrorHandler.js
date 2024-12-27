
const serviceErrorHandler = (fn) => async (...args) => {
    try {
        return await fn(...args);
    } catch (error) {
        console.error(`Error in ${fn.name}:`, error);
        throw error;
    }
};

const wrapAllServiceFunctions = (module) => {
    Object.keys(module).forEach(key => {
        if (typeof module[key] === 'function') {
            module[key] = serviceErrorHandler(module[key]);
        }
    });
    return module;
};

module.exports = { serviceErrorHandler, wrapAllServiceFunctions };