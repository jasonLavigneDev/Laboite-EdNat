import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';
import { UserStatus } from 'meteor/mizzao:user-status';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SyncedCron } from 'meteor/littledata:synced-cron';
import moment from 'moment';
import SimpleSchema from 'simpl-schema';
import AnalyticsEvents from '../analyticsEvents';
import Structures from '../../structures/structures';

export const getConnectionInfo = new ValidatedMethod({
  name: 'analytics.getConnectionInfo',
  validate: null,
  run() {
    const connection = UserStatus.connections.findOne({ _id: this.connection.id });
    const user = Meteor.user({ structure: 1 });
    const userStructureId = user?.structure || null;
    const structure = userStructureId
      ? Structures.findOne({ _id: userStructureId }, { name: 1, ancestorsIds: 1 })
      : null;
    const upperStructure = structure
      ? structure.ancestorsIds.length
        ? Structures.findOne({ _id: structure.ancestorsIds[0] }, { name: 1 })
        : structure
      : null;

    return { connection, upperStructure: upperStructure?.name || null };
  },
});

export const createAnalyticsEvents = new ValidatedMethod({
  name: 'analytics.createAnalyticsEvents',
  validate: AnalyticsEvents.schema.omit('count', 'structureId', 'createdAt').validator(),

  run(data) {
    const structure = this.userId ? Meteor.users.findOne({ _id: this.userId }).structure : null;
    return AnalyticsEvents.upsert(
      {
        structureId: structure,
        target: data.target,
        content: data.content,
        createdAt: new Date(moment().startOf('hour').format()),
      },
      {
        $inc: {
          count: 1,
        },
      },
    );
  },
});

export const analyticsConnectionsCounts = new ValidatedMethod({
  name: 'analytics.connections.counts',
  validate: new SimpleSchema({
    structureId: {
      type: String,
      optional: true,
    },
  }).validator(),

  run({ structureId }) {
    const additionalRequest = structureId ? { structure: structureId } : {};
    const connectedUsers = Meteor.users
      .find({ $or: [{ 'status.online': true }, { 'status.idle': true }] }, { fields: { structure: 1 } })
      .fetch();
    const structuresWithLoggedUsers = Structures.find(
      {
        _id: {
          $in: connectedUsers.map(({ structure }) => structure),
        },
      },
      { fields: { _id: 1, name: 1 } },
    ).fetch();
    const notLoggedCount = UserStatus.connections.find({ userId: { $exists: false } }).count() - 1;
    const subStructuresIds = Structures.find({ ancestorsIds: structureId }, { fields: { _id: 1 } })
      .fetch()
      .map((s) => s._id);

    if (structureId) {
      subStructuresIds.push(structureId);
    }

    const idle = Meteor.users.find({ ...additionalRequest, 'status.online': true, 'status.idle': true }).count();
    const idleWithSubStructures = Meteor.users
      .find({ structure: { $in: subStructuresIds }, 'status.online': true, 'status.idle': true })
      .count();
    const active = Meteor.users.find({ ...additionalRequest, 'status.online': true, 'status.idle': false }).count();
    const activeWithSubStructures = Meteor.users
      .find({ structure: { $in: subStructuresIds }, 'status.online': true, 'status.idle': false })
      .count();

    const result = {
      logged: connectedUsers.length,
      notLogged: notLoggedCount < 0 ? 0 : notLoggedCount,
      idle,
      idleWithSubStructures,
      active,
      activeWithSubStructures,
      newAccounts: Meteor.users
        .find({ ...additionalRequest, createdAt: { $gte: new Date(moment().subtract(2, 'days').format()) } })
        .count(),
      structures: structuresWithLoggedUsers.map(({ _id, name }) => ({
        name,
        _id,
        value: connectedUsers.filter(({ structure }) => structure === _id).length,
      })),
    };

    return result;
  },
});

const structureIdAndDateRangeSchema = {
  structureId: {
    type: String,
    optional: true,
  },
  dateRange: {
    type: Array,
    optional: true,
    min: 2,
    max: 2,
  },
  'dateRange.$': {
    type: Date,
  },
};

