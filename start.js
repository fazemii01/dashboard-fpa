const path = require('path');

// Set the command line argument for Next.js to start in production mode
process.argv = [process.argv[0], process.argv[1], 'start'];

// Load Next.js runner
require(path.join(__dirname, 'node_modules/next/dist/bin/next'));
