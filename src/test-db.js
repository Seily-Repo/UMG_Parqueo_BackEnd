const { initialize, close } = require('./db');

(async () => {
    console.log('USER:', process.env.DB_USER);
    await initialize();
    await close();
})();