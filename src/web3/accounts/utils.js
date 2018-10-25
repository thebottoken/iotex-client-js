import _ from "underscore";

export function isNot(value) {
  return (_.isUndefined(value) || _.isNull(value));
};
