'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  createArtistsTable(db)
  .then(() => createSongsTable(db))
  .then(() => createRankingsTable(db))
  .then(callback)
  .catch((error) => console.log(error));
};

exports.down = function(db, callback) {
  dropArtistsTable(db)
  .then(() => dropSongsTable(db))
  .then(() => dropRankingsTable(db))
  .then(callback)
  .catch((error) => console.log(error));
};


function createArtistsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("creating artists table");
    db.runSql(`CREATE TABLE IF NOT EXISTS artists
      (
        id int primary key auto_increment,
        artistName varchar(100)
      )`
    , function() {
      resolve();
    });
  });
}

function createSongsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("creating songs table");
    db.runSql(`CREATE TABLE IF NOT EXISTS songs
      (
        id int primary key auto_increment,
        songTitle varchar(100),
        artistId int not null
      )`
    , function() {
      resolve();
    });
  });
}

function createRankingsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("creating rankings table");
    db.runSql(`CREATE TABLE IF NOT EXISTS rankings
      (
        week timestamp,
        songId int not null,
        ranking tinyint,
        PRIMARY KEY (week, songId)
      )`
    , function(err) {
      if (err) {
        console.error(err);
      }
      resolve();
    });
  });
}



function dropArtistsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("dropping artists table");
    db.dropTable('artists', function() {
      resolve();
    });
  });
}

function dropSongsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("dropping songs table");
    db.dropTable('songs', function() {
      resolve();
    });
  });
}

function dropRankingsTable(db) {
  return new Promise(function(resolve, reject) {
    console.log("dropping rankings table");
    db.dropTable('rankings', function() {
      resolve();
    });
  });
}
