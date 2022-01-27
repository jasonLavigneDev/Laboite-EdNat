export const computeCustoms = (palette, list) => {
  let results = {};
  list.forEach((item) => {
    results = {
      ...results,
      ...item(palette),
    };
  });
  return results;
};
