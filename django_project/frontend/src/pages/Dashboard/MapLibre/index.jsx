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

/* ==========================================================================
   MAP CONTAINER
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox/typed';
import ReferenceLayerCentroid from './ReferenceLayerCentroid'
import ReferenceLayer from "./Layers/ReferenceLayer";
import ContextLayers from "./Layers/ContextLayers";
import { Plugin, PluginChild } from "./Plugin";
import { removeLayer, removeSource } from "./utils"
import {
  ThreeDimensionOffIcon,
  ThreeDimensionOnIcon
} from '../../../components/Icons'

// Toolbars
import {
  Bookmark,
  CompareLayer,
  DownloaderData,
  EmbedControl,
  GlobalDateSelector,
  LabelToggler,
  Measurement,
  MovementHistories,
  TiltControl,
  ToggleSidePanel,
} from '../Toolbars'
import { EmbedConfig } from "../../../utils/embed";
import { Actions } from "../../../store/dashboard";
import ReferenceLayerSection from "../MiddlePanel/ReferenceLayer";

import 'maplibre-gl/dist/maplibre-gl.css';
import './style.scss';

const BASEMAP_ID = `basemap`

/**
 * MapLibre component.
 */
export default function MapLibre(
  { leftPanelProps, rightPanelProps, ...props }
) {
  const dispatch = useDispatch()
  const [map, setMap] = useState(null);
  const [deckgl, setDeckGl] = useState(null);
  const extent = useSelector(state => state.dashboard.data.extent);
  const {
    basemapLayer,
    is3dMode,
    position,
    force
  } = useSelector(state => state.map);

  /**
   * FIRST INITIATE
   * */
  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: 'map',
        style: {
          version: 8,
          sources: {},
          layers: [],
          glyphs: "/static/fonts/{fontstack}/{range}.pbf"
        },
        center: [0, 0],
        zoom: 1
      });
      newMap.once("load", () => {
        setMap(newMap)
        setTimeout(() =>
            document.querySelector('.mapboxgl-ctrl-compass')
              .addEventListener('click', () => {
                newMap.easeTo({ pitch: 0, bearing: 0 })
              }),
          500,
        )
      })
      newMap.addControl(new maplibregl.NavigationControl(), 'bottom-left');

      let mapControl = document.querySelector('.maplibregl-ctrl-bottom-left .maplibregl-ctrl-group')
      let parent = document.getElementById('maplibregl-ctrl-bottom-left')
      parent.appendChild(mapControl);

      let tilt = document.getElementsByClassName('TiltControl')[0]
      parent = document.getElementById('tilt-control')
      parent.appendChild(tilt);

      const deckgl = new MapboxOverlay({
        interleaved: true,
        layers: []
      });
      newMap.addControl(deckgl);
      setDeckGl(deckgl)

      // Event when resized
      window.addEventListener('resize', _ => {
        setTimeout(function () {
          newMap.resize();
        }, 1);
      });
    }
  }, []);


  /**
   * EXTENT CHANGED
   * */
  useEffect(() => {
    if (map && extent && !(position && Object.keys(position).length)) {
      const bounds = map.getBounds()
      const newExtent = [
        bounds._sw.lng, bounds._sw.lat,
        bounds._ne.lng, bounds._ne.lat
      ]
      if (JSON.stringify(newExtent) !== JSON.stringify(extent)) {
        setTimeout(function () {
          map.easeTo({
            pitch: 0,
            bearing: 0
          })
          setTimeout(function () {
            map.fitBounds([
              [extent[0], extent[1]],
              [extent[2], extent[3]]
            ])
          }, 100)
        }, 100)
      }
    }
  }, [map, extent]);

  /**
   * EXTENT CHANGED
   * */
  useEffect(() => {
    if (map && position && Object.keys(position).length) {
      setTimeout(function () {
        map.easeTo({
          pitch: position.pitch,
          bearing: position.bearing,
          zoom: position.zoom,
          center: position.center
        })
      }, 100)
    }
  }, [map, position]);

  /***
   * Render layer to maplibre
   * @param {String} id of layer
   * @param {Object} source Layer config options.
   * @param {Object} layer Layer config options.
   * @param {String} before Is the layer after it.
   */
  const renderLayer = (id, source, layer, before = null) => {
    removeLayer(map, id)
    removeSource(map, id)
    map.addSource(id, source)
    return map.addLayer(
      {
        ...layer,
        id: id,
        source: id,
      },
      before
    );
  }

  /** BASEMAP CHANGED */
  useEffect(() => {
    if (map && basemapLayer) {
      const layers = map.getStyle().layers.filter(layer => layer.id !== 'basemap')
      renderLayer(
        BASEMAP_ID, basemapLayer, { type: "raster" }, layers[0]?.id
      )
    }
  }, [map, basemapLayer]);

  return <section
    className={'DashboardMap ' + (!EmbedConfig().map ? 'Hidden' : '')}>
    <div id="map"></div>
    {/* TOOLBARS */}
    <div className='Toolbar'>
      <TiltControl map={map} is3DView={is3dMode} force={force}/>
      <div className='Toolbar-Left'>
        {
          leftPanelProps ?
            <ToggleSidePanel
              className={leftPanelProps.className}
              initState={leftPanelProps.initState}
              active={leftPanelProps.active}
              onLeft={() => {
                leftPanelProps.onLeft()
              }}
              onRight={() => {
                leftPanelProps.onRight()
              }}
            /> : null
        }
        <GlobalDateSelector/>
        <Plugin className={'ReferenceLayerToolbar'}>
          <div>
            <PluginChild title={'Reference Layer selection'}>
              <ReferenceLayerSection/>
            </PluginChild>
          </div>
        </Plugin>
      </div>

      <div className='Toolbar-Middle'>
        <div className='Separator'/>
        <MovementHistories map={map} showHome={true}/>
        <Measurement map={map}/>
        <LabelToggler/>
        <CompareLayer disabled={is3dMode}/>
        {/* 3D View */}
        <Plugin>
          <div className='extrudedIcon Active'>
            <PluginChild
              title={'3D layer'}
              disabled={!map}
              active={is3dMode}
              onClick={() => {
                if (is3dMode) {
                  map.easeTo({ pitch: 0 })
                }
                dispatch(Actions.Map.change3DMode(!is3dMode))
              }}>
              {is3dMode ? <ThreeDimensionOnIcon/> : <ThreeDimensionOffIcon/>}
            </PluginChild>
          </div>
        </Plugin>
        <div className='Separator'/>
      </div>

      {/* Embed */}
      <div className='Toolbar-Right'>
        <Plugin className='EmbedControl'>
          <div className='Active'>
            <PluginChild title={'Get embed code'}>
              <EmbedControl map={map}/>
            </PluginChild>
          </div>
        </Plugin>
        <DownloaderData/>
        <Plugin className='BookmarkControl'>
          <Bookmark map={map}/>
        </Plugin>
        {
          rightPanelProps ?
            <ToggleSidePanel
              className={rightPanelProps.className}
              initState={rightPanelProps.initState}
              active={rightPanelProps.active}
              onLeft={() => {
                rightPanelProps.onLeft()
              }}
              onRight={() => {
                rightPanelProps.onRight()
              }}
            /> : null
        }
      </div>
    </div>

    <ReferenceLayer map={map} deckgl={deckgl} is3DView={is3dMode}/>
    <ContextLayers map={map}/>
    {
      map ?
        <ReferenceLayerCentroid map={map}/> : ""
    }
  </section>
}

