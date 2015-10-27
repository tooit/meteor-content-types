UI.registerHelper('ctDebug', function (val) {
  console.log(val);
});

UI.registerHelper('ctGetFieldValue', function (item, key) {
  return item[key];
});
