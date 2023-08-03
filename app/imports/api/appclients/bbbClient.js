import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import logServer, { levels, scopes } from '../logging';
import Groups from '../groups/groups';
import { testMeteorSettingsUrl } from '../../ui/utils/utilsFuncs';

const bbbEnabled = Meteor.settings.public.enableBBB;

class BigBlueButtonClient {
  constructor() {
    this.bbbURL = testMeteorSettingsUrl(Meteor.settings.public.BBBUrl);
    this.bbbSecret = Meteor.settings.private.BBBSecret;
  }

  buildParams(callName, params) {
    const queryString = new URLSearchParams(params).toString();
    const data = `${callName}${queryString}${this.bbbSecret}`;
    const sha1sum = crypto.createHash('sha1').update(data, 'binary').digest('hex');
    return { ...params, checksum: sha1sum };
  }

  buildURL(callName, params) {
    // calculate SHA-1 checksum fot API call and return final URL
    const finalParams = this.buildParams(callName, params);
    const queryString = new URLSearchParams(finalParams).toString();
    return `${this.bbbURL}/${callName}?${queryString}`;
  }

  createMeeting(slug, userId, meetingParams) {
    // create a meeting for group associated with slug and return join URL for current user
    const group = Groups.findOne({ slug });
    // update defaultparams with given meetingParams
    const defaultParams = {
      name: i18n.__('api.bbb.meetingName', { name: group.name }),
      meetingID: `${group._id}_${slug}`,
      // allow connections with guest=true parameter. default : ALWAYS_ACCEPT
      guestPolicy: 'ASK_MODERATOR',
      // allow moderators to record the session (needs record:true ?)
      allowStartStopRecording: true,
      autoStartRecording: false,
      welcome: i18n.__('api.bbb.welcomeMsg', { name: group.name }),
    };
    // CAN USE THIS IF KEEPING PASSWORD BETWEEN SESSIONS IS SECURE
    // if (group.meeting.attendeePW) {
    //   // Reuse previously generated passwords if already defined
    //   // (otherwise bbb will complain that meeting with this id already exists)
    //   defaultParams.attendeePW = group.meeting.attendeePW;
    //   defaultParams.moderatorPW = group.meeting.moderatorPW;
    // }
    const params = this.buildParams('create', { ...defaultParams, ...meetingParams });
    return axios
      .get(`${this.bbbURL}/create`, {
        params: new URLSearchParams(params),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/xml',
        },
      })
      .then((response) =>
        parseStringPromise(response.data).then((result) => {
          if (result.response.returncode[0] === 'SUCCESS') {
            // store passwords in group
            // store createTime and send with join to forbid URL replays ?
            const meetingData = {
              createTime: result.response.createTime[0],
              attendeePW: result.response.attendeePW[0],
              moderatorPW: result.response.moderatorPW[0],
            };
            Groups.update(group._id, {
              $set: {
                meeting: meetingData,
              },
            });
            // logServer(`meeting created: ${JSON.stringify(meetingData)}`);
            logServer(
              `APPCLIENT - BBBCLIENT - createMeeting - meeting created: ${JSON.stringify(meetingData)}`,
              levels.INFO,
              scopes.SYSTEM,
              {
                meetingData,
                slug,
                userId,
              },
            );
            return Promise.resolve(this.getJoinURL(slug, userId));
          }
          if (result.response.messageKey[0] === 'idNotUnique') {
            // a meeting has already been created, ignore this error
            return Promise.resolve(this.getJoinURL(slug, userId));
          }
          logServer(
            `APPCLIENT - BBBCLIENT - METEOR ERROR -
             createMeeting - BBB create meeting Error: ${result.response.messageKey[0]}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
          // use messageKey if translation needed
          throw new Meteor.Error('api.BBBClient.createMeeting.error', result.response.messageKey[0]);
        }),
      )
      .catch((err) => {
        // logServer(`BBB create error: ${err}`, 'error');
        logServer(`APPCLIENT - BBBCLIENT - createMeeting - BBB create error: ${err}`, levels.ERROR, scopes.SYSTEM, {
          slug,
          userId,
          meetingParams,
        });
        throw new Meteor.Error('api.BBBClient.createMeeting.error', i18n.__('api.bbb.createError'));
      });
  }

  getJoinURL(slug, userId, displayName) {
    // check is user is attendee or moderator
    const group = Groups.findOne({ slug });
    const user = Meteor.users.findOne(userId);
    const joinPwd = Roles.userIsInRole(userId, ['admin', 'animator'], group._id)
      ? group.meeting.moderatorPW
      : group.meeting.attendeePW;
    const { createTime } = group.meeting;
    let fullName = displayName;
    if (displayName === undefined) {
      fullName = `${user.firstName} ${user.lastName}`;
    }
    // get user display name from users collection or ask user each time ?
    const params = {
      meetingID: `${group._id}_${slug}`,
      fullName,
      password: joinPwd,
      createTime,
      redirect: true,
      // joinViaHtml5: true,
    };
    return this.buildURL('join', params);
  }

  checkRunning(groupId, slug) {
    const params = this.buildParams('isMeetingRunning', { meetingID: `${groupId}_${slug}` });
    return axios
      .get(`${this.bbbURL}/isMeetingRunning`, {
        params: new URLSearchParams(params),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/xml',
        },
      })
      .then((response) =>
        parseStringPromise(response.data).then((result) => {
          if (result.response.returncode[0] === 'SUCCESS') {
            return Promise.resolve(result.response.running);
          }
          logServer(
            `APPCLIENT - BBBCLIENT - METEOR ERROR - checkRunning - 
            BBB check runnning: ${result.response.messageKey[0]}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
          // use messageKey if translation needed
          throw new Meteor.Error('api.BBBClient.checkRunning.error', result.response.messageKey[0]);
        }),
      )
      .catch((err) => {
        // logServer(`BBB checkRunning Error: ${JSON.stringify(err)}`);
        logServer(
          `APPCLIENT - BBBCLIENT - checkRunning - BBB checkRunning Error: ${JSON.stringify(err)}`,
          levels.ERROR,
          scopes.SYSTEM,
          {
            slug,
            groupId,
          },
        );
        return Promise.resolve(null);
      });
  }

