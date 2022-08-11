import * as errors from './errors';

export const mix = (mixins = []) => {
  return (funcToWrap) =>
    async function methodMixinWrapper(...args) {
      await Promise.all(
        mixins.map(async (mixin) => {
          return mixin.apply(this, args);
        }),
      );

      return funcToWrap.apply(this, args);
    };
};

export const checks = {
  isLoggedIn(...args) {
    if (!this.userId) {
      throw errors.Unauthorized();
    }
  },

  isAdmin() {
    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw errors.Unauthorized();
    }
  },

  isUserActive() {
    const user = Meteor.users.findOne(this.userId, { fields: { isActive: 1 } });

    return user?.isActive === true;
  },
};

export const noOp = mix([]);

export const isLoggedIn = mix([checks.isLoggedIn]);

export const isAdmin = mix([checks.isLoggedIn, checks.isAdmin]);

export const isUserActive = mix([checks.isLoggedIn, checks.isUserActive]);
