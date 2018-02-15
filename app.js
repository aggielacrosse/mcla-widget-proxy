const fetch = require('node-fetch');
const express = require('express');
const app = express();
const queryString = require('query-string');
const url = require('url');

const escapeStringRegexp = require('escape-string-regexp');
const sanitizeHtml = require('sanitize-html');

const MCLA_WIDGET_URL = 'http://mcla.us/api/widget/v2';

const PREFIX = `var dw=function(t){document.writeln(t)};dw('`;
const ESCAPED_PREFIX = escapeStringRegexp(PREFIX);
const POSTFIX = `');`;
const ESCAPED_POSTFIX = escapeStringRegexp(POSTFIX);

const unescape = (string) => {
    return string.replace(/\\'/g,'\'');
}

const escape = (string) => {
    return string.replace(/'/g, '\\\'');
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([ 'img', 'style', 'tfoot' ]);
const allowedAttributes = sanitizeHtml.defaults.allowedAttributes;
allowedAttributes['th'] = ['colspan'];
allowedAttributes['*'] = ['style', 'class', 'id'];

const render = (widgetSource) => {
    try {
        const regex = new RegExp(`${ESCAPED_PREFIX}(.*)${ESCAPED_POSTFIX}`);
        const [all, src] = widgetSource.match(regex);
        const raw = unescape(src);
        const sanitized = sanitizeHtml(raw, {
            allowedTags,
            allowedAttributes
        });
        return `${PREFIX}${escape(sanitized)}${POSTFIX}`
    } catch (err) {
        return '/* There was an issue rendering this script */';
    }
}

app.get('/widget', (req, res) => {
    const query = queryString.stringify(req.query);
    const url = `${MCLA_WIDGET_URL}?${query}`;

    fetch(url)
        .then(r => r.text())
        .then(render)
        .then(t => {
            res.type('application/javascript');
            res.send(t)
        })
        .catch(e => {
            console.log(`Error: ${e}`);
            res.send(e)
        });
});

module.exports = app;