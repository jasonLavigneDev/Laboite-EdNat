import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { FindFromPublication } from 'meteor/percolate:find-from-publication';
import { publishComposite } from 'meteor/reywood:publish-composite';
import SimpleSchema from 'simpl-schema';
import logServer from '../../logging';
import Tags from '../../tags/tags';
import { checkPaginationParams, getLabel, isActive } from '../../utils';
import Articles from '../articles';
import Groups from '../../groups/groups';

// build query for all articles
const queryAllArticles = ({ nodrafts, search, userId }) => {
  const regex = new RegExp(search, 'i');
  const query = {
    userId,
    $or: [
      {
        title: { $regex: regex },
      },
      {
        content: { $regex: regex },
      },
    ],
  };
  if (nodrafts) {
    query.draft = { $ne: true };
  }
  return query;
};

Meteor.methods({
  'get_articles.all_count': function getArticlesAllCount({ nodrafts, search, userId }) {
    try {
      const query = queryAllArticles({ nodrafts, search, userId: userId || this.userId });
      return Articles.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing articles
FindFromPublication.publish(
  'articles.all',
  function articlesAll({ nodrafts, page, search, itemPerPage, userId, ...rest }) {
    try {
      new SimpleSchema({
        userId: {
          optional: true,
          type: String,
          regEx: SimpleSchema.RegEx.Id,
          label: getLabel('api.users.labels.id'),
        },
      })
        .extend(checkPaginationParams)
        .validate({ page, itemPerPage, userId, search });
    } catch (err) {
      logServer(`publish articles.all : ${err}`);
      this.error(err);
    }

    try {
      const query = queryAllArticles({ nodrafts, search, userId: userId || this.userId });

      return Articles.find(query, {
        fields: Articles.publicFields,
        skip: itemPerPage * (page - 1),
        limit: itemPerPage,
        sort: { createdAt: -1 },
        ...rest,
      });
    } catch (error) {
      return this.ready();
    }
  },
);

// publish one article based on its slug
FindFromPublication.publish('articles.one.admin', ({ slug }) => {
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.articles.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish articles.one : ${err}`);
    this.error(err);
  }
  return Articles.find(
    { slug },
    {
      fields: Articles.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
});

publishComposite('articles.one', ({ slug }) => {
  try {
    new SimpleSchema({
      slug: {
        type: String,
        label: getLabel('api.articles.labels.slug'),
      },
    }).validate({ slug });
  } catch (err) {
    logServer(`publish articles.one : ${err}`);
    this.error(err);
  }
  return {
    find() {
      // Find top ten highest scoring posts
      return Articles.find(
        { slug },
        {
          fields: Articles.PublicFields,
          limit: 1,
          sort: { name: -1 },
        },
      );
    },
    children: [
      {
        find({ tags = [] }) {
          // Find asssociated tags
          return Tags.find({ _id: { $in: tags } }, { fields: Tags.publicFields, sort: { name: 1 }, limit: 1000 });
        },
      },
    ],
  };
});

// build query for all articles from group
const queryGroupArticles = ({ search, group }) => {
  const regex = new RegExp(search, 'i');
  const fieldsToSearch = ['title', 'description'];
  const searchQuery = fieldsToSearch.map((field) => ({
    [field]: { $regex: regex },
    groups: { $elemMatch: { _id: group._id } },
  }));
  return {
    $or: searchQuery,
  };
};

Meteor.methods({
  'get_groups.articles_count': function getArticlesGroupCount({ search, slug }) {
    try {
      const group = Groups.findOne(
        { slug },
        {
          fields: Groups.allPublicFields,
          limit: 1,
          sort: { name: -1 },
        },
      );
      const query = queryGroupArticles({ search, group });
      return Articles.find(query).count();
    } catch (error) {
      return 0;
    }
  },
});

// publish all existing articles for specific group
FindFromPublication.publish('groups.articles', function groupsArticles({ page, search, slug, itemPerPage, ...rest }) {
  if (!isActive(this.userId)) {
    return this.ready();
  }
  try {
    checkPaginationParams.validate({ page, itemPerPage, search });
  } catch (err) {
    logServer(`publish groups.articles : ${err}`);
    this.error(err);
  }
  const group = Groups.findOne(
    { slug },
    {
      fields: Groups.allPublicFields,
      limit: 1,
      sort: { name: -1 },
    },
  );
  // for protected/private groups, publish articles only for allowed users
  if (
    group === undefined ||
    (group.type !== 0 && !Roles.userIsInRole(this.userId, ['admin', 'animator', 'member'], group._id))
  ) {
    return this.ready();
  }

  try {
    const query = queryGroupArticles({ search, group });
    const res = Articles.find(query, {
      fields: Articles.publicFields,
      skip: itemPerPage * (page - 1),
      limit: itemPerPage,
      sort: { updatedAt: -1 },
      ...rest,
    });

    return res;
  } catch (error) {
    return this.ready();
  }
});
