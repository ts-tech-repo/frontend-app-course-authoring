export const sortFiles = (files, sortType) => { // eslint-disable-line import/prefer-default-export
  const { id, desc } = sortType;
  let sortedFiles;
  if (id === 'displayName') {
    sortedFiles = files.sort((f1, f2) => {
      const lowerCaseF1 = f1[id].toLowerCase();
      const lowerCaseF2 = f2[id].toLowerCase();
      if (lowerCaseF1 < lowerCaseF2) {
        return 1;
      }
      if (lowerCaseF1 > lowerCaseF2) {
        return -1;
      }
      return 0;
    });
  } else {
    sortedFiles = files.sort((f1, f2) => {
      if (f1[id] < f2[id]) {
        return 1;
      }
      if (f1[id] > f2[id]) {
        return -1;
      }
      return 0;
    });
  }

  const sortedIds = sortedFiles.map(file => file.id);
  if (!desc) {
    return sortedIds.reverse();
  }
  return sortedIds;
};
