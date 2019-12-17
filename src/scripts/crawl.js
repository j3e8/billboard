let request = require('request');
let moment = require('moment');
let db = require('../connections/mysql_database.js');

const initialUrl = 'http://www.billboard.com/charts/hot-100/2017-01-21';
const baseUrl = 'http://www.billboard.com/charts/hot-100/';

const reggie = /data-rank="([\d]+)"\s*data-artist="(.+?)"\s*data-title="(.+?)"/mgi;

const initialDate = moment(process.argv[2]).toDate();
const endDate = moment(process.argv[3]).toDate();

console.log(initialDate, endDate);

crawl(initialDate, endDate)
.then(() => {
  console.log('done');
  process.exit();
})
.catch((err) => {
  console.log(err);
  process.exit();
});

function crawl(date, endDate) {
  if (date < endDate) {
    return Promise.resolve();
  }

  return loadOneWeek(date)
  .then((html) => parseStandings(html))
  .then((list) => insertStandings(date, list))
  .then(() => {
    let newDate = moment(date).subtract(7, 'days').toDate();
    return sleep(5000)
      .then(() => crawl(newDate, endDate));
  })
}

function loadOneWeek(date) {
  return new Promise((resolve, reject) => {
    let dateString = dateToString(date);
    console.log('loadOneWeek', baseUrl + dateString);
    request({
      url: baseUrl + dateString,
      method: 'GET'
    }, function(error, response, body) {
      if (error) {
        return reject(error);
      }
      if (response.statusCode == 200) {
        resolve(body);
      }
      return reject("Unknown error loading week's data");
    });
  });
}

function dateToString(date) {
  let yr = date.getFullYear();
  let mo = String(date.getMonth() + 1);
  if (mo.length < 2) {
    mo = '0' + mo;
  }
  let dy = String(date.getDate());
  if (dy.length < 2) {
    dy = '0' + dy;
  }
  return `${yr}-${mo}-${dy}`;
}

function parseStandings(html) {
  let standings = [];
  let match;
  while (match = reggie.exec(html)) {
    standings.push({
      ranking: match[1],
      artist: match[2],
      title: match[3],
    });
  }
  return Promise.resolve(standings);
}

function insertStandings(date, list) {
  let iter = list[Symbol.iterator]();
  return iterateStandings(date, iter);
}

function iterateStandings(date, iter) {
  let iteration = iter.next();
  if (iteration.done) {
    return Promise.resolve();
  }
  let standing = iteration.value;
  return insertStanding(date, standing)
  .then(() => iterateStandings(date, iter));
}

function insertStanding(date, standing) {
  return findOrInsertArtist(standing.artist)
  .then((artist) => {
    return findOrInsertSong(artist.id, standing.title)
  })
  .then((song) => {
    return insertRanking(date, song.id, standing.ranking)
  });
}




function findOrInsertArtist(artistName) {
  return getArtistByName(artistName)
  .then((artist) => {
    if (artist) {
      return Promise.resolve(artist);
    }
    return insertArtist(artistName);
  });
}

function getArtistByName(artistName) {
  return new Promise((resolve, reject) => {
    let _artistName = db.escape(artistName);
    db.query(`SELECT id, artistName FROM artists
      WHERE artistName=${_artistName}`,
    function(err, rows) {
      if (err) {
        return reject(err);
      }
      if (!rows || !rows.length) {
        return resolve(null);
      }
      resolve(rows[0]);
    })
  });
}

function insertArtist(artistName) {
  return new Promise((resolve, reject) => {
    let artist = {
      artistName: artistName
    };

    db.query(`INSERT INTO artists
      SET ?`, artist,
    function(err, result) {
      if (err) {
        return reject(err);
      }
      resolve({
        id: result.insertId,
        artistName: artistName
      });
    });
  });
}




function findOrInsertSong(artistId, songTitle) {
  return getSongByName(artistId, songTitle)
  .then((song) => {
    if (song) {
      return Promise.resolve(song);
    }
    return insertSong(artistId, songTitle);
  });
}

function getSongByName(artistId, songTitle) {
  return new Promise((resolve, reject) => {
    let _artistId = db.escape(artistId);
    let _songTitle = db.escape(songTitle);
    db.query(`SELECT id, songTitle
      FROM songs
      WHERE artistId=${_artistId}
      AND songTitle=${_songTitle}`,
    function(err, rows) {
      if (err) {
        return reject(err);
      }
      if (!rows || !rows.length) {
        return resolve(null);
      }
      resolve(rows[0]);
    })
  });
}

function insertSong(artistId, songTitle) {
  return new Promise((resolve, reject) => {
    let song = {
      artistId: artistId,
      songTitle: songTitle
    };

    db.query(`INSERT INTO songs
      SET ?`, song,
    function(err, result) {
      if (err) {
        return reject(err);
      }
      resolve({
        id: result.insertId,
        artistId, artistId,
        songTitle: songTitle
      });
    });
  });
}




function insertRanking(date, songId, r) {
  return new Promise((resolve, reject) => {
    let ranking = {
      week: moment(date).format('YYYY-MM-DD HH:mm:ss'),
      songId: songId,
      ranking: r
    };

    db.query(`REPLACE INTO rankings
      SET ?`, ranking,
    function(err, result) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}


function htmlEntityReplace(str) {
  return str.replace('&amp;', '&').replace('&#039;', '\'');
}

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
