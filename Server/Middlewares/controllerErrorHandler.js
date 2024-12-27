
const controllerErrorHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error); 
    }
};
const wrapAllControllerFunctions = (module) => {
    Object.keys(module).forEach(key => {
        if (typeof module[key] === 'function') {
            module[key] = controllerErrorHandler(module[key]);
        }
    });
    return module;
};

module.exports = { controllerErrorHandler, wrapAllControllerFunctions };
