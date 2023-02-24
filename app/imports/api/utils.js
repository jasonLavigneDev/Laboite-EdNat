import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';
import SimpleSchema from 'simpl-schema';
import { testMeteorSettingsUrl } from '../ui/utils/utilsFuncs';

export function isActive(userId) {
  if (!userId) return false;
  const user = Meteor.users.findOne(userId, { fields: { isActive: 1 } });
  if (user.isActive === true) return true;
  return false;
}

export function getLabel(i18nLabel) {
  return () => i18n.__(i18nLabel);
}

export const checkPaginationParams = new SimpleSchema({
  page: { type: SimpleSchema.Integer, defaultValue: 1, label: getLabel('api.methods.labels.page') },
  itemPerPage: { type: SimpleSchema.Integer, defaultValue: 10, label: getLabel('api.methods.labels.pageSize') },
  search: { type: String, defaultValue: '', label: getLabel('api.methods.labels.filter') },
});

export function registerSchemaMessages() {
  const regExpMessages = [
    { exp: SimpleSchema.RegEx.Email, msg: 'SimpleSchema.RegEx.Email' },
    { exp: SimpleSchema.RegEx.EmailWithTLD, msg: 'SimpleSchema.RegEx.EmailWithTLD' },
    { exp: SimpleSchema.RegEx.Domain, msg: 'SimpleSchema.RegEx.Domain' },
    { exp: SimpleSchema.RegEx.WeakDomain, msg: 'SimpleSchema.RegEx.WeakDomain' },
    { exp: SimpleSchema.RegEx.IP, msg: 'SimpleSchema.RegEx.IP' },
    { exp: SimpleSchema.RegEx.IPv4, msg: 'SimpleSchema.RegEx.IPv4' },
    { exp: SimpleSchema.RegEx.IPv6, msg: 'SimpleSchema.RegEx.IPv6' },
    { exp: SimpleSchema.RegEx.Url, msg: 'SimpleSchema.RegEx.Url' },
    { exp: SimpleSchema.RegEx.Id, msg: 'SimpleSchema.RegEx.Id' },
    { exp: SimpleSchema.RegEx.ZipCode, msg: 'SimpleSchema.RegEx.ZipCode' },
    { exp: SimpleSchema.RegEx.Phone, msg: 'SimpleSchema.RegEx.Phone' },
  ];
  SimpleSchema.setDefaultMessages({
    messages: {
      en: {
        required: (ctx) => i18n.__('SimpleSchema.required', ctx),
        minString: (ctx) => i18n.__('SimpleSchema.minString', ctx),
        maxString: (ctx) => i18n.__('SimpleSchema.maxString', ctx),
        minNumber: (ctx) => i18n.__('SimpleSchema.minNumber', ctx),
        maxNumber: (ctx) => i18n.__('SimpleSchema.maxNumber', ctx),
        minNumberExclusive: (ctx) => i18n.__('SimpleSchema.minNumberExclusive', ctx),
        maxNumberExclusive: (ctx) => i18n.__('SimpleSchema.maxNumberExclusive', ctx),
        minDate: (ctx) => i18n.__('SimpleSchema.minDate', ctx),
        maxDate: (ctx) => i18n.__('SimpleSchema.maxDate', ctx),
        badDate: (ctx) => i18n.__('SimpleSchema.badDate', ctx),
        minCount: (ctx) => i18n.__('SimpleSchema.minCount', ctx),
        maxCount: (ctx) => i18n.__('SimpleSchema.maxCount', ctx),
        noDecimal: (ctx) => i18n.__('SimpleSchema.noDecimal', ctx),
        notAllowed: (ctx) => i18n.__('SimpleSchema.notAllowed', ctx),
        expectedType: (ctx) => {
          const finalCtx = { ...ctx };
          const i18nEntry = `SimpleSchema.dataTypes.${ctx.dataType}`;
          const typeTranslated = i18n.__(i18nEntry);
          if (typeTranslated !== i18nEntry) {
            // translatation for type is available
            finalCtx.dataType = typeTranslated;
          }
          return i18n.__('SimpleSchema.expectedType', finalCtx);
        },
        keyNotInSchema: (ctx) => i18n.__('SimpleSchema.keyNotInSchema', ctx),
        regEx({ label, regExp }) {
          // See if there's one where exp matches this expression
          let msgObj;
          if (regExp) {
            msgObj = regExpMessages.find((o) => o.exp && o.exp.toString() === regExp);
          }

          const regExpMessage = msgObj ? i18n.__(msgObj.msg) : i18n.__('SimpleSchema.RegEx.Default');

          return `${label} ${regExpMessage}`;
        },
      },
    },
  });
}

export function genRandomPassword(pwdlen = 16) {
  // original code and explanations here :
  // https://www.geeksforgeeks.org/how-to-generate-a-random-password-using-javascript/
  let password = '';
  const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (let i = 1; i <= pwdlen; i += 1) {
    const char = Math.floor(Math.random() * allChars.length + 1);
    password += allChars.charAt(char);
  }

  return password;
}

