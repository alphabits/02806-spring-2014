select Username from RequestLogUserCounts group by Username having count(*) > 3

select 
	uniqueusers.d, 
	uniqueusers.c, 
	signups.c, 
	uniqueusers.c - signups.c
from (
	select 
		Date as d, 
		count(*) as c 
	from RequestLogUserCounts
	group by Date	
) as uniqueusers, (
	select 
		cast(Info_createdat as date) as d, 
		count(*) as c 
	from UserProfile 
	where info_createdat > '2013-12-01' 
	group by cast(Info_createdat as date)
) as signups
where uniqueusers.d=signups.d



select * from UserProfile where Info_CreatedAt > '2013-12-01' and DotNetMembershipUserName in (
	select Username from RequestLogUserCounts group by Username having count(*) > 10
)