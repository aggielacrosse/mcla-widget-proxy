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

const IMAGE_REGEX = /background-image:url\('\/\/img\.mcla\.us\/teams\/logos\/(\d+)\.png'\);/;
const ONCLICK_REGEX = /window\.open\('http:\/\/mcla.us\/game\/\d+'\)/

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([ 'img', 'style', 'tfoot' ]);
const allowedAttributes = sanitizeHtml.defaults.allowedAttributes;
allowedAttributes['th'] = ['colspan'];
allowedAttributes['*'] = ['style', 'class', 'id'];
allowedAttributes['tr'] = ['onclick'];
const transformTags = {
    'i': (tagName, attribs) => {
        const styleImageMatches = attribs.style.match(IMAGE_REGEX);
        if (styleImageMatches) {
            attribs.style = `background-image:url(\'http://img.mcla.us/teams/logos/${styleImageMatches[1]}.png');`
        }
        return {
            tagName,
            attribs
        }
    },
    'tr': (tagName, attribs) => {
        if (!ONCLICK_REGEX.test(attribs.onclick)) {
            delete attribs.onclick;
        }
        return {
            tagName,
            attribs
        }
    }
}

const render = (widgetSource) => {
    try {
        const regex = new RegExp(`${ESCAPED_PREFIX}(.*)${ESCAPED_POSTFIX}`);
        const [all, src] = widgetSource.match(regex);
        const raw = unescape(src);
        const sanitized = sanitizeHtml(raw, {
            allowedTags,
            allowedAttributes,
            transformTags
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