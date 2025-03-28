var W = (a) => {
  throw TypeError(a);
};
var L = (a, t, e) => t.has(a) || W("Cannot " + e);
var i = (a, t, e) => (L(a, t, "read from private field"), e ? e.call(a) : t.get(a)), d = (a, t, e) => t.has(a) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(a) : t.set(a, e), r = (a, t, e, s) => (L(a, t, "write to private field"), s ? s.call(a, e) : t.set(a, e), e), u = (a, t, e) => (L(a, t, "access private method"), e);
var j = (a, t, e, s) => ({
  set _(n) {
    r(a, t, n, e);
  },
  get _() {
    return i(a, t, s);
  }
});
import * as o from "three";
var v, _, q, I, F;
class N {
  /**
   * Create a SphMercProjection.
   */
  constructor() {
    d(this, v);
    this.EARTH = 4007501668e-2, this.HALF_EARTH = 2003750834e-2;
  }
  /**
   * Project a longitude and latitude into Spherical Mercator.
   * @param {number} lon - the longitude.
   * @param {number} lat - the latitude.
   * @return {Array} Two-member array containing easting and northing.
   */
  project(t, e) {
    return [u(this, v, _).call(this, t), u(this, v, q).call(this, e)];
  }
  /**
   * Unproject a Spherical Mercator easting and northing.
   * @param {Array} projected - Two-member array containing easting and northing
   * @return {Array} Two-member array containing longitude and latitude 
   */
  unproject(t) {
    return [u(this, v, I).call(this, t[0]), u(this, v, F).call(this, t[1])];
  }
  /**
   * Return the projection's ID.
   * @return {string} The value "epsg:3857".
   */
  getID() {
    return "epsg:3857";
  }
}
v = new WeakSet(), _ = function(t) {
  return t / 180 * this.HALF_EARTH;
}, q = function(t) {
  var e = Math.log(Math.tan((90 + t) * Math.PI / 360)) / (Math.PI / 180);
  return e * this.HALF_EARTH / 180;
}, I = function(t) {
  return t / this.HALF_EARTH * 180;
}, F = function(t) {
  var e = t / this.HALF_EARTH * 180;
  return e = 180 / Math.PI * (2 * Math.atan(Math.exp(e * Math.PI / 180)) - Math.PI / 2), e;
};
var O, M, f, b, P, w, m, y, E, p, l, H, S, x, G;
class Y {
  /**
   * @param {THREE.Scene} scene - The Three.js scene to use.
   * @param {THREE.Camera} camera - The Three.js camera to use. Should usually 
   * be a THREE.PerspectiveCamera.
   * @param {Object} options - Initialisation options for the GPS; see
   * setGpsOptions() below.
   * @param {Object} serverLogger - an object which can optionally log GPS position to a server for debugging. null by default, so no logging will be done. This object should implement a sendData() method to send data (2nd arg) to a given endpoint (1st arg). Please see source code for details. Ensure you comply with privacy laws (GDPR or equivalent) if implementing this.
   */
  constructor(t, e, s = {}, n = null) {
    d(this, l);
    d(this, O);
    d(this, M);
    d(this, f);
    d(this, b);
    d(this, P);
    d(this, w);
    d(this, m);
    d(this, y);
    d(this, E);
    d(this, p);
    this.scene = t, this.camera = e, r(this, O, new N()), r(this, M, {}), r(this, f, null), r(this, b, 0), r(this, P, 100), r(this, w, null), this.setGpsOptions(s), r(this, m, null), r(this, y, 0), r(this, E, 0), r(this, p, n);
  }
  /**
   * Set the projection to use.
   * @param {Object} any object which includes a project() method 
   * taking longitude and latitude as arguments and returning an array 
   * containing easting and northing.
   */
  setProjection(t) {
    r(this, O, t);
  }
  /**
   * Set the GPS options.
   * @param {Object} object containing gpsMinDistance and/or gpsMinAccuracy
   * properties. The former specifies the number of metres which the device
   * must move to process a new GPS reading, and the latter specifies the 
   * minimum accuracy, in metres, for a GPS reading to be counted.
   */
  setGpsOptions(t = {}) {
    t.gpsMinDistance !== void 0 && r(this, b, t.gpsMinDistance), t.gpsMinAccuracy !== void 0 && r(this, P, t.gpsMinAccuracy);
  }
  /**
   * Start the GPS on a real device
   * @return {boolean} code indicating whether the GPS was started successfully.
   * GPS errors can be handled by handling the gpserror event.
   */
  async startGps() {
    if (i(this, p)) {
      const e = await (await i(this, p).sendData("/gps/start", {
        gpsMinDistance: i(this, b),
        gpsMinAccuracy: i(this, P)
      })).json();
      r(this, E, e.session);
    }
    return i(this, w) === null ? (r(this, w, navigator.geolocation.watchPosition(
      (t) => {
        u(this, l, x).call(this, t);
      },
      (t) => {
        i(this, M).gpserror ? i(this, M).gpserror(t.code) : alert(`GPS error: code ${t.code}`);
      },
      {
        enableHighAccuracy: !0
      }
    )), !0) : !1;
  }
  /**
   * Stop the GPS on a real device
   * @return {boolean} true if the GPS was stopped, false if it could not be
   * stopped (i.e. it was never started).
   */
  stopGps() {
    return i(this, w) !== null ? (navigator.geolocation.clearWatch(i(this, w)), r(this, w, null), !0) : !1;
  }
  /**
   * Send a fake GPS signal. Useful for testing on a desktop or laptop.
   * @param {number} lon - The longitude.
   * @param {number} lat - The latitude.
   * @param {number} elev - The elevation in metres. (optional, set to null
   * for no elevation).
   * @param {number} acc - The accuracy of the GPS reading in metres. May be
   * ignored if lower than the specified minimum accuracy.
   */
  fakeGps(t, e, s = null, n = 0) {
    s !== null && this.setElevation(s), u(this, l, x).call(this, {
      coords: {
        longitude: t,
        latitude: e,
        accuracy: n
      }
    });
  }
  /**
   * Convert longitude and latitude to three.js/WebGL world coordinates.
   * Uses the specified projection, and negates the northing (in typical
   * projections, northings increase northwards, but in the WebGL coordinate
   * system, we face negative z if the camera is at the origin with default
   * rotation).
   * @param {number} lon - The longitude.
   * @param {number} lat - The latitude.
   * @return {Array} a two member array containing the WebGL x and z coordinates
   */
  lonLatToWorldCoords(t, e) {
    const s = i(this, O).project(t, e);
    if (i(this, m))
      s[0] -= i(this, m)[0], s[1] -= i(this, m)[1];
    else
      throw "No initial position determined";
    return [s[0], -s[1]];
  }
  /**
   * Add a new AR object at a given latitude, longitude and elevation.
   * @param {THREE.Mesh} object the object
   * @param {number} lon - the longitude.
   * @param {number} lat - the latitude.
   * @param {number} elev - the elevation in metres 
   * (if not specified, 0 is assigned)
   * @param {Object} properties - properties describing the object (for example,
   * the contents of the GeoJSON properties field).
   */
  add(t, e, s, n, h = {}) {
    var g;
    t.properties = h, u(this, l, H).call(this, t, e, s, n), this.scene.add(t), (g = i(this, p)) == null || g.sendData("/object/new", {
      position: t.position,
      x: t.position.x,
      z: t.position.z,
      session: i(this, E),
      properties: h
    });
  }
  /**
   * Set the elevation (y coordinate) of the camera.
   * @param {number} elev - the elevation in metres.
   */
  setElevation(t) {
    this.camera.position.y = t;
  }
  /**
   * Add an event handler.
   * Currently-understood events: "gpsupdate" and "gpserror".
   * The former fires when a GPS update is received, and is passed the
   * standard Geolocation API position object, along with the distance moved
   * since the last GPS update in metres.
   * The latter fires when a GPS error is generated, and is passed the
   * standard Geolocation API numerical error code.
   * @param {string} eventName - the event to handle.
   * @param {Function} eventHandler - the event handler function.
   * @listens LocationBased#gpsupdate
   * @listens LocationBased#gpserror
   */
  on(t, e) {
    i(this, M)[t] = e;
  }
}
O = new WeakMap(), M = new WeakMap(), f = new WeakMap(), b = new WeakMap(), P = new WeakMap(), w = new WeakMap(), m = new WeakMap(), y = new WeakMap(), E = new WeakMap(), p = new WeakMap(), l = new WeakSet(), H = function(t, e, s, n) {
  const h = this.lonLatToWorldCoords(e, s);
  n !== void 0 && (t.position.y = n), [t.position.x, t.position.z] = h;
}, S = function(t, e) {
  r(this, m, i(this, O).project(t, e));
}, x = function(t) {
  var s, n, h;
  let e = Number.MAX_VALUE;
  j(this, y)._++, (s = i(this, p)) == null || s.sendData("/gps/new", {
    gpsCount: i(this, y),
    lat: t.coords.latitude,
    lon: t.coords.longitude,
    acc: t.coords.accuracy,
    session: i(this, E)
  }), t.coords.accuracy <= i(this, P) && (i(this, f) === null ? r(this, f, {
    latitude: t.coords.latitude,
    longitude: t.coords.longitude
  }) : e = u(this, l, G).call(this, i(this, f), t.coords), e >= i(this, b) && (i(this, f).longitude = t.coords.longitude, i(this, f).latitude = t.coords.latitude, i(this, m) || (u(this, l, S).call(this, t.coords.longitude, t.coords.latitude), (n = i(this, p)) == null || n.sendData("/worldorigin/new", {
    gpsCount: i(this, y),
    lat: t.coords.latitude,
    lon: t.coords.longitude,
    session: i(this, E),
    initialPosition: i(this, m)
  })), u(this, l, H).call(this, this.camera, t.coords.longitude, t.coords.latitude), (h = i(this, p)) == null || h.sendData("/gps/accepted", {
    gpsCount: i(this, y),
    cameraX: this.camera.position.x,
    cameraZ: this.camera.position.z,
    session: i(this, E),
    distMoved: e
  }), i(this, M).gpsupdate && i(this, M).gpsupdate(t, e)));
}, /**
 * Calculate haversine distance between two lat/lon pairs.
 *
 * Taken from original A-Frame AR.js location-based components
 */
