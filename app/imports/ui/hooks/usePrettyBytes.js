import { useMemo } from 'react';
import i18n from 'meteor/universe:i18n';

/**
 *
 * @param {number} bytes
 * @returns {[number, string]} return an array containing the converted value and the units it as been converted to
 */
function getBytesUnit(bytes) {
  if (!+bytes) return [bytes, 'byte'];

  const k = 1000;
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const unit = units[i];
  const value = bytes / k ** i;

  return [value, unit];
}

/**
 *
 * @param {number} bytes
 * @returns {string}
 */
function prettyBytes(bytes) {
  const [value, unit] = getBytesUnit(bytes);

  const bytesFormatter = new Intl.NumberFormat(i18n._locale, {
    style: 'unit',
    unit,
    maximumFractionDigits: 2,
  });

  return bytesFormatter.format(value);
}

/**
 *
 * @param {number} bytes
 * @returns
 */
export default function usePrettyBytes(bytes) {
  return useMemo(() => prettyBytes(bytes), [bytes]);
}
