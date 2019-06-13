select case when a.artistName = 'Elvis Presley With The Jordanaires' then 'Elvis Presley' else a.artistName end as artistName2, sum(101 - r.ranking) as score
from rankings as r
inner join songs as s on r.songId=s.id
inner join artists as a on s.artistId=a.id
group by artistName2 order by score desc limit 100;
