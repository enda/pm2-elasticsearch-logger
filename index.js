const os = require('os');
const pmx = require('pmx');
const pm2 = require('pm2');
const { Client } = require('es8');

pmx.initModule({}, (err, conf) => {
  if (err) {
    console.error('error on initalizing module', err.message);
  }

  const config = {
    index: conf.index || 'pm2-logs',
    host: conf.host || os.hostname(),
    node: conf.elasticUrl || 'http://localhost:9200',
    auth: conf.username && conf.password
      ? { username: conf.username, password: conf.password }
    : null,
  };

  let auth, credentials, node;

  if (!config.auth) {
    [credentials, node] = config.node.split('@');

    if (!node) {
      node = credentials;
      credentials = null;
    }

    if (credentials) {
      auth = {
        username: credentials.split(':')[0],
        password: credentials.split(':')[1],
      };
    }
  } else {
    auth = config.auth;
    node = config.node;
  }

  if (!node.startsWith('http')) {
    node = `http://${node}`;
  }

  const cli = new Client({
    node,
    auth,
  });

  let url;
  let index;

  function log(source, msg) {
    const d = new Date();

    const data = {
      '@timestamp': d.toISOString(),
      host: config.host,
      source,
      id: `${msg.process.pm_id}`,
      process: msg.process.name,
      message: msg.data.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
      ),
    };

    const document = JSON.stringify(data);

    cli.index({
      index: config.index,
      id: `${msg.process.pm_id}`,
      document,
    });
  }

  pm2.launchBus((err, bus) => {
    if (err) {
      console.error('error on launching pm2 bus', err.message);
    }

    bus.on('log:err', (data) => {
      if (data.process.name !== 'pm2-elasticsearch-logger') {
        log('stderr', data);
      }
    });

    bus.on('log:out', (data) => {
      if (data.process.name !== 'pm2-elasticsearch-logger') {
        log('stdout', data);
      }
    });
  });
});
