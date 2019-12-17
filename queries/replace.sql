select * from artists
where
	artistName like '% feat %'
	or artistName like '% featuring %'
	or artistName like '% feat. %'
	or artistName like '%(feat%)'
;



select * from artists order by rand() limit 20;
select * from artists where artistName like '%(%';



update artists set artistName = replace(artistName, '&quot;', '"');
update artists set artistName = replace(artistName, '&amp;', '&');
update artists set artistName = replace(artistName, '&#039;', '\'');

select replace(artistName, '&#039;', '\'') from artists where id=4229;