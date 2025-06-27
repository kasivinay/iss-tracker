L.Terminator = L.Polygon.extend({
  options: {
    color: '#00',
    fillColor: '#000',
    fillOpacity: 0.5,
    weight: 0
  },

  initialize: function (options) {
    this._R2D = 180 / Math.PI;
    this._D2R = Math.PI / 180;
    L.Util.setOptions(this, options);
    const latLngs = this._compute(new Date());
    L.Polygon.prototype.initialize.call(this, [latLngs], options);
  },

  _compute: function (date) {
    const dayMs = 86400000;
    const rad = Math.PI / 180;
    const R2D = this._R2D;
    const J1970 = 2440588;
    const J2000 = 2451545;

    function toJulian(d) {
      return d.valueOf() / dayMs - 0.5 + J1970;
    }

    function toDays(d) {
      return toJulian(d) - J2000;
    }

    function eclipticObliquity(d) {
      return 23.4397 - 3e-7 * d;
    }

    function solarMeanAnomaly(d) {
      return rad * (357.5291 + 0.98560028 * d);
    }

    function equationOfCenter(M) {
      return rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    }

    function eclipticLongitude(M, C) {
      const P = rad * 102.9372;
      return M + C + P + Math.PI;
    }

    function sunCoords(d) {
      const M = solarMeanAnomaly(d);
      const C = equationOfCenter(M);
      const L = eclipticLongitude(M, C);
      const dec = Math.asin(Math.sin(L) * Math.sin(rad * eclipticObliquity(d)));
      const ra = Math.atan2(Math.sin(L) * Math.cos(rad * eclipticObliquity(d)), Math.cos(L));
      return { dec: dec, ra: ra };
    }

    const d = toDays(date);
    const c = sunCoords(d);
    const lw = rad * -date.getUTCHours() * 15;
    const phi = c.dec;

    const latLngs = [];
    for (let i = 0; i <= 360; i++) {
      const lng = -180 + i;
      const lngRad = rad * lng;
      const lat = Math.atan(-Math.cos(lngRad - lw) / Math.tan(phi)) * R2D;
      latLngs.push([lat, lng]);
    }
    latLngs.push([90, 180], [90, -180]);
    return latLngs;
  }
});
