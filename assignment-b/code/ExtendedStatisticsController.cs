using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WorkBoxBLL;
using WorkBoxBLL.DAL;

namespace WorkBox.Controllers
{


    public class PreOrderPaymentSummary
    {
        public DateTime Date { get; set; }
        public DateTime SignupDate { get; set; }
        public decimal Amount { get; set; }
        public bool IsFirst { get; set; }
        public bool IsMonthly { get { return Amount < 300m; } }
        public bool IsYearly { get { return !IsMonthly; } }
        public string ProductType { get { return IsMonthly ? "Monthly" : "Yearly"; } }

        public int DaysAfterSignup
        {
            get { return (Date - SignupDate).Days; }
        }
    }

    public class DailySalesCount
    {
        public string Date { get; set; }
        public int NewMonthlyCount { get; set; }
        public int NewYearlyCount { get; set; }
        public int RenewedMonthlyCount { get; set; }
        public int RenewedYearlyCount { get; set; }
        public decimal TotalIncome { get; set; }
        public int TotalSalesCount 
        { 
            get
            {
                return NewMonthlyCount + NewYearlyCount + RenewedMonthlyCount + RenewedYearlyCount;
            } 
        }
    }

    public class DailyActivity
    {
        public string Date { get; set; }
        public int UniqueUsers { get; set; }
        public int PageViews { get; set; }
    }

    public class OrganizationIncome
    {
        public decimal Income { get; set; }
    }

    public class ExtendedStatisticsController : ApiController
    {

        private static IEnumerable<PreOrderPaymentSummary> GetPreOrderPaymentSummary()
        {
            using (var conn = DbHelper.GetConnection())
            {
                return conn.Query<PreOrderPaymentSummary>(@"
                        select 
                            Cast(CreatedAt as Date) as Date,
                            Cast(up.Info_CreatedAt as Date) as SignupDate,
                            Amount,
                            CASE WHEN (
                                SELECT count(*) 
                                from PreOrderPayments pop2 
                                where 
                                    pop2.CreatedAt < pop1.CreatedAt and 
                                    pop2.CreatedAt is not null and 
                                    pop2.PreOrderId=pop1.PreOrderId) = 0 THEN 1 ELSE 0 END as IsFirst
                        from PreOrderPayments pop1, OrganizationMemberships om, UserProfile up
                        where CreatedAt is not null and AMount is not null and om.OrganizationId=pop1.OrganizationId and om.UserId=up.UserId
                        order by CreatedAt")
                   .Where(pop => pop.Date.Year > 2013);
            }
        }

        private static IEnumerable<DailySalesCount> GetDailySalesStats()
        {
            return
                GetPreOrderPaymentSummary()
                    .GroupBy(pop => pop.Date)
                    .Select(g => new DailySalesCount
                    {
                        Date = g.Key.Date.ToString("yyyy-MM-dd"),
                        NewMonthlyCount = g.Count(pop => pop.IsFirst && pop.IsMonthly),
                        NewYearlyCount = g.Count(pop => pop.IsFirst && pop.IsYearly),
                        RenewedMonthlyCount = g.Count(pop => !pop.IsFirst && pop.IsMonthly),
                        RenewedYearlyCount = g.Count(pop => !pop.IsFirst && pop.IsYearly),
                        TotalIncome = g.Sum(pop => pop.Amount)
                    })
                    .OrderByDescending(dsc => dsc.Date)
                    .Take(60)
                    .Reverse();
        }


        private Dictionary<string, Func<IEnumerable<object>>> _typeToActions = new Dictionary<string, Func<IEnumerable<object>>>
        {
            {"daily-sales", GetDailySalesStats},
            {"daily-activity", GetDailyActivity},
            {"signup-count-by-hours", GetSignupCountByHours},
            {"first-payments", GetFirstPayments},
            {"days-after-signup", GetDaysAfterSignup},
            {"organization-income", GetOrganizationIncome}
        }; 

        public IEnumerable<object> Get(string type)
        {
            if (!_typeToActions.ContainsKey(type))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            return _typeToActions[type]();
        }

        public static IEnumerable<OrganizationIncome> GetOrganizationIncome()
        {
            using (var db = DbHelper.GetConnection())
            {
                return db.Query<OrganizationIncome>("select Income from IncomeByOrganization where Income < 1.2e6 and Income >= 0");
            }
        } 

        public static IEnumerable<PreOrderPaymentSummary> GetDaysAfterSignup()
        {
            return GetPreOrderPaymentSummary().Where(pop => pop.IsFirst && pop.SignupDate.Year >= 2013);
        }

        public static IEnumerable<PreOrderPaymentSummary> GetFirstPayments()
        {
            return GetPreOrderPaymentSummary().Where(pop => pop.IsFirst);
        }

        private class DateCount
        {
            public DateTime Date { get; set; }
            public int Count { get; set; }
        }
        public static IEnumerable<DailyActivity> GetDailyActivity()
        {
            using (var db = DbHelper.GetConnection())
            {
                var uniqueUsers =
                    db.Query<DateCount>("select Date, Count(*) as Count from RequestLogUserCounts group by Date").OrderBy(dc => dc.Date);
                var activity =
                    db.Query<DateCount>("select Date, SUM(Cnt) as Count from RequestLogUserCounts group by Date").OrderBy(dc => dc.Date);

                return uniqueUsers.Zip(activity, (uniq, act) => new DailyActivity
                {
                    Date = uniq.Date.ToString("yyyy-MM-dd"),
                    PageViews = act.Count,
                    UniqueUsers = uniq.Count
                });
            }
        }

        public class SignupCountByHour
        {
            public int Hour { get; set; }
            public int Signups { get; set; }
        }
        public static IEnumerable<SignupCountByHour> GetSignupCountByHours()
        {
            using (var db = DbHelper.GetConnection())
            {
                return
                    db.Query<SignupCountByHour>(@"
                        select DATEPART(hour, Info_CreatedAt) hour, Count(*) signups 
                        from UserProfile 
                        where Info_CreatedAt > '2013-01-01' 
                        group by DATEPART(hour, Info_CreatedAt)").OrderBy(sc => sc.Hour);
            }
        }

    }
}