  getMeetings() {
    const params = this.buildParams('getMeetings', {});
    return axios
      .get(`${this.bbbURL}/getMeetings`, {
        params: new URLSearchParams(params),
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          Accept: 'application/xml',
        },
      })
      .then((response) =>
        parseStringPromise(response.data).then((result) => {
          if (result.response.returncode[0] === 'SUCCESS') {
            return Promise.resolve(result.response.meetings);
          }
          logServer(
            `APPCLIENT - BBBCLIENT - METEOR ERROR - getMeetings - 
            BBB message missing: ${result.response.messageKey[0]}`,
            levels.INFO,
            scopes.SYSTEM,
            {},
          );
          // use messageKey if translation needed
          throw new Meteor.Error('api.BBBClient.getMeetings.error', result.response.messageKey[0]);
        }),
      )
      .catch((err) => {
        // logServer(`BBB getMeetings Error: ${JSON.stringify(err)}`);
        logServer(
          `APPCLIENT - BBBCLIENT - getMeetings - BBB getMeetings Error: ${JSON.stringify(err)}`,
          levels.ERROR,
          scopes.SYSTEM,
          {},
        );
        return Promise.resolve(null);
      });
  }
}

let Client = null;
if (Meteor.isServer && bbbEnabled) {
  Client = new BigBlueButtonClient();
  // logServer(i18n.__('api.bbb.checkConfig', { URL: Client.bbbURL }));
  logServer(
    `APPCLIENT - BBBCLIENT - ${i18n.__('api.bbb.checkConfig', { URL: Client.bbbURL })}`,
    levels.INFO,
    scopes.SYSTEM,
    {
      URL: Client.bbbURL,
    },
  );
  Client.getMeetings().then(() => {
    // console.log('*** ALL MEETINGS : ', JSON.stringify(response));
    // logServer(i18n.__('api.bbb.configOk'));
    logServer(`APPCLIENT - BBBCLIENT - ${i18n.__('api.bbb.configOk')}`, levels.INFO, scopes.SYSTEM, {
      URL: Client.bbbURL,
    });
  });
}
const BBBClient = Client;

export default BBBClient;
