const express = require('express');
const chalk = require('chalk');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const favicon = require('serve-favicon');
const path = require('path');

// Server
const PORT = process.env.PORT || 3000;
const app = express();
app.listen(PORT, () => {
    console.log('%s Server running on http://localhost:%d in %s mode...', chalk.green('✓'), PORT, app.get('env'));
});

// middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require('./api/routes'));