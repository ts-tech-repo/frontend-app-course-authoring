import React, { useContext } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTableContext } from '@openedx/paragon';
import { isEmpty } from  'lodash';
import { getCurrentViewRange } from './utils';

const RowStatus = ({
  // injected
  intl,
}) => {
  const {
    filteredRows,
    state,
    page,
    itemCount,
  } = useContext(DataTableContext);
  const { filters } = state;

  return (
    <div>
      <span>
        {getCurrentViewRange({
          hasFilters: !isEmpty(filters),
          filterRowCount: filteredRows.length,
          initialRowCount: itemCount,
          fileCount: page.length,
          intl,
        })}
      </span>
    </div>
  );
};

RowStatus.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RowStatus);