export const getActionClickedAnalyticsEvents = new ValidatedMethod({
  name: 'analytics.getActionClickedAnalyticsEvents',
  validate: new SimpleSchema(structureIdAndDateRangeSchema).validator(),
  run({ structureId, dateRange }) {
    const structure = Structures.findOne({ _id: structureId });
    const structureArrayWithChilds = [structureId, ...(structure?.childrenIds || [])];
    const $match = structure ? { structureId: { $in: structureArrayWithChilds } } : {};

    if (dateRange) {
      $match.createdAt = {
        $gte: new Date(dateRange[0]),
        $lte: new Date(dateRange[1]),
      };
    }

    const data = AnalyticsEvents.aggregate([
      { $match },
      {
        $group: {
          _id: '$content',
          count: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$structureId', null],
                },
                then: 0,
                else: '$count',
              },
            },
          },
          countNotConnected: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$structureId', null],
                },
                then: '$count',
                else: 0,
              },
            },
          },
          target: { $first: '$target' },
          content: { $first: '$content' },
        },
      },
    ]);
    return data;
  },
});

export const getExportableAnalyticsData = new ValidatedMethod({
  name: 'analytics.getExportableAnalyticsData',
  validate: new SimpleSchema(structureIdAndDateRangeSchema).validator(),
  run({ structureId, dateRange }) {
    // const structure = structureId ? Structures.findOne({ _id: structureId }) : null;
    // const structureArrayWithChilds = [structureId, ...(structure?.childrenIds || [])];
    const $match = structureId ? { $or: [{ _id: structureId }, { ancestorsIds: structureId }] } : {};

    const pipeline = [
      { $match },
      {
        $lookup: {
          from: 'analytics',
          // localField: '_id',
          // foreignField: 'structureId',
          as: 'analytics',
          let: { structId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$structureId', '$$structId'] },
                    { $gte: ['$createdAt', new Date(dateRange[0])] },
                    { $lte: ['$createdAt', new Date(dateRange[1])] },
                  ],
                },
              },
            },
          ],
        },
      },
      { $unwind: '$analytics' },
      {
        $project: {
          _id: 0,
          name: 1,
          count: '$analytics.count',
          target: '$analytics.target',
          content: '$analytics.content',
          at: '$analytics.createdAt',
        },
      },
      {
        $sort: {
          at: -1,
          name: 1,
          count: 1,
          target: 1,
          content: 1,
        },
      },
    ];

    const data = Structures.aggregate(pipeline);

    return data;
  },
});

export const analyticsChartData = new ValidatedMethod({
  name: 'analytics.chartdata',
  validate: new SimpleSchema({
    structureId: {
      type: String,
      optional: true,
    },
    content: {
      type: String,
    },
    target: {
      type: String,
    },
  }).validator(),

  run({ structureId, content, target }) {
    const structure = Structures.findOne({ _id: structureId });
    const structureArrayWithChilds = [structureId, ...(structure?.childrenIds || [])];

    const $facet = {};
    const timeslots = (Meteor.settings.public.analyticsExpirationInDays || 30) * 24;
    const now = moment().startOf('hour');

    new Array(timeslots).fill().forEach(() => {
      const date = now.format();
      const $match = {
        content,
        target,
        createdAt: new Date(date),
      };
      if (structureId) {
        $match.structureId = { $in: structureArrayWithChilds };
      }
      $facet[date] = [
        {
          $match,
        },
        {
          $group: {
            _id: '$createdAt',
            count: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ['$structureId', null],
                  },
                  then: 0,
                  else: '$count',
                },
              },
            },
            countNotConnected: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ['$structureId', null],
                  },
                  then: '$count',
                  else: 0,
                },
              },
            },
          },
        },
      ];
      now.subtract(1, 'hours');
    });

    const data = AnalyticsEvents.aggregate([{ $facet }])[0];
    return Object.keys(data)
      .map((key) => {
        return {
          count: data[key][0]?.count || 0,
          countNotConnected: data[key][0]?.countNotConnected || 0,
          slot: moment(key).format('dd - HH:mm'),
        };
      })
      .reverse();
  },
});

// Get list of all method names on Helps
const LISTS_METHODS = _.pluck([createAnalyticsEvents, getActionClickedAnalyticsEvents], 'name');

// Only allow 5 list operations per connection per second
DDPRateLimiter.addRule(
  {
    name(name) {
      return _.contains(LISTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    },
  },
  5,
  1000,
);

if (Meteor.settings.public.analyticsExpirationInDays) {
  SyncedCron.add({
    name: 'Delete analytics old data',
    schedule: function removeSchedule(parser) {
      return parser.text(`every day at 2:00 am`);
    },
    job: function removeOldData() {
      return AnalyticsEvents.remove({
        createdAt: {
          $lt: new Date(moment().subtract(Meteor.settings.public.analyticsExpirationInDays, 'days').format()),
        },
      });
    },
  });
}