G = function(t, e) {
  const s = o.MathUtils.degToRad(e.longitude - t.longitude), n = o.MathUtils.degToRad(e.latitude - t.latitude), h = Math.sin(n / 2) * Math.sin(n / 2) + Math.cos(o.MathUtils.degToRad(t.latitude)) * Math.cos(o.MathUtils.degToRad(e.latitude)) * (Math.sin(s / 2) * Math.sin(s / 2));
  return 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 6371e3;
};
class Z {
  /**
   * Create a WebcamRenderer.
   * @param {THREE.WebGLRenderer} renderer - the Three.js renderer.
   * @param {string} videoElementSelector - selector to obtain the HTML video 
   * element to render the webcam feed. If a falsy value (e.g. null or 
   * undefined), a video element will be created.
   * @options {Object} - options to use for initialising the camera. Currently
   * width and height properties are understood.
   */
  constructor(t, e, s) {
    this.renderer = t, this.renderer.autoClear = !1, this.sceneWebcam = new o.Scene();
    let n;
    e ? n = document.querySelector(e) : (n = document.createElement("video"), n.setAttribute("autoplay", !0), n.setAttribute("playsinline", !0), n.style.display = "none", document.body.appendChild(n)), this.geom = new o.PlaneGeometry(), this.texture = new o.VideoTexture(n), this.material = new o.MeshBasicMaterial({ map: this.texture });
    const h = new o.Mesh(this.geom, this.material);
    if (this.sceneWebcam.add(h), this.cameraWebcam = new o.OrthographicCamera(
      -0.5,
      0.5,
      0.5,
      -0.5,
      0,
      10
    ), navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const g = {
        video: {
          width: (s == null ? void 0 : s.width) || 4096,
          height: (s == null ? void 0 : s.height) || 2190,
          facingMode: "environment"
        }
      };
      navigator.mediaDevices.getUserMedia(g).then((T) => {
        console.log("using the webcam successfully..."), n.srcObject = T, n.play();
      }).catch((T) => {
        setTimeout(() => {
          alert(
            `Webcam Error
Name: ` + T.name + `
Message: ` + T.message
          );
        }, 1e3);
      });
    } else
      setTimeout(() => {
        alert("sorry - media devices API not supported");
      }, 1e3);
  }
  /**
   * Update the webcam.
   * Should be called from your Three.js rendering (animation) function.
   */
  update() {
    this.renderer.clear(), this.renderer.render(this.sceneWebcam, this.cameraWebcam), this.renderer.clearDepth();
  }
  /**
   * Free up the memory associated with the webcam.
   * Should be called when your application closes.
   */
  dispose() {
    this.material.dispose(), this.texture.dispose(), this.geom.dispose();
  }
}
const z = new o.Vector3(0, 0, 1), U = new o.Euler(), Q = new o.Quaternion(), X = new o.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)), V = { type: "change" };
class B extends o.EventDispatcher {
  /**
   * Create an instance of DeviceOrientationControls.
   * @param {Object} object - the object to attach the controls to
   * (usually your Three.js camera)
   */
  constructor(t) {
    super(), window.isSecureContext === !1 && console.error("THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)");
    const e = this, s = 1e-6, n = new o.Quaternion();
    this.object = t, this.object.rotation.reorder("YXZ"), this.enabled = !0, this.deviceOrientation = {}, this.screenOrientation = 0, this.alphaOffset = 0, this.deviceOrientationEventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    const h = function(c) {
      e.deviceOrientation = c;
    }, g = function() {
      e.screenOrientation = window.orientation || 0;
    }, T = function(c, D, A, R, C) {
      U.set(A, D, -R, "YXZ"), c.setFromEuler(U), c.multiply(X), c.multiply(Q.setFromAxisAngle(z, -C));
    };
    this.connect = function() {
      g(), window.DeviceOrientationEvent !== void 0 && typeof window.DeviceOrientationEvent.requestPermission == "function" ? window.DeviceOrientationEvent.requestPermission().then(function(c) {
        c == "granted" && (window.addEventListener("orientationchange", g), window.addEventListener(e.deviceOrientationEventName, h));
      }).catch(function(c) {
        console.error("THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:", c);
      }) : (window.addEventListener("orientationchange", g), window.addEventListener(e.deviceOrientationEventName, h)), e.enabled = !0;
    }, this.disconnect = function() {
      window.removeEventListener("orientationchange", g), window.removeEventListener(e.deviceOrientationEventName, h), e.enabled = !1;
    }, this.update = function() {
      if (e.enabled === !1) return;
      const c = e.deviceOrientation;
      if (c) {
        const D = c.alpha ? o.MathUtils.degToRad(c.alpha) + e.alphaOffset : 0, A = c.beta ? o.MathUtils.degToRad(c.beta) : 0, R = c.gamma ? o.MathUtils.degToRad(c.gamma) : 0, C = e.screenOrientation ? o.MathUtils.degToRad(e.screenOrientation) : 0;
        T(e.object.quaternion, D, A, R, C), 8 * (1 - n.dot(e.object.quaternion)) > s && (n.copy(e.object.quaternion), e.dispatchEvent(V));
      }
    }, this.dispose = function() {
      e.disconnect();
    }, this.connect();
  }
}
class $ {
  /**
   * Create a ClickHandler.
   * @param {THREE.WebGLRenderer} - The Three.js renderer on which the click
   * events will be handled.
   */
  constructor(t) {
    this.raycaster = new o.Raycaster(), this.normalisedMousePosition = new o.Vector2(null, null), t.domElement.addEventListener("click", (e) => {
      this.normalisedMousePosition.set(
        e.clientX / t.domElement.clientWidth * 2 - 1,
        -(e.clientY / t.domElement.clientHeight * 2) + 1
      );
    });
  }
  /**
   * Cast a ray into the scene to detect objects.
   * @param {THREE.Camera} - The active Three.js camera, from which the ray
   * will be cast.
   * @param {THREE.Scene} - The active Three.js scene, which the ray will be
   * cast into.
   * @return {Array} - array of all intersected objects.
   */
  raycast(t, e) {
    if (this.normalisedMousePosition.x !== null && this.normalisedMousePosition.y !== null) {
      this.raycaster.setFromCamera(this.normalisedMousePosition, t);
      const s = this.raycaster.intersectObjects(e.children, !1);
      return this.normalisedMousePosition.set(null, null), s;
    }
    return [];
  }
}
export {
  $ as ClickHandler,
  B as DeviceOrientationControls,
  Y as LocationBased,
  N as SphMercProjection,
  Z as WebcamRenderer
};
