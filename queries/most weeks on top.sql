select a.artistName, count(r.week) as weeks from rankings as r inner join songs as s on r.songId=s.id inner join artists as a on s.artistId=a.id where week > '2016-01-01' and week < '2017-01-01' and rank=1 group by a.artistName order by weeks desc;
