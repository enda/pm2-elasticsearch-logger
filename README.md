# pm2-elasticsearch-logger

[![npm version](https://badge.fury.io/js/pm2-elasticsearch-logger.svg)](https://badge.fury.io/js/pm2-elasticsearch-logger)
[![Build Status](https://travis-ci.org/hobbyquaker/pm2-elasticsearch-logger.svg?branch=master)](https://travis-ci.org/hobbyquaker/pm2-elasticsearch-logger)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License][mit-badge]][mit-url]

> Module that sends logs of processes controlled by [PM2](https://pm2.io) to Elasticsearch 📒🔍


## Install

`pm2 install pm2-elasticsearch-logger2`


## Configuration

Set options with the command

`pm2 set pm2-elasticsearch-logger2:<option> <value>`

PM2 will automatically restart the module after changing an option.

#### Options

| option |           | default |
| ------ | --------- | ------- |
| elasticUrl | URL of Elasticsearch API | `http://localhost:9200` |
| index | Elasticsearch index to use | `pm2` |
| host | `host` attribute of the document | `os.hostname()` |
| username | `username` if you don't use the basic auth url format |
| password | `password` if you don't use the basic auth url format |

## Todo, Ideas

* Configurable document attributes
* Create mapping for `@timestamp` only if neccessary, control by config option


## Contributing

Pull Requests welcome!


## License

MIT (c) 2019 Sebastian Raff

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
