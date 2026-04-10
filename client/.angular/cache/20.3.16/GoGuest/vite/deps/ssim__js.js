import {
  __commonJS
} from "./chunk-H2SRQSE4.js";

// node_modules/ssim.js/dist/ssim.web.js
var require_ssim_web = __commonJS({
  "node_modules/ssim.js/dist/ssim.web.js"(exports, module) {
    !(function(t, r) {
      "object" == typeof exports && "object" == typeof module ? module.exports = r() : "function" == typeof define && define.amd ? define([], r) : "object" == typeof exports ? exports.ssim = r() : t.ssim = r();
    })(self, (function() {
      return (() => {
        "use strict";
        var t = { 132: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.bezkrovnySsim = void 0;
          var a = e(490), i = e(971);
          function d(t3, r3, e2) {
            var i2 = t3.data, d2 = r3.data, n = e2.bitDepth, o = e2.k1, h = e2.k2, u = Math.pow(2, n) - 1, f = Math.pow(o * u, 2), v = Math.pow(h * u, 2), l = a.average(i2), w = a.average(d2), s = a.variance(i2, l), g = a.variance(d2, w);
            return (2 * l * w + f) * (2 * a.covariance(i2, d2, l, w) + v) / ((Math.pow(l, 2) + Math.pow(w, 2) + f) * (s + g + v));
          }
          r2.bezkrovnySsim = function(t3, r3, e2) {
            for (var a2 = e2.windowSize, n = Math.ceil(t3.width / a2), o = Math.ceil(t3.height / a2), h = new Array(n * o), u = 0, f = 0; f < t3.height; f += a2) for (var v = 0; v < t3.width; v += a2) {
              var l = Math.min(a2, t3.width - v), w = Math.min(a2, t3.height - f), s = i.sub(t3, v, w, f, l), g = i.sub(r3, v, w, f, l);
              h[u++] = d(s, g, e2);
            }
            return { data: h, width: n, height: o };
          };
        }, 63: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.defaults = void 0, r2.defaults = { windowSize: 11, k1: 0.01, k2: 0.03, bitDepth: 8, downsample: "original", ssim: "weber", maxSize: 256, rgb2grayVersion: "integer" };
        }, 441: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.downsample = void 0;
          var a = e(490), i = e(971);
          function d(t3, r3, e2) {
            var a2 = i.imfilter(t3, r3, "symmetric", "same");
            return i.skip2d(a2, [0, e2, a2.height], [0, e2, a2.width]);
          }
          r2.downsample = function(t3, r3) {
            return "original" === r3.downsample ? (function(t4, r4, e2) {
              void 0 === e2 && (e2 = 256);
              var n = Math.min(t4.width, r4.height) / e2, o = Math.round(n);
              if (o > 1) {
                var h = i.ones(o);
                t4 = d(t4, h = a.divide2d(h, a.sum2d(h)), o), r4 = d(r4, h, o);
              }
              return [t4, r4];
            })(t3[0], t3[1], r3.maxSize) : t3;
          };
        }, 607: function(t2, r2, e) {
          var a = this && this.__assign || function() {
            return (a = Object.assign || function(t3) {
              for (var r3, e2 = 1, a2 = arguments.length; e2 < a2; e2++) for (var i2 in r3 = arguments[e2]) Object.prototype.hasOwnProperty.call(r3, i2) && (t3[i2] = r3[i2]);
              return t3;
            }).apply(this, arguments);
          };
          Object.defineProperty(r2, "__esModule", { value: true }), r2.ssim = r2.getOptions = void 0;
          var i = e(971), d = e(490), n = e(773), o = e(595), h = e(132), u = e(441), f = e(63), v = e(535), l = { fast: n.ssim, original: o.originalSsim, bezkrovny: h.bezkrovnySsim, weber: v.weberSsim };
          function w(t3) {
            var r3 = a(a({}, f.defaults), t3);
            return (function(t4) {
              if (Object.keys(t4).forEach((function(t5) {
                if (!(t5 in f.defaults)) throw new Error('"' + t5 + '" is not a valid option');
              })), "k1" in t4 && ("number" != typeof t4.k1 || t4.k1 < 0)) throw new Error("Invalid k1 value. Default is " + f.defaults.k1);
              if ("k2" in t4 && ("number" != typeof t4.k2 || t4.k2 < 0)) throw new Error("Invalid k2 value. Default is " + f.defaults.k2);
              if (!(t4.ssim in l)) throw new Error("Invalid ssim option (use: " + Object.keys(l).join(", ") + ")");
            })(r3), r3;
          }
          function s(t3, r3, e2) {
            var a2, n2, o2, h2, f2 = (/* @__PURE__ */ new Date()).getTime(), v2 = (function(t4) {
              var r4 = t4[0], e3 = t4[1], a3 = t4[2];
              return l[a3.ssim](r4, e3, a3);
            })((function(t4) {
              var r4 = t4[0], e3 = t4[1], a3 = t4[2], i2 = u.downsample([r4, e3], a3);
              return [i2[0], i2[1], a3];
            })((a2 = (function(t4) {
              var r4 = t4[0], e3 = t4[1], a3 = t4[2];
              if (r4.width !== e3.width || r4.height !== e3.height) throw new Error("Image dimensions do not match");
              return [r4, e3, a3];
            })([t3, r3, w(e2)]), n2 = a2[0], o2 = a2[1], "original" === (h2 = a2[2]).rgb2grayVersion ? [i.rgb2gray(n2), i.rgb2gray(o2), h2] : [i.rgb2grayInteger(n2), i.rgb2grayInteger(o2), h2])));
            return { mssim: void 0 !== v2.mssim ? v2.mssim : d.mean2d(v2), ssim_map: v2, performance: (/* @__PURE__ */ new Date()).getTime() - f2 };
          }
          r2.getOptions = w, r2.ssim = s, r2.default = s;
        }, 490: (t2, r2) => {
          function e(t3) {
            return a(t3) / t3.length;
          }
          function a(t3) {
            for (var r3 = 0, e2 = 0; e2 < t3.length; e2++) r3 += t3[e2];
            return r3;
          }
          function i(t3) {
            for (var r3 = t3.data, e2 = 0, a2 = 0; a2 < r3.length; a2++) e2 += r3[a2];
            return e2;
          }
          function d(t3, r3) {
            for (var e2 = t3.data, a2 = t3.width, i2 = t3.height, d2 = new Array(e2.length), n2 = 0; n2 < e2.length; n2++) d2[n2] = e2[n2] + r3;
            return { data: d2, width: a2, height: i2 };
          }
          function n(t3, r3) {
            return "number" == typeof r3 ? (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = new Array(e2.length), n2 = 0; n2 < e2.length; n2++) d2[n2] = e2[n2] * r4;
              return { data: d2, width: a2, height: i2 };
            })(t3, r3) : (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = r4.data, n2 = new Array(e2.length), o = 0; o < e2.length; o++) n2[o] = e2[o] * d2[o];
              return { data: n2, width: a2, height: i2 };
            })(t3, r3);
          }
          Object.defineProperty(r2, "__esModule", { value: true }), r2.covariance = r2.variance = r2.mean2d = r2.square2d = r2.multiply2d = r2.divide2d = r2.subtract2d = r2.add2d = r2.sum2d = r2.floor = r2.sum = r2.average = void 0, r2.average = e, r2.sum = a, r2.floor = function(t3) {
            for (var r3 = new Array(t3.length), e2 = 0; e2 < t3.length; e2++) r3[e2] = Math.floor(t3[e2]);
            return r3;
          }, r2.sum2d = i, r2.add2d = function(t3, r3) {
            return "number" == typeof r3 ? d(t3, r3) : (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = r4.data, n2 = new Array(e2.length), o = 0; o < i2; o++) for (var h = o * a2, u = 0; u < a2; u++) n2[h + u] = e2[h + u] + d2[h + u];
              return { data: n2, width: a2, height: i2 };
            })(t3, r3);
          }, r2.subtract2d = function(t3, r3) {
            return "number" == typeof r3 ? d(t3, -r3) : (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = r4.data, n2 = new Array(e2.length), o = 0; o < i2; o++) for (var h = o * a2, u = 0; u < a2; u++) n2[h + u] = e2[h + u] - d2[h + u];
              return { data: n2, width: a2, height: i2 };
            })(t3, r3);
          }, r2.divide2d = function(t3, r3) {
            return "number" == typeof r3 ? (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = new Array(e2.length), n2 = 0; n2 < e2.length; n2++) d2[n2] = e2[n2] / r4;
              return { data: d2, width: a2, height: i2 };
            })(t3, r3) : (function(t4, r4) {
              for (var e2 = t4.data, a2 = t4.width, i2 = t4.height, d2 = r4.data, n2 = new Array(e2.length), o = 0; o < e2.length; o++) n2[o] = e2[o] / d2[o];
              return { data: n2, width: a2, height: i2 };
            })(t3, r3);
          }, r2.multiply2d = n, r2.square2d = function(t3) {
            return n(t3, t3);
          }, r2.mean2d = function(t3) {
            return i(t3) / t3.data.length;
          }, r2.variance = function(t3, r3) {
            void 0 === r3 && (r3 = e(t3));
            for (var a2 = 0, i2 = t3.length; i2--; ) a2 += Math.pow(t3[i2] - r3, 2);
            return a2 / t3.length;
          }, r2.covariance = function(t3, r3, a2, i2) {
            void 0 === a2 && (a2 = e(t3)), void 0 === i2 && (i2 = e(r3));
            for (var d2 = 0, n2 = t3.length; n2--; ) d2 += (t3[n2] - a2) * (r3[n2] - i2);
            return d2 / t3.length;
          };
        }, 687: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.conv2 = void 0;
          var a = e(490), i = e(298), d = e(118), n = e(799);
          function o(t3, r3, e2) {
            var a2 = t3.data, i2 = t3.width, d2 = t3.height;
            void 0 === e2 && (e2 = "full");
            for (var o2 = i2 + r3.width - 1, h2 = d2 + r3.height - 1, u2 = n.zeros(h2, o2).data, f2 = 0; f2 < r3.height; f2++) for (var l = 0; l < r3.width; l++) {
              var w = r3.data[f2 * r3.width + l];
              if (w) for (var s = 0; s < d2; s++) for (var g = 0; g < i2; g++) u2[(s + f2) * o2 + g + l] += a2[s * i2 + g] * w;
            }
            return v({ data: u2, width: o2, height: h2 }, e2, d2, r3.height, i2, r3.width);
          }
          function h(t3, r3, e2) {
            var d2 = r3.data, n2 = r3.width, o2 = r3.height;
            void 0 === e2 && (e2 = "full");
            var h2 = f(t3, i.ones(o2, 1), i.ones(1, n2), e2);
            return a.multiply2d(h2, d2[0]);
          }
          function u(t3) {
            for (var r3 = t3.data, e2 = r3[0], a2 = 1; a2 < r3.length; a2++) if (r3[a2] !== e2) return false;
            return true;
          }
          function f(t3, r3, e2, a2) {
            void 0 === a2 && (a2 = "full");
            var i2 = Math.max(r3.height, r3.width), d2 = Math.max(e2.height, e2.width), n2 = o(t3, r3, "full");
            return v(o(n2, e2, "full"), a2, t3.height, i2, t3.width, d2);
          }
          function v(t3, r3, e2, a2, i2, n2) {
            if ("full" === r3) return t3;
            if ("same" === r3) {
              var o2 = Math.ceil((t3.height - e2) / 2), h2 = Math.ceil((t3.width - i2) / 2);
              return d.sub(t3, o2, e2, h2, i2);
            }
            return d.sub(t3, a2 - 1, e2 - a2 + 1, n2 - 1, i2 - n2 + 1);
          }
          r2.conv2 = function() {
            for (var t3 = [], r3 = 0; r3 < arguments.length; r3++) t3[r3] = arguments[r3];
            return t3[2] && t3[2].data ? f.apply(void 0, t3) : u(t3[1]) ? h.apply(void 0, t3) : o.apply(void 0, t3);
          };
        }, 346: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.filter2 = void 0;
          var a = e(687);
          r2.filter2 = function(t3, r3, e2) {
            return void 0 === e2 && (e2 = "same"), a.conv2(r3, (function(t4) {
              for (var r4 = t4.data, e3 = t4.width, a2 = t4.height, i = new Array(r4.length), d = 0; d < a2; d++) for (var n = 0; n < e3; n++) i[d * e3 + n] = r4[(a2 - 1 - d) * e3 + e3 - 1 - n];
              return { data: i, width: e3, height: a2 };
            })(t3), e2);
          };
        }, 470: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.fspecial = void 0;
          var a = e(490);
          r2.fspecial = function(t3, r3, e2) {
            void 0 === r3 && (r3 = 3), void 0 === e2 && (e2 = 1.5);
            var i = (function(t4, r4) {
              for (var e3 = t4.data, a2 = t4.width, i2 = t4.height, d2 = new Array(e3.length), n = 0; n < e3.length; n++) d2[n] = Math.exp(-e3[n] / (2 * Math.pow(r4, 2)));
              return { data: d2, width: a2, height: i2 };
            })((function(t4) {
              for (var r4 = 2 * t4 + 1, e3 = new Array(Math.pow(r4, 2)), a2 = 0; a2 < r4; a2++) for (var i2 = 0; i2 < r4; i2++) e3[a2 * r4 + i2] = Math.pow(a2 - t4, 2) + Math.pow(i2 - t4, 2);
              return { data: e3, width: r4, height: r4 };
            })(r3 = (r3 - 1) / 2), e2), d = a.sum2d(i);
            return a.divide2d(i, d);
          };
        }, 521: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.imfilter = void 0;
          var a = e(20), i = e(389), d = e(490), n = e(346);
          r2.imfilter = function(t3, r3, e2, o) {
            return void 0 === e2 && (e2 = "symmetric"), void 0 === o && (o = "same"), t3 = (function(t4, r4, e3, n2) {
              if (t4 = i.padarray(t4, d.floor([r4 / 2, e3 / 2]), n2), 0 === a.mod(r4, 2) && (t4.data = t4.data.slice(0, -t4.width), t4.height--), 0 === a.mod(e3, 2)) {
                for (var o2 = [], h = 0; h < t4.data.length; h++) (h + 1) % t4.width != 0 && o2.push(t4.data[h]);
                t4.data = o2, t4.width--;
              }
              return t4;
            })(t3, r3.width, r3.height, e2), o = (function(t4) {
              return "same" === t4 && (t4 = "valid"), t4;
            })(o), n.filter2(r3, t3, o);
          };
        }, 971: function(t2, r2, e) {
          var a = this && this.__createBinding || (Object.create ? function(t3, r3, e2, a2) {
            void 0 === a2 && (a2 = e2), Object.defineProperty(t3, a2, { enumerable: true, get: function() {
              return r3[e2];
            } });
          } : function(t3, r3, e2, a2) {
            void 0 === a2 && (a2 = e2), t3[a2] = r3[e2];
          }), i = this && this.__exportStar || function(t3, r3) {
            for (var e2 in t3) "default" === e2 || Object.prototype.hasOwnProperty.call(r3, e2) || a(r3, t3, e2);
          };
          Object.defineProperty(r2, "__esModule", { value: true }), i(e(687), r2), i(e(346), r2), i(e(470), r2), i(e(521), r2), i(e(150), r2), i(e(298), r2), i(e(389), r2), i(e(582), r2), i(e(439), r2), i(e(118), r2), i(e(240), r2), i(e(799), r2);
        }, 928: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.numbers = void 0, r2.numbers = function(t3, r3, e) {
            for (var a = r3 * t3, i = new Array(a), d = 0; d < a; d++) i[d] = e;
            return { data: i, width: r3, height: t3 };
          };
        }, 20: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.mod = void 0, r2.mod = function(t3, r3) {
            return t3 - r3 * Math.floor(t3 / r3);
          };
        }, 150: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.normpdf = void 0, r2.normpdf = function(t3, r3, e) {
            var a = t3.data, i = t3.width, d = t3.height;
            void 0 === r3 && (r3 = 0), void 0 === e && (e = 1);
            for (var n = new Array(a.length), o = 0; o < a.length; o++) {
              var h = (a[o] - r3) / e;
              n[o] = Math.exp(-Math.pow(h, 2) / 2) / (2.5066282746310007 * e);
            }
            return { data: n, width: i, height: d };
          };
        }, 298: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.ones = void 0;
          var a = e(928);
          r2.ones = function(t3, r3) {
            return void 0 === r3 && (r3 = t3), a.numbers(t3, r3, 1);
          };
        }, 389: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.padarray = void 0;
          var a = e(20);
          r2.padarray = function(t3, r3, e2, i) {
            var d = r3[0], n = r3[1];
            return t3.height >= d && t3.width >= n ? (function(t4, r4) {
              for (var e3 = r4[0], a2 = r4[1], i2 = t4.width + 2 * a2, d2 = t4.height + 2 * e3, n2 = new Array(i2 * d2), o = -e3; o < 0; o++) {
                for (var h = -a2; h < 0; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(Math.abs(o) - 1) * t4.width + Math.abs(h) - 1];
                for (h = 0; h < t4.width; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(Math.abs(o) - 1) * t4.width + h];
                for (h = t4.width; h < t4.width + a2; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(Math.abs(o) - 1) * t4.width + 2 * t4.width - h - 1];
              }
              for (o = 0; o < t4.height; o++) {
                for (h = -a2; h < 0; h++) n2[(o + e3) * i2 + h + a2] = t4.data[o * t4.width + Math.abs(h) - 1];
                for (h = 0; h < t4.width; h++) n2[(o + e3) * i2 + h + a2] = t4.data[o * t4.width + h];
                for (h = t4.width; h < t4.width + a2; h++) n2[(o + e3) * i2 + h + a2] = t4.data[o * t4.width + 2 * t4.width - h - 1];
              }
              for (o = t4.height; o < t4.height + e3; o++) {
                for (h = -a2; h < 0; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(2 * t4.height - o - 1) * t4.width + Math.abs(h) - 1];
                for (h = 0; h < t4.width; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(2 * t4.height - o - 1) * t4.width + h];
                for (h = t4.width; h < t4.width + a2; h++) n2[(o + e3) * i2 + h + a2] = t4.data[(2 * t4.height - o - 1) * t4.width + 2 * t4.width - h - 1];
              }
              return { data: n2, width: i2, height: d2 };
            })(t3, [d, n]) : (function(t4, r4) {
              for (var e3 = (function(t5, r5) {
                return { data: t5.data.concat(r5.data), height: t5.height + r5.height, width: t5.width };
              })(t4, (function(t5) {
                for (var r5 = t5.data, e4 = t5.width, a2 = t5.height, i3 = new Array(r5.length), d3 = 0; d3 < a2; d3++) for (var n3 = 0; n3 < e4; n3++) i3[d3 * e4 + n3] = r5[(a2 - 1 - d3) * e4 + n3];
                return { data: i3, width: e4, height: a2 };
              })(t4)), i2 = t4.height + 2 * r4, d2 = new Array(t4.width * i2), n2 = -r4; n2 < t4.height + r4; n2++) for (var o = 0; o < t4.width; o++) d2[(n2 + r4) * t4.width + o] = e3.data[a.mod(n2, e3.height) * t4.width + o];
              return { data: d2, width: t4.width, height: i2 };
            })((function(t4, r4) {
              for (var e3 = t4.width + 2 * r4, i2 = new Array(e3 * t4.height), d2 = (function(t5, r5) {
                for (var e4 = t5.width + r5.width, a2 = new Array(t5.height * e4), i3 = 0; i3 < t5.height; i3++) {
                  for (var d3 = 0; d3 < t5.width; d3++) a2[i3 * e4 + d3] = t5.data[i3 * t5.width + d3];
                  for (d3 = 0; d3 < r5.width; d3++) a2[i3 * e4 + d3 + t5.width] = r5.data[i3 * r5.width + d3];
                }
                return { data: a2, width: e4, height: t5.height };
              })(t4, (function(t5) {
                for (var r5 = t5.data, e4 = t5.width, a2 = t5.height, i3 = new Array(r5.length), d3 = 0; d3 < a2; d3++) for (var n3 = 0; n3 < e4; n3++) i3[d3 * e4 + n3] = r5[d3 * e4 + e4 - 1 - n3];
                return { data: i3, width: e4, height: a2 };
              })(t4)), n2 = 0; n2 < t4.height; n2++) for (var o = -r4; o < t4.width + r4; o++) i2[n2 * e3 + o + r4] = d2.data[n2 * d2.width + a.mod(o, d2.width)];
              return { data: i2, width: e3, height: t4.height };
            })(t3, n), d);
          };
        }, 582: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.rgb2grayInteger = r2.rgb2gray = void 0, r2.rgb2gray = function(t3) {
            for (var r3 = t3.data, e = t3.width, a = t3.height, i = new Uint8Array(e * a), d = 0; d < r3.length; d += 4) i[d / 4] = 0.29894 * r3[d] + 0.58704 * r3[d + 1] + 0.11402 * r3[d + 2] + 0.5;
            return { data: Array.from(i), width: e, height: a };
          }, r2.rgb2grayInteger = function(t3) {
            for (var r3 = t3.data, e = t3.width, a = t3.height, i = new Array(e * a), d = 0; d < r3.length; d += 4) i[d / 4] = 77 * r3[d] + 150 * r3[d + 1] + 29 * r3[d + 2] + 128 >> 8;
            return { data: i, width: e, height: a };
          };
        }, 439: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.skip2d = void 0, r2.skip2d = function(t3, r3, e) {
            for (var a = r3[0], i = r3[1], d = r3[2], n = e[0], o = e[1], h = e[2], u = Math.ceil((h - n) / o), f = Math.ceil((d - a) / i), v = new Array(u * f), l = 0; l < f; l++) for (var w = 0; w < u; w++) {
              var s = a + l * i, g = n + w * o;
              v[l * u + w] = t3.data[s * t3.width + g];
            }
            return { data: v, width: u, height: f };
          };
        }, 118: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.sub = void 0, r2.sub = function(t3, r3, e, a, i) {
            for (var d = t3.data, n = t3.width, o = new Array(i * e), h = 0; h < e; h++) for (var u = 0; u < i; u++) o[h * i + u] = d[(a + h) * n + r3 + u];
            return { data: o, width: i, height: e };
          };
        }, 240: (t2, r2) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.transpose = void 0, r2.transpose = function(t3) {
            for (var r3 = t3.data, e = t3.width, a = t3.height, i = new Array(e * a), d = 0; d < a; d++) for (var n = 0; n < e; n++) i[n * a + d] = r3[d * e + n];
            return { data: i, height: e, width: a };
          };
        }, 799: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.zeros = void 0;
          var a = e(928);
          r2.zeros = function(t3, r3) {
            return void 0 === r3 && (r3 = t3), a.numbers(t3, r3, 0);
          };
        }, 595: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.originalSsim = void 0;
          var a = e(490), i = e(971);
          r2.originalSsim = function(t3, r3, e2) {
            var d = i.fspecial("gaussian", e2.windowSize, 1.5), n = Math.pow(2, e2.bitDepth) - 1, o = Math.pow(e2.k1 * n, 2), h = Math.pow(e2.k2 * n, 2);
            d = a.divide2d(d, a.sum2d(d));
            var u = i.filter2(d, t3, "valid"), f = i.filter2(d, r3, "valid"), v = a.square2d(u), l = a.square2d(f), w = a.multiply2d(u, f), s = a.square2d(t3), g = a.square2d(r3), c = a.subtract2d(i.filter2(d, s, "valid"), v), p = a.subtract2d(i.filter2(d, g, "valid"), l), m = a.subtract2d(i.filter2(d, a.multiply2d(t3, r3), "valid"), w);
            if (o > 0 && h > 0) {
              var y = a.add2d(a.multiply2d(w, 2), o), b = a.add2d(a.multiply2d(m, 2), h), M = a.add2d(a.add2d(v, l), o), _ = a.add2d(a.add2d(c, p), h);
              return a.divide2d(a.multiply2d(y, b), a.multiply2d(M, _));
            }
            var O = a.multiply2d(w, 2), j = a.multiply2d(m, 2), A = a.add2d(v, l), k = a.add2d(c, p);
            return a.divide2d(a.multiply2d(O, j), a.multiply2d(A, k));
          };
        }, 773: (t2, r2, e) => {
          Object.defineProperty(r2, "__esModule", { value: true }), r2.ssim = void 0;
          var a = e(490), i = e(971);
          r2.ssim = function(t3, r3, e2) {
            var d = i.normpdf((function(t4) {
              for (var r4 = Math.floor(t4 / 2), e3 = new Array(2 * r4 + 1), a2 = -r4; a2 <= r4; a2++) e3[a2 + r4] = Math.abs(a2);
              return { data: e3, width: e3.length, height: 1 };
            })(e2.windowSize), 0, 1.5), n = Math.pow(2, e2.bitDepth) - 1, o = Math.pow(e2.k1 * n, 2), h = Math.pow(e2.k2 * n, 2);
            d = a.divide2d(d, a.sum2d(d));
            var u = i.transpose(d), f = i.conv2(t3, d, u, "valid"), v = i.conv2(r3, d, u, "valid"), l = a.square2d(f), w = a.square2d(v), s = a.multiply2d(f, v), g = a.square2d(t3), c = a.square2d(r3), p = a.subtract2d(i.conv2(g, d, u, "valid"), l), m = a.subtract2d(i.conv2(c, d, u, "valid"), w), y = a.subtract2d(i.conv2(a.multiply2d(t3, r3), d, u, "valid"), s);
            return o > 0 && h > 0 ? (function(t4, r4, e3, i2, d2, n2, o2, h2) {
              var u2 = a.add2d(a.multiply2d(t4, 2), o2), f2 = a.add2d(a.multiply2d(r4, 2), h2), v2 = a.add2d(a.add2d(e3, i2), o2), l2 = a.add2d(a.add2d(d2, n2), h2);
              return a.divide2d(a.multiply2d(u2, f2), a.multiply2d(v2, l2));
            })(s, y, l, w, p, m, o, h) : (function(t4, r4, e3, i2, d2, n2) {
              var o2 = a.multiply2d(t4, 2), h2 = a.multiply2d(r4, 2), u2 = a.add2d(e3, i2), f2 = a.add2d(d2, n2);
              return a.divide2d(a.multiply2d(o2, h2), a.multiply2d(u2, f2));
            })(s, y, l, w, p, m);
          };
        }, 535: function(t2, r2) {
          var e = this && this.__assign || function() {
            return (e = Object.assign || function(t3) {
              for (var r3, e2 = 1, a2 = arguments.length; e2 < a2; e2++) for (var i2 in r3 = arguments[e2]) Object.prototype.hasOwnProperty.call(r3, i2) && (t3[i2] = r3[i2]);
              return t3;
            }).apply(this, arguments);
          };
          function a(t3, r3, e2, a2) {
            return { rightEdge: e2[r3 * a2 + t3 + 1], bottomEdge: e2[(r3 + 1) * a2 + t3], bottomRightEdge: e2[(r3 + 1) * a2 + t3 + 1] };
          }
          function i(t3, r3) {
            for (var e2 = t3.width, i2 = t3.height, d2 = t3.data, n2 = e2 + 1, o2 = i2 + 1, h2 = new Int32Array(n2 * o2), u2 = i2 - 1; u2 >= 0; --u2) for (var f = e2 - 1; f >= 0; --f) {
              var v = a(f, u2, h2, n2), l = v.rightEdge, w = v.bottomEdge, s = v.bottomRightEdge;
              h2[u2 * n2 + f] = r3(d2[u2 * e2 + f], f, u2) + l + w - s;
            }
            return { data: h2, height: o2, width: n2 };
          }
          function d(t3, r3, e2) {
            for (var i2 = t3.width, d2 = t3.height, n2 = t3.data, o2 = r3.data, h2 = i2 + 1, u2 = d2 + 1, f = new Int32Array(h2 * u2), v = d2 - 1; v >= 0; --v) for (var l = i2 - 1; l >= 0; --l) {
              var w = a(l, v, f, h2), s = w.rightEdge, g = w.bottomEdge, c = w.bottomRightEdge, p = v * i2 + l;
              f[v * h2 + l] = e2(n2[p], o2[p], l, v) + s + g - c;
            }
            return { data: f, height: u2, width: h2 };
          }
          function n(t3, r3, e2) {
            for (var a2 = t3.width, i2 = t3.height, d2 = t3.data, n2 = a2 - 1, o2 = i2 - 1, h2 = n2 - r3 + 1, u2 = o2 - r3 + 1, f = new Int32Array(h2 * u2), v = 0; v < o2; ++v) for (var l = 0; l < n2; ++l) if (l < h2 && v < u2) {
              var w = d2[a2 * v + l] - d2[a2 * v + l + r3] - d2[a2 * (v + r3) + l] + d2[a2 * (v + r3) + l + r3];
              f[v * h2 + l] = w / e2;
            }
            return { height: u2, width: h2, data: f };
          }
          function o(t3, r3) {
            return n(i(t3, (function(t4) {
              return t4;
            })), r3, 1);
          }
          function h(t3, r3, e2) {
            for (var a2 = e2 * e2, d2 = n(i(t3, (function(t4) {
              return t4 * t4;
            })), e2, 1), o2 = 0; o2 < r3.data.length; ++o2) {
              var h2 = r3.data[o2] / a2, u2 = d2.data[o2] / a2, f = h2 * h2;
              d2.data[o2] = 1024 * (u2 - f);
            }
            return d2;
          }
          function u(t3, r3, e2, a2, i2) {
            for (var o2 = i2 * i2, h2 = n(d(t3, r3, (function(t4, r4) {
              return t4 * r4;
            })), i2, 1), u2 = 0; u2 < e2.data.length; ++u2) h2.data[u2] = 1024 * (h2.data[u2] / o2 - e2.data[u2] / o2 * (a2.data[u2] / o2));
            return h2;
          }
          Object.defineProperty(r2, "__esModule", { value: true }), r2.weberSsim = r2.windowCovariance = r2.windowVariance = r2.windowSums = r2.windowMatrix = r2.partialSumMatrix2 = r2.partialSumMatrix1 = void 0, r2.partialSumMatrix1 = i, r2.partialSumMatrix2 = d, r2.windowMatrix = n, r2.windowSums = o, r2.windowVariance = h, r2.windowCovariance = u, r2.weberSsim = function(t3, r3, a2) {
            for (var i2 = a2.bitDepth, d2 = a2.k1, n2 = a2.k2, f = a2.windowSize, v = Math.pow(2, i2) - 1, l = d2 * v * (d2 * v), w = n2 * v * (n2 * v), s = f * f, g = e(e({}, t3), { data: Int32Array.from(t3.data, (function(t4) {
              return t4 + 0.5;
            })) }), c = e(e({}, r3), { data: Int32Array.from(r3.data, (function(t4) {
              return t4 + 0.5;
            })) }), p = o(g, f), m = h(g, p, f), y = o(c, f), b = h(c, y, f), M = u(g, c, p, y, f), _ = p.data.length, O = 0, j = new Array(_), A = 0; A < _; ++A) {
              var k = p.data[A] / s, P = y.data[A] / s, S = m.data[A] / 1024, x = b.data[A] / 1024, E = (2 * k * P + l) * (M.data[A] / 1024 * 2 + w) / (k * k + P * P + l) / (S + x + w);
              j[A] = E, 0 == A ? O = E : O += (E - O) / (A + 1);
            }
            return { data: j, width: p.width, height: p.height, mssim: O };
          };
        } }, r = {};
        return (function e(a) {
          if (r[a]) return r[a].exports;
          var i = r[a] = { exports: {} };
          return t[a].call(i.exports, i, i.exports, e), i.exports;
        })(607);
      })();
    }));
  }
});
export default require_ssim_web();
//# sourceMappingURL=ssim__js.js.map
