# Desciption
这是一个swiper的js动画插件，语法参考并类似[swiper.animate.js](https://www.swiper.com.cn/usage/animate/index.html)，[swiper.animate-twice](http://bbs.swiper.com.cn/forum.php?mod=viewthread&tid=328&extra=page%3D1)

# Usage
1. 载入[jquery.js](https://jquery.com/)或者[zepto.js](https://zeptojs.com/)和[swiper-effect.js](https://github.com/maoyonglong/swiper-effect)
```html
<script src="jquery.js"></script>
<!-- 或者 -->
<script src="zepto.js"></script>
<!-- 如果使用velocity -->
<script src="velocity.js"></script>
<!-- 载入插件 -->
<script src="swiper-effect.js"></script>
```
2. 添加动画元素  
`eff`是默认的动画类名   
`data-eff-in`和`data-eff-out`是控制默认的dataset。   
dataset支持的语法是`<effect>:<args1>,<args2>,...` ，表示触发动画时调用`effect($effs, args1, args2)`，如果没有参数，直接`<effect>`   
而其中的`<args>`可以是：  
数组 -> `[1, 2, 3]`  
字符串 -> `asd`, 或加上单引号`'asd'`，默认只会去掉第一层的单引号，比如，`'132'd'`就是字符串`123'd ` 
数字 -> `123456`  
对象 -> `duration=1000;delay=500`会被转成`{duration: 1000, delay: 5000}`   
```js
<div class="swiper-slide">
<p class="eff" data-eff-in="velocity:slideDown,duration=1000;delay=500" data-eff-out="velocity:slideUp,duration=1000;delay=500">内容</p>
</div>
```
3. 添加effect（就是data-eff-in和data-eff-out）调用的函数
```js
// velocity是<effect>的名字，command和opts都是传入的参数
// $effs表示当前slide中所有的动画元素对象
SwiperEffect.addEffect('velocity', function ($effs, command, opts) {
  // 这是velocity.js的1.5版本写法
  // 在这个例子中是：
  // command -> 进入动画是slideUp，推出动画是slideDown
  // opts -> { duration: 1000, delay: 500 }
  $effs.velocity(command, opts)
})
```
4.  初始化时隐藏元素并在需要的时刻开始动画
```js
//Swiper5
var mySwiper = new Swiper ('.swiper-container', {
  on:{
    init: function(){
      swiperEffectCache(this); //缓存swiper.slides
      swiperEffect(this); //初始化完成开始动画
    }, 
    slideChangeTransitionEnd: function(){ 
      // 触发动画即调用data-eff-in和data-eff-out表示的函数
      swiperEffect(this); //每个slide切换结束时也运行当前slide动画
      // swiperEffect默认顺序执行in和out动画
      // 如果需要分别控制in和out动画，需要使用swiperEffectIn和swiperEffectOut
    } 
  }
})
```
5. 可以更改dataset的名字和动画类名
```js
SwiperEffect.setEffectClass('.ani') // => 类名改成ani
SwiperEffect.setEffectDataSetName('slide')
// => dataset改为data-slide-in和data-slide-out
```
6. 如果有多个Swiper实例，也需要有多个SwiperEffect是实例
```js
var otherSwiperEffect = SwiperEffect.factory()
```
7. 移除和获取effects，需要注意改变effects会影响到所有SwiperEffect实例
```js
SwiperEffect.getEffects()
SwiperEffect.removeEffect('velocity')
```