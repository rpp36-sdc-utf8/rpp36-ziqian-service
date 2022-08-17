const convertArrToObj = (arr, key, value) => (
  arr.reduce((resultObj, item) => {
    resultObj[item[key]] = item[value];
    return resultObj;
  }, {})
);

module.exports = {
  convertArrToObj,
};
