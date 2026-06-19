module.exports = {
  apps: [
    {
      name: "dashboard-tab",
      script: "./start.js",
      cwd: "/www/wwwroot/dashboard-fpa",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        PORT: 8100,
        NODE_ENV: "production"
      }
    }
  ]
};
