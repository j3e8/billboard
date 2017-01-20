select a.artistName, count(r.week) as numberOfSongs from rankings as r inner join songs as s on r.songId=s.idjoin artists as a on s.artistId=a.id group by a.artistName order by numberOfSongs desc;
