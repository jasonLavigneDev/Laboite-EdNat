import { faker } from '@faker-js/faker';
import { Factory } from 'meteor/dburles:factory';
import { Random } from 'meteor/random';
import moment from 'moment';
import EventsAgenda from '../eventsAgenda';

const randomBoolean = () => Boolean(Math.round(Math.random()));

Factory.define('eventAgenda', EventsAgenda, {
  title: () => faker.lorem.sentence(),
  description: () => faker.lorem.paragraph(),
  userId: () => Random.id(),
  location: () => faker.location.city(),
  recurrent: () => randomBoolean(),
  daysOfWeek: () => [Math.round(Math.random() * 7)],
  startRecur: () => new Date(moment().format()),
  endRecur: () => new Date(moment().add(1, 'months').format()),
  start: () => new Date(moment().add(7, 'days').format()),
  end: () => new Date(moment().add(7, 'days').add(1, 'hour').format()),
  allDay: () => randomBoolean(),
  groups: () => [
    { _id: Random.id(), name: faker.company.name() },
    { _id: Random.id(), name: faker.company.name() },
  ],
  participants: () => {
    const users = [1, 2, 3];
    return users.map(() => ({
      _id: Random.id(),
      email: faker.internet.email(),
      status: Math.round(Math.random() * 2),
    }));
  },
  guests: () => [faker.internet.email(), faker.internet.email()],
});
