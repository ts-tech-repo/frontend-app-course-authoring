import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { DataTableContext, Pagination, TableFooter } from '@openedx/paragon';
import { fetchAdditionalAssets } from '../../files-page/data/thunks';

const Footer = ({ courseId, pageCount, fileType }) => {
  const dispatch = useDispatch();
  const { itemCount, gotoPage, state } = useContext(DataTableContext);
  const pageIndex = state?.pageIndex;
  const handlePageSelect = async (pageNum) => {
    if (fileType === 'file') {
      const { filters, sortBy } = state;
      await dispatch(fetchAdditionalAssets({ courseId, pageNumber: pageNum - 1, filters, sortBy }));
    }
    gotoPage(pageNum - 1);
  }

  if (itemCount <= 50) {
    return null;
  }

  return (
    <TableFooter>
      <Pagination
        size="small"
        currentPage={pageIndex + 1}
        pageCount={pageCount}
        paginationLabel="table pagination"
        onPageSelect={handlePageSelect}
      />
    </TableFooter>
  );
};

Footer.propTypes = {
  courseId: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  pageCount: PropTypes.number.isRequired,
}

export default Footer;
