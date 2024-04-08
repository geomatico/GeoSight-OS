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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { fetchingData } from '../../Requests';
import WhereQueryGenerator from '../SqlQueryGenerator/WhereQueryGenerator';
import { dictDeepCopy } from '../../utils/main';
import { getRelatedTableFields } from '../../utils/relatedTable';
import { Actions } from '../../store/dashboard';
import { useDispatch } from 'react-redux';


/**
 * Tree Item Component.
 * @param {array} treeData tree data, format = {
 *   'id': 'group_id',
 *   'children': [{
 *     'id': 'data_id',
 *     'children': []
 *   }]
 * }
 */

const SidePanelSlicers = ({ data }) => {

    const dispatch = useDispatch();

    const [relatedTableInfo, setRelatedTableInfo] = useState(null)
    const [relatedTableData, setRelatedTableData] = useState(null)


    /** Update fields to required fields **/
    const updateFields = (fields) => {
        if (!fields) {
            return fields
        }
        return fields.map(field => {
            return {
                name: field.name,
                type: field.type ? field.type : 'text',
                value: field.name,
                options: field?.options
            }
        })
    }

    // Loading data
    useEffect(() => {
        if (!open) {
            return
        }
        if (data.related_table) {
            const params = {}
            const url_info = `/api/related-table/${data.related_table}`
            const url_data = `/api/related-table/${data.related_table}/data`
            setRelatedTableInfo(null)
            setRelatedTableData(null)
            fetchingData(
                url_data, params, {}, function (response, error) {
                    setRelatedTableData(dictDeepCopy(response))
                }
            )
            fetchingData(
                url_info, params, {}, function (response, error) {
                    setRelatedTableInfo(dictDeepCopy(response))
                }
            )
        }
    }, [data.related_table])


    const relatedFields = relatedTableInfo && relatedTableData ? getRelatedTableFields(relatedTableInfo, relatedTableData) : []

    return <Fragment>
        <div
            id='RelatedTableLayerMiddleConfigReal'
            className='WhereConfigurationWrapper'
        >
            <WhereQueryGenerator
                fields={updateFields(relatedFields)}
                isCompact={true}
                whereQuery={data.query}
                setWhereQuery={(where) => {
                    console.log(where)
                    if (JSON.stringify(data.query) !== JSON.stringify(where)) {
                        data.query = where
                        dispatch(Actions.ContextLayers.update(data))
                        //dispatch(Actions.Map.addContextLayer(data.id, { layer: data, layer_type: 'Related Table' }))
                    }
                }}
                disabledChanges={{
                    add: true,
                    remove: true,
                    sql: true,
                    and_or: true,
                    field: true,
                    operator: true,
                }}
            />
        </div>
    </Fragment>
};

export default SidePanelSlicers;