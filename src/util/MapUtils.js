export const MapUtils = {
    /*
    * process backend data and aggregate by locations
    * input: backend county data (list of objects).
    * 
    * 1-4: nation
    * 5-9: state
    * 10-20: county
    */
    getCovidPoints: function(points) {
        if (!points) {
            return {};
        }

        const nations = {
            type: "nation",
        };

        const states = {
            type: "state",
        };

        // aggregate by state
        for (const point of points) {
            if (Number.isNaN(point.stats.confirmed)) {
                console.error("Got dirty data: ", point);
                continue;
            }

            states[point.country] = states[point.country] || {}; //如果有赋给，如果没有新建赋值空
            states[point.country][point.province] = states[point.country][point.province] || {
                confirmed: 0,
                deaths: 0,
                recovered: 0,
            }; // initialize a state/province key

            // .confirmed和中括号是一样的
            states[point.country][point.province].confirmed += point.stats.confirmed;
            states[point.country][point.province].deaths += point.stats.deaths;
            states[point.country][point.province].recovered += point.stats.recovered;
            states[point.country][point.province].coordinates = states[point.country][point.province].coordinates || point.coordinates;
        }

        // aggregate by nation/country (TODO: homework)

        const result = {};
        let i = 1; // zoom level
        for (; i<=4; i++) {
            // nation level 1-4
            result[i] = nations;
        }
        for (; i<=9; i++) {
            // states level 5-9
            result[i] = states;
        }
        for (; i<=20; i++) {
            // states level 10-20
            result[i] = points;
        
        }
        return result;
    },
    
    isInBoundry: function(bounds, coordinates) {
        return coordinates && bounds && bounds.nw && bounds.se && 
        ((coordinates.longitude >= bounds.nw.lng && coordinates.longitude <= bounds.se.lng) || (coordinates.longitude <= bounds.nw.lng && coordinates.longitude >= bounds.se.lng))
        && ((coordinates.latitude >= bounds.se.lat && coordinates.latitude <= bounds.nw.lat) || (coordinates.latitude <= bounds.se.lat && coordinates.latitude >= bounds.nw.lat));
    }
}