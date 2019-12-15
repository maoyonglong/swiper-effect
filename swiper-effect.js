/**
 * @version 1.0.0
 * @author maoyonglong
 * @registory https://github.com/maoyonglong/swiper-effect.git
 */
var SwiperEffect = (function () {
  if (typeof $ !== 'function') {
    console.error('please import jquery or zepto before.')
  }

  // the classname of animation object
  var _effClass = '.eff'
  // dataset name
  var _datasetName = 'eff' // => data-eff-in, data-eff-out

  var _effects = {}

  // doesn't use $.map becase it will concat array that I don't expect
  // $.map([1, [2]], item => item) => [1, 2] but I need to be [1, [2]]
  if (!('map' in Array.prototype)) {
    Array.prototype.map = function (cb) {
      var result = []
      for (var i = 0, len = this.length; i < len; i++) {
        result.push(cb.call(this[i], this[i], i))
      }
      return result
    }
  }

  // parse desciption to:
  // {
  //   slideIn: {
  //     effect: '',
  //     params: []
  //   },
  //   slideOut: {
  //     // ...
  //   }
  // }
  function parseDesc (desc) {
    var matchEffectParamsRe = /(.*?):(.*)/
    var matchKeyValRe = /(.*?)=(.*)/
    var matches = parseMatch(desc, matchEffectParamsRe, function (effect, paramsStr) {
      var params = paramsStr.split(',')
      // params => [ [ param1Equal1, param1Equal2, ... ], [ ... ] ]
      params = params.map(function (param) {
        return param.split(';')
      })
      // params => [ param1, param2, ... ]
      params = params.map(function (param) {
        var _arg = {}
        $.each(param, function (i, paramStr) {
          var matches = parseMatch(paramStr, matchKeyValRe, function (key, val) {
            return [ key, val ]
          })
          if (matches === null) {
            var calcVal = +paramStr
            if (isNaN(calcVal)) {
              _arg = paramStr
              // remove the first layout `''`
              if (_arg.indexOf("'") === 0) {
                _arg = paramStr.substring(1, paramStr.length-1)
              }
            } else {
              _arg = calcVal
            }
          } else {
            _arg[matches[0]] = JSON.parse(matches[1].replace(/'/g, ''))
          }
        })
        return _arg
      })
      return [ effect, params ]
    })
    return matches === null ? { effect: desc, params: [] } : { effect: matches[0], params: matches[1] }
    function parseMatch (str, re, cb) {
      var matches = str.match(re)
      return matches === null ? null : cb.call(this, matches[1], matches[2])
    }
  }

  function factory () {
    var _caches = []
    // [
    //   // slide1
    //   [
    //     // eff1
    //     {
    //       slideIn: '',
    //       slideOut: ''
    //     }
    //   ],
    //   // ...
    // ]
  
    var _$slides = null // => $(swiper.slides)
  
    function record ($slide, index) {
      var _slide = _caches[index] = []
      var $effs = $slide.find(_effClass)
      $effs.each(function (idx, eff) {
        var _eff = _slide[idx] = {}
        var $eff = $(eff)
        var dataSlideIn = $eff.data(_datasetName + '-in')
        var dataSlideOut = $eff.data(_datasetName + '-out')
        if (typeof dataSlideIn === 'string') _eff['slideIn'] = parseDesc(dataSlideIn)
        if (typeof dataSlideOut === 'string') _eff['slideOut'] = parseDesc(dataSlideOut)
      })
    }
  
    function genSlideFn (direction) {
      return function (index) {
        var _cache = _caches[index]
        // if exists animation
        if (_cache.length > 0) {
          _cache.forEach(function (c) {
            var slideDirection = c['slide'+direction]
            var $slide = _$slides.eq(index)
            if (slideDirection) _effects[slideDirection.effect].apply(_effects, [$slide.find(_effClass)].concat(slideDirection.params))
          })
        }
      }
    }
  
    var slideIn = genSlideFn('In')
    var slideOut = genSlideFn('Out')
  
    function cache (index) {
      var $activeSlide = _$slides.eq(index)
      if (!_caches[index]) {
        record($activeSlide, index)
      }
    }
  
    function swiperEffectCache (swiper) {
      _$slides = $(swiper.slides)
    }
  
    function genSwiperEffectFn (cb) {
      return function (swiper) {
        var activeIndex = swiper.activeIndex
        cache(activeIndex)
        cb(activeIndex)
      }
    }
  
    var swiperEffect = genSwiperEffectFn(function (activeIndex) {
      slideIn(activeIndex)
      slideOut(activeIndex)
    })
  
    var swiperEffectIn = genSwiperEffectFn(slideIn)
    var swiperEffectOut = genSwiperEffectFn(slideOut)
  
    return {
      swiperEffectCache, swiperEffectCache,
      swiperEffect: swiperEffect,
      swiperEffectIn, swiperEffectIn,
      swiperEffectOut, swiperEffectOut,
      setEffectClass: function (effClass) {
        _effClass = effClass
      },
      setEffectDataSetName: function (name) {
        _datasetName = name
      },
      addEffect: function (effect, fn) {
        var _effect = _effects[effect]
        if (typeof _effect === 'undefined') {
          _effects[effect] = fn
        } else {
          console.error('this effect has already been existed.')
        }
      },
      removeEffect: function (effect) {
        var _effect = _effects[effect]
        if (typeof _effect !== 'undefined') {
          delete _effects[effect]
        } else {
          console.error('this effect does not exists.')
        }
      },
      factory: factory,
      getEffects: function () {
        return _effects
      }
    }
  }

  return factory()
})()
