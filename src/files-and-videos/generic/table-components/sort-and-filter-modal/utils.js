import { isArray, isEmpty } from 'lodash';

export const getFilterOptions = (columns) => {
  const allOptions = [];
  const filterableColumns = columns.filter(column => column?.filterChoices);

  filterableColumns.forEach(column => {
    const { filterChoices } = column;
    allOptions.push(...filterChoices);
  });

  return allOptions;
};

export const getCheckedFilters = (state) => {
  const { filters } = state;
  console.log(filters);
  const allFilters = [];
  filters.forEach(filter => {
    const { id, value } = filter;

    if (isArray(value)) {
      allFilters.push(...value);
    } else {
      allFilters.push([id, value]);
    }
  });

  return allFilters;
};

export const processFilters = (filters, columns, setAllFilters) => {
  const filterableColumns = columns.filter(column => column?.filterChoices);
  const allFilters = [];
  console.log(filterableColumns,filters);

  const [displayNameFilter] = filters.filter(filter => isArray(filter));
  console.log(displayNameFilter);
  if (displayNameFilter) {
    const [id, filterValue] = displayNameFilter;
    allFilters.push({ id, value: [filterValue] });
  }

  filterableColumns.forEach(({ id, filterChoices }) => {
    const filterValues = filterChoices.map(choice => choice.value);
    const matchingFilters = filterValues.filter(value => filters.includes(value));

    if (!isEmpty(matchingFilters)) {
      allFilters.push({ id, value: matchingFilters });
    }
  });

  setAllFilters(allFilters);
  return allFilters;
};

export const setSortState = (sortType, setSortBy) => {
  const [sort, direction] = sortType.split(',');
  const desc = direction === 'desc';
  setSortBy([{ id: sort, desc}]);
};

export const getSortState = (sortBy) => {
  if (isEmpty(sortBy)) {
    return 'dateAdded,desc';
  }
  const { id, desc } = sortBy[0];
  const direction = desc ? 'desc' : 'asc';
  return `${id},${direction}`;
};
