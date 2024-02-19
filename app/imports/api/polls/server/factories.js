import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { faker } from '@faker-js/faker';
import Polls from '../polls';

Factory.define('poll', Polls, {
  title: () => Random.id(),
  description: faker.lorem.sentence(),
  active: true,
  groups: () => new Array(Math.floor(Math.random() * 10)).fill(0).forEach(() => Random.id()),
  public: () => !!Math.floor(Math.random()),
  allDay: () => !!Math.floor(Math.random()),
  dates: () =>
    new Array(Math.floor(Math.random() * 10)).fill({
      date: new Date(Date.now() + Math.floor(Math.random() * 7) * 1000 * 60 * 60 * 24),
      slots: new Array(Math.floor(Math.random() * 4)).fill(
        `${Math.floor(Math.random() * 23)}:${Math.floor(Math.random() * 59)}`,
      ),
    }),
});
