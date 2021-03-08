module.exports = {
    mongodbMemoryServerOptions: {
      binary: {
        version: '3.6.3',
        skipMD5: true
      },
      instance: {
        dbName: 'jest'
      },
      autoStart: false
    }
};