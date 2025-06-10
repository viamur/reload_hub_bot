import {MyContext} from '../types/types';
import {generateAdminStatsMessage} from '../utils/generateMessage';
import {User} from '../models/User';
import {PickupRequest} from '../models/PickupRequest';
import {Collaboration} from '../models/Collaboration';

export async function commandStats(start: Date, end: Date, ctx: MyContext) {
  const pickupCount = await PickupRequest.countDocuments({
    createdAt: { $gte: start, $lt: end }
  });

  const collaborateCount = await Collaboration.countDocuments({
    createdAt: { $gte: start, $lt: end }
  });

  const newUsersCount = await User.countDocuments({
    createdAt: { $gte: start, $lt: end }
  });

  const weightResult = await PickupRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: null,
        totalWeight: { $sum: "$weight" }
      }
    }
  ]);

  const amountResult = await PickupRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  const districts = await PickupRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: "$region",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ])

  const topDistricts = districts.map((r) => ({ name: r._id || "Невідомо", count: r.count }))
  const totalWeightKg = weightResult[0]?.totalWeight || 0;
  const totalAmount = amountResult[0]?.totalAmount || 0;
  const periodLabel = start.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const message = generateAdminStatsMessage({
    periodLabel,
    pickupCount,
    collaborateCount,
    newUsersCount,
    totalWeightKg,
    totalAmount,
    topDistricts
  });

  await ctx.reply(message, { parse_mode: "HTML" });
}

export const commandStatsToday = async (ctx: MyContext) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  await commandStats(today, tomorrow, ctx);
}

export const commandStatsThisMonth = async (ctx: MyContext) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  await commandStats(startOfMonth, startOfNextMonth, ctx);
}
