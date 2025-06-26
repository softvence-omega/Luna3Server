export const getAggregationStages = (period: 'daily' | 'weekly' | 'monthly') => {
    if (period === 'daily') {
      return {
        addFields: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        groupBy: "$day",
      };
    } else if (period === 'weekly') {
      return {
        addFields: {
          year: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" },
        },
        groupBy: { year: "$year", week: "$week" },
      };
    } else {
      return {
        addFields: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        },
        groupBy: "$month",
      };
    }
  };
  