const convertArrToObj = (arr, key, value) => (
  arr.reduce((resultObj, item) => {
    resultObj[item[key]] = item[value];
    return resultObj;
  }, {})
);

const convertCharObj = (arr, name, value, id) => (
  arr.reduce((resultObj, item) => {
    const tempObj = {
      id: item[id],
      value: item[value],
    };
    resultObj[item[name]] = tempObj;
    console.log(resultObj);
    return resultObj;
  }, {})
);

module.exports = {
  convertArrToObj,
  convertCharObj,
};
