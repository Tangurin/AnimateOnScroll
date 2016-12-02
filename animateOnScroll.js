(function () {
    'use strict';
    /*===========================
    AnimateOnScroll
    ===========================*/
    var AnimateOnScroll = {
        active: false,
        elements: [],
        offsets: [],
        zindex: 1,
        options: {},
        onLoadCallback: null,
        debug: true,
        initialize: function(onLoadCallback) {
            AnimateOnScroll.onLoadCallback = onLoadCallback;
            if (AnimateOnScroll.active) {
                AnimateOnScroll.runOnLoadCallback(onLoadCallback);
                return true;
            }

            AnimateOnScroll.options = {
                opacity: 1,
                top: 0,
                scale: 1,
                rotate: 0,
            };

            //Let content load before loading elements (Some element has no height at start)
            setTimeout(AnimateOnScroll.initializeElements, 400)
            AnimateOnScroll.active = true;
        },
        initializeElements: function() {
            var $elements = $('.animateOnScroll:not(.animateOnScrollFinished)');
            if ($elements.length > 0) {
                var elements = [];
                $elements.each(function() {
                    var $element = $(this);
                    $element.options = {
                        removeWhenVisible: true,
                        removeWhenAlreadyVisible: true,
                        callbacks: {
                            afterVisible: function($element) {
                                AnimateOnScroll.initializeAnimation($element);
                            },
                            alreadyVisible: function($element) {
                                AnimateOnScroll.animationFinished($element);
                            },
                            notAlreadyVisible: function($element) {
                                AnimateOnScroll.prepareElement($element);
                            }
                        }
                    };
                    elements.push($element);
                });
                ScrollCollisionHandler.initialize(elements);
            }

            $(document).trigger('AnimateOnScrollInitialized');
        },
        getStyleProperty: function(option, optionValue, style) {
            var webkitTransform = style['-webkit-transform'] || '';
            var msTransform = style['-ms-transform'] || '';
            var transform = style['transform'] || '';
            if (option == 'scale' || option == 'rotate' || option == 'translate') {
                webkitTransform += ' '+ option +'('+ optionValue +')';
                msTransform += ' '+ option +'('+ optionValue +')';
                transform += ' '+ option +'('+ optionValue +')';

                style['-webkit-transform'] = webkitTransform;
                style['-ms-transform'] = msTransform;
                style['transform'] = transform;
            } else {
                style[option] = optionValue;
            }

            return style;
        },
        prepareElement: function($element) {
            var speed = $element.data('speed') || 400;

            var options = AnimateOnScroll.options;
            var style = {};
            var defaultStyle = {};
            $.each(options, function(option, defaultValue) {
                if (typeof $element.data(option) != 'undefined') {
                    var optionValue = $element.data(option);
                    style = AnimateOnScroll.getStyleProperty(option, optionValue, style);
                }
                defaultStyle = AnimateOnScroll.getStyleProperty(option, defaultValue, defaultStyle);
            });

            $element.css(style);
            defaultStyle.transition = 'all '+ speed +'ms';
            $element.defaultStyle = defaultStyle;
            AnimateOnScroll.animationFinished($element);

            return $element;
        },
        initializeAnimation: function($element) {
            var delay = $element.data('delay') || 0;
            //var noDelayBelow = $element.data('nodelaybelow') || 0;
            //    noDelayBelow = parseInt(noDelayBelow);
            //var windowWidth = AnimateOnScroll.window.width();

            //if (delay > 0 && (noDelayBelow == 0 || windowWidth > noDelayBelow)) {
            if (delay > 0) {
                setTimeout(function() {
                    AnimateOnScroll.animate($element);
                }, delay);
                return true;
            }

            AnimateOnScroll.animate($element);
        },
        animate: function($element) {
            if (typeof $element.defaultStyle == 'undefined') {
                return false;
            }
            $.extend($element.defaultStyle, {'z-index': AnimateOnScroll.updateZindex()})
            $element.css( $element.defaultStyle );
            AnimateOnScroll.animationFinished($element);
        },
        animationFinished: function($element) {
            $element.addClass('animateOnScrollFinished');
        },
        updateZindex: function() {
            return AnimateOnScroll.zindex++;
        },
        runOnLoadCallback: function(callback) {
            var callback = typeof callback == 'function' ? callback : AnimateOnScroll.onLoadCallback;
            if (typeof callback == 'function') {
                callback();
            }
        },
        debug: function(str) {
            if (AnimateOnScroll.debug) {
                console.log(str);
            }
        }
    };
    window.AnimateOnScroll = AnimateOnScroll;
})();

/*===========================
AnimateOnScroll AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = window.AnimateOnScroll;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return window.AnimateOnScroll;
    });
}
