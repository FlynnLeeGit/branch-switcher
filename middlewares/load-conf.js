const fse = require("fs-extra");
const errors = require("../constants/errors");

function getAppConfig(appName) {
  const appsConfig = JSON.parse(
    fse.readFileSync(__dirname + "/../conf/apps.json", "utf-8")
  );
  if (!appsConfig) {
    return;
  }
  return appsConfig[appName];
}

module.exports = (req, res, next) => {
  const app_name = req.params.app_name;
  const default_branch = req.params.default_branch;
  const app_config = getAppConfig(app_name);

  req.app.set("app_name", app_name);
  req.app.set("app_config", app_config);
  req.app.set("default_branch", default_branch);

  if (!app_config) {
    res.status(400).json({
      code: errors.APP_CONFIG_NOT_FOUND,
      msg: `Could not find app [ ${app_name} ],please check config apps.json`
    });
    return;
  }

  if (!default_branch) {
    res.status(400).json({
      code: errors.DEFAULT_BRANCH_NO_CONFIGURED,
      msg: `should give [default_branch] on url like /app/fe/default_branch/master`
    });
  }

  return next();
};
