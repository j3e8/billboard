select s.songTitle, a.artistName, score, numWeeks, highestRank, lowestRank, lastWeekOnList from (select songId, sum(101 - rank) as score, count(week) as numWeeks, min(rank) as highestRank, max(rank) as lowestRank, max(week) as lastWeekOnList from rankings group by songId) as r inner join songs as s on r.songId=s.id inner join artists as a on s.artistId=a.id order by score desc limit 100;
