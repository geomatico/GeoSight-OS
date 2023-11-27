/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '17/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import {
  INDICATOR_METADATA_ACTION_NAME,
  INDICATOR_METADATA_TYPE_PROGRESS,
} from './index'

/**
 * Add data.
 * @param {int} id Id of data.
 * @param {object} data Data.
 */
export function progress(id, data) {
  return {
    name: INDICATOR_METADATA_ACTION_NAME,
    type: INDICATOR_METADATA_TYPE_PROGRESS,
    id: id,
    data: data
  };
}

export default {
  progress
}