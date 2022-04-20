const os = require('os');
const pmx = require('pmx');
const pm2 = require('pm2');
const elasticsearch = require('elasticsearch');

pmx.initModule({}, (err, conf) => {
  if (err) {
    console.error('error on initalizing module', err.message);
  }

  const config = {
    index: conf.index || 'pm2',
    type: conf.type || 'pm2',
    host: conf.host || os.hostname(),
    elasticUrl: conf.elasticUrl || 'http://localhost:9200',
  };

  const client = new elasticsearch.Client({
    host: config.elasticUrl.split(','),
  });

  let url;
  let currentDate;
  let index;

  function log(source, msg) {
    const d = new Date();

    const data = {
      '@timestamp': d.toISOString(),
      host: config.host,
      source,
      id: msg.process.pm_id,
      process: msg.process.name,
      message: msg.data.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
      ),
    };

    const body = JSON.stringify(data);

    const date = d.getDate();
    if (date !== currentDate) {
      index = `${config.index}-${d.getFullYear()}.${('0' + (d.getMonth() + 1)).substr(-2)}.${('0' + date).substr(-2)}`;
      currentDate = date;
    }

    client.index({
      index: index,
      type: config.type,
      body,
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
