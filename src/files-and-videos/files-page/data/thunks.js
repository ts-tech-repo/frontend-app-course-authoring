import { isEmpty } from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform';

import { RequestStatus } from '../../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  updateModel,
} from '../../../generic/model-store';
import {
  getAssets,
  getAssetUsagePaths,
  addAsset,
  deleteAsset,
  updateLockStatus,
  getDownload,
  getAssetDetails,
} from './api';
import {
  setAssetIds,
  setSortedAssetIds,
  updateLoadingStatus,
  deleteAssetSuccess,
  addAssetSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
  updateDuplicateFiles,
  fetchSuccess,
} from './slice';

import {
  getSortApiParams,
  getFilterApiParams,
  getUploadConflicts,
  updateFileValues,
} from './utils';

export function fetchAdditionalAssets({ courseId, pageNumber, sortBy, filters }) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    try {
      const [sort, direction] = getSortApiParams(sortBy);
      const { assets } = await getAssets({courseId, page: pageNumber, sort, direction, asset_type: filters});
      const parsedAssets = updateFileValues(assets);
      dispatch(addModels({ modelType: 'assets', models: parsedAssets }));
      dispatch(setAssetIds({
        assetIds: assets.map(asset => asset.id),
      }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      console.log(error);
      dispatch(updateErrors({ error: 'loading', message: 'Failed to load remaining files.' }));
      dispatch(updateLoadingStatus({ status: RequestStatus.PARTIAL_FAILURE }));
    }
  };
}

export function fetchAssets({courseId, filters, sortType}) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      console.log(filters);
      const [sort, direction] = getSortApiParams(sortType);
      const { asset_type, text_search } = getFilterApiParams(filters);
      const { assets, totalCount } = await getAssets({courseId, asset_type, text_search, sort, direction});
      const parsedAssets = updateFileValues(assets);
      dispatch(addModels({ modelType: 'assets', models: parsedAssets }));
      dispatch(fetchSuccess({
        assetIds: assets.map(asset => asset.id),
        totalCount,
      }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateErrors({ error: 'loading', message: 'Failed to load all files.' }));
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function updateAssetOrder(courseId, assetIds) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    dispatch(setSortedAssetIds({ assetIds }));
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
  };
}

export function deleteAssetFile(courseId, id) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteAsset(courseId, id);
      dispatch(deleteAssetSuccess({ assetId: id }));
      dispatch(removeModel({ modelType: 'assets', id }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'delete', message: `Failed to delete file id ${id}.` }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.FAILED }));
    }
  };
}

export function addAssetFile(courseId, file, isOverwrite) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.IN_PROGRESS }));

    try {
      const { asset } = await addAsset(courseId, file);
      const [parsedAssets] = updateFileValues([asset]);
      dispatch(addModel({
        modelType: 'assets',
        model: { ...parsedAssets },
      }));
      if (!isOverwrite) {
        dispatch(addAssetSuccess({
          assetId: asset.id,
        }));
      }
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 413) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'add', message }));
      } else {
        dispatch(updateErrors({ error: 'add', message: `Failed to add ${file.name}.` }));
      }
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
    }
  };
}

export function validateAssetFiles(courseId, files) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.IN_PROGRESS }));
    dispatch(updateDuplicateFiles({ files: {} }));

    try {
      const filenames = [];
      files.forEach(file => filenames.push(file.name));
      await getAssetDetails({ courseId, filenames, fileCount: filenames.length }).then(({ assets }) => {
        const [conflicts, newFiles] = getUploadConflicts(files, assets);
        if (!isEmpty(newFiles)) {
          newFiles.forEach(file => dispatch(addAssetFile(courseId, file)));
        }
        if (!isEmpty(conflicts)) {
          dispatch(updateDuplicateFiles({ files: conflicts }));
        }
      });
    } catch (error) {
      files.forEach(file => dispatch(updateErrors({ error: 'add', message: `Failed to validate ${file.name}.` })));
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
    }
  };
}

export function updateAssetLock({ assetId, courseId, locked }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.IN_PROGRESS }));

    try {
      await updateLockStatus({ assetId, courseId, locked });
      dispatch(updateModel({
        modelType: 'assets',
        model: {
          id: assetId,
          locked,
          lockStatus: locked,
        },
      }));
      dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      const lockStatus = locked ? 'lock' : 'unlock';
      dispatch(updateErrors({ error: 'lock', message: `Failed to ${lockStatus} file id ${assetId}.` }));
      dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.FAILED }));
    }
  };
}

export function resetErrors({ errorType }) {
  return (dispatch) => { dispatch(clearErrors({ error: errorType })); };
}

export function getUsagePaths({ asset, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.IN_PROGRESS }));
    try {
      const { usageLocations } = await getAssetUsagePaths({ assetId: asset.id, courseId });
      const assetLocations = usageLocations[asset.id];
      const activeStatus = assetLocations?.length > 0 ? 'active' : 'inactive';
      dispatch(updateModel({
        modelType: 'assets',
        model: {
          id: asset.id,
          usageLocations: camelCaseObject(assetLocations),
          activeStatus,
        },
      }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'usageMetrics', message: `Failed to get usage metrics for ${asset.displayName}.` }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.FAILED }));
    }
  };
}

export function fetchAssetDownload({ selectedRows, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.IN_PROGRESS }));
    const errors = await getDownload(selectedRows, courseId);
    if (isEmpty(errors)) {
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.SUCCESSFUL }));
    } else {
      errors.forEach(error => {
        dispatch(updateErrors({ error: 'download', message: error }));
      });
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.FAILED }));
    }
  };
}