export function handleResult(resolve, reject) {
  return (error, result) => {
    if (error) {
      msg.error(error.reason);
      reject(error);
    } else {
      msg.success(i18n.__('api.methods.operationSuccessMsg'));
      resolve(result);
    }
  };
}
export function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    const newData = prev;
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        newData[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        newData[key] = mergeDeep(pVal, oVal);
      } else {
        newData[key] = oVal;
      }
    });

    return newData;
  }, {});
}

/** - Transform a flat data into a tree data
 *
 *  - Aimed to use for structures
 */
export const getTree = (
  flatData,
  rootKey = null,
  getParentKey = (node) => node.parentId,
  getKey = (node) => node._id,
) => {
  if (!flatData) {
    return [];
  }

  const childrenToParents = {};
  flatData.forEach((child) => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = (parent) => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map((child) => trav(child)),
      };
    }

    return { ...parent };
  };

  const result = childrenToParents[rootKey].map((child) => trav(child));

  return result;
};

/**
 * - valid language is like `en` or `fr`
 *
 * - default value of language is current i18n one
 */
export const getCurrentIntroduction = ({ introduction, language = i18n.getLocale().split('-')[0] }) =>
  introduction.find((entry) => entry.language === language);

export const getCurrentText = ({ data, language = i18n.getLocale().split('-')[0] }) =>
  data.find((entry) => entry.language === language) || [];

export const testUrl = (URL, withSlash = false) => {
  const testedUrl = testMeteorSettingsUrl(URL, withSlash);
  return URL.startsWith('http') ? testedUrl : `https://${testedUrl}`;
};

const regValidateStrict = /[<>"'&]/g;
const regValidate = /((<|%3C|&lt;)script)|(('|"|%22|%27) *on[a-z_]+ *(=|%3D))/gi;

/** Check a string for malicious content */
export const validateString = (content, strict = false) => {
  if (content.length > 500000) {
    throw new Meteor.Error('api.utils.validateString.stringTooLong', i18n.__('api.utils.stringTooLong'));
  }
  /** strict forbids any of the following characters : < > " ' &
      otherwise, forbid script tags and pattern like " onload=... */
  const scriptRegex = strict ? regValidateStrict : regValidate;
  if (content.match(scriptRegex) !== null) {
    throw new Meteor.Error(
      'api.utils.validateString.error',
      i18n.__(strict ? 'api.utils.badCharsDetected' : 'api.utils.scriptDetected'),
    );
  }
  return content;
};

export const accentInsensitive = (searchString) => {
  // inspired from https://stackoverflow.com/questions/227950/
  const accented = {
    // eslint-disable-next-line max-len
    A: '[Aa\xaa\xc0-\xc5\xe0-\xe5\u0100-\u0105\u01cd\u01ce\u0200-\u0203\u0226\u0227\u1d2c\u1d43\u1e00\u1e01\u1e9a\u1ea0-\u1ea3\u2090\u2100\u2101\u213b\u249c\u24b6\u24d0\u3371-\u3374\u3380-\u3384\u3388\u3389\u33a9-\u33af\u33c2\u33ca\u33df\u33ff\uff21\uff41]',
    // eslint-disable-next-line max-len
    E: '[Ee\xc8-\xcb\xe8-\xeb\u0112-\u011b\u0204-\u0207\u0228\u0229\u1d31\u1d49\u1e18-\u1e1b\u1eb8-\u1ebd\u2091\u2121\u212f\u2130\u2147\u24a0\u24ba\u24d4\u3250\u32cd\u32ce\uff25\uff45]',
    // eslint-disable-next-line max-len
    I: '[Ii\xcc-\xcf\xec-\xef\u0128-\u0130\u0132\u0133\u01cf\u01d0\u0208-\u020b\u1d35\u1d62\u1e2c\u1e2d\u1ec8-\u1ecb\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216a\u216b\u2170-\u2173\u2175-\u2178\u217a\u217b\u24a4\u24be\u24d8\u337a\u33cc\u33d5\ufb01\ufb03\uff29\uff49]',
    // eslint-disable-next-line max-len
    O: '[Oo\xba\xd2-\xd6\xf2-\xf6\u014c-\u0151\u01a0\u01a1\u01d1\u01d2\u01ea\u01eb\u020c-\u020f\u022e\u022f\u1d3c\u1d52\u1ecc-\u1ecf\u2092\u2105\u2116\u2134\u24aa\u24c4\u24de\u3375\u33c7\u33d2\u33d6\uff2f\uff4f]',
    // eslint-disable-next-line max-len
    U: '[Uu\xd9-\xdc\xf9-\xfc\u0168-\u0173\u01af\u01b0\u01d3\u01d4\u0214-\u0217\u1d41\u1d58\u1d64\u1e72-\u1e77\u1ee4-\u1ee7\u2106\u24b0\u24ca\u24e4\u3373\u337a\uff35\uff55]',
  };

  // replace characters by their compositors
  const accentReplacer = (chr) => {
    return accented[chr.toUpperCase()] || chr;
  };
  const result = searchString.replace(/\S/g, accentReplacer);
  return result;
};
