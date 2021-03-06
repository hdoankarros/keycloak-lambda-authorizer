const { getRoute } = require('./router');

const { updateResponse } = require('./lambdaEdgeUtils');
const routes = require('./routes/routes');
const { lambdaEdgeOptions } = require('../utils/optionsUtils');

async function lambdaEdgeRouter(event, context, sessionManager, callback) {
  const records = event.Records;
  const options = lambdaEdgeOptions(sessionManager);
  if (records && records[0] && records[0].cf) {
    const { request, config } = records[0].cf;
    const route = await getRoute(request, options);
    try {
      await route.handle(request, config, (error, response) => {
        updateResponse(request, response);
        callback(error, response);
      }, options);
    } catch (e) {
      console.error(e);
      sessionManager.sessionOptions.route.internalServerError(request, callback);
    }
  } else {
    sessionManager.sessionOptions.route.internalServerError({}, callback);
  }
}

module.exports = {
  routes,
  lambdaEdgeRouter,

};
