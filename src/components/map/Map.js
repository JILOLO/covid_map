import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import {MapService} from "../../services/MapService"; 
import { MapUtils } from '../../util/MapUtils';
import CountyCard from '../card/CountyCard';
import StateCard from '../card/StateCard';

const PointMarker = ({ children }) => children;
 
class Map extends Component {
  static defaultProps = {
    center: {
      lat: 42,
      lng: -74
    },
    zoom: 11
  };

  state = {
      points: {},
      zoom: 11,
      boundry: null,

  };
 
  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyDtT3s5DOgQ8HiS9oXF4k0n7DLoXNE2E2s" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          yesIWantToUseGoogleMapApiInternal
          onGoogleApiLoaded={({ map, maps }) => {
              
              MapService.getUSCovidData()
                .then(response => {

                    const covidDataPoints = MapUtils.getCovidPoints(response.data);

                    this.setState({
                        points: covidDataPoints,
                    });
                })
                .catch(error => {
                    console.log(error);
                });



          }}

          onChange={ (changeObject) => {
              this.setState(
                  {
                      zoom: changeObject.zoom,
                      boundary: changeObject.bounds,
                  }
              );
            }
          }

        >
          {this.renderPoints()}    
        </GoogleMapReact>
      </div>
    );
  }

  renderPoints() {
      const points = this.state.points[this.state.zoom];
      const result = [];
      if (!points) {
          return result;
      }
      // render counties
      if (Array.isArray(points)) {
          for (const county of points) {
              // 判断这个point是不是在boundry里？
              if (!MapUtils.isInBoundary(this.state.boundry, county.coordinates)) {
                  continue;
              }
              // 做卡片insert到result list里面去
              result.push(
                  <PointMarker
                      lat = {county.coordinates.latitude}
                      lng = {county.coordinates.longitude}
                  >
                      <CountyCard {...county}/>
                  </PointMarker>
              );

          }
      }
      // render states
      if (points.type === "state") {
        for (const nation in points) {
            for (const state in points[nation]) {
                if (!MapUtils.isBoundary(this.state.boundary, points[nation][state].coordinates)) {
                    continue;
                }
                // insert
                result.push(
                    <PointMarker
                        lat = {points[nation][state].coordinates.latitude}
                        lng = {points[nation][state].coordinates.longitude}
                    >
                        <StateCard state={state} {...points[nation][state]}/>
                    </PointMarker>
                );   
            }
        }
      }
      // country TODO: Homework
      return result;
  }
}
 
export default Map;