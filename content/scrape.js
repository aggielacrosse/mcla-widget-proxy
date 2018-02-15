const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const MAX_MISSES_IN_A_ROW = 50;

const url = (i) => {
    return `http://img.mcla.us/teams/logos/${i}.png`;
}

const makeDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

const writeImage = (name) => (readStream) => {
    const imgPath = path.resolve(__dirname, 'img', name);
    const writeStream = fs.createWriteStream(imgPath);
    readStream.pipe(writeStream);
}

const fetchAndWrite = (url, name) => {
    return fetch(url)
        .then(r => {
            if (r.ok) {
                return r.body
            } else {
                throw new Error(`Request error: ${r.status}`);
            }
        })
        .then(writeImage(name))
}

const fetchNext = ({ i = 0, misses = 0 } = {}) => {
    if (misses < MAX_MISSES_IN_A_ROW) {
        const resolvedUrl = url(i);
        console.log(`Fetching ${resolvedUrl}`);
        return fetchAndWrite(resolvedUrl, `${i}.png`)
            .then(() => fetchNext({ i: i+1 }))
            .catch((err) => {
                console.error(err.message);
                return fetchNext({ i: i+1, misses: misses+1 });
            })
    } else {
        console.log('Probably no more images. Finishing');
        return Promise.resolve();
    }
}


makeDirIfNotExists(path.resolve(__dirname, 'img'));
fetchNext()
    .catch(console.error);
fetchAndWrite('http://mcla.us/img/layout/logo-tiny.png', 'logo-tiny.png');