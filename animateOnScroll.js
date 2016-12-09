(function () {
    'use strict';
    /*===========================
    AnimateOnScroll
    ===========================*/
    var AnimateOnScroll = {
        active: false,
        elements: [],
        offsets: [],
        defaultProperties: {
            opacity: 1,
            top: 0,
            left: 0,
            translate: 0,
            translateX: 0,
            translateY: 0,
            scale: 1,
            rotate: 0,
        },
        zindex: 1,
        onLoadCallback: null,
        debug: true,
        initialize: function(onLoadCallback) {
            AnimateOnScroll.onLoadCallback = onLoadCallback;
            if (AnimateOnScroll.active) {
                AnimateOnScroll.runOnLoadCallback(onLoadCallback);
                return true;
            }

            //Let content load before loading elements (Some element has no height at start)
            setTimeout(AnimateOnScroll.initializeElements, 400)
            AnimateOnScroll.active = true;
        },
        initializeElements: function() {
            var $elements = $('[data-animateonscroll]:not(.animateOnScrollFinished)');
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
        },
        setTransformProperty: function(styleProperty, $element, property, propertyValue) {
            //Make sure we don't override current existing transforms
            var webkitTransform = $element[styleProperty]['-webkit-transform'] || '';
            var msTransform = $element[styleProperty]['-ms-transform'] || '';
            var transform = $element[styleProperty]['transform'] || '';

            //Set transform values
            webkitTransform += ' '+ property +'('+ propertyValue +')';
            msTransform += ' '+ property +'('+ propertyValue +')';
            transform += ' '+ property +'('+ propertyValue +')';

            $element[styleProperty]['-webkit-transform'] = webkitTransform;
            $element[styleProperty]['-ms-transform'] = msTransform;
            $element[styleProperty]['transform'] = transform;
        },
        setElementStyles: function(propertyConfigurations, $element) {
            //Get alla property settings
            var configurations = propertyConfigurations.split('&');
            var property;
            var sorted = {};
            for (var i in configurations ) {
                var configuration = configurations[i].split('=');
                if (configuration.length != 2) {
                    continue;
                }
                //If first, fetch the property type example: opacity, scale
                if (i == 0) {
                    //Make sure it is a valid property
                    var defaultPropertyValue = AnimateOnScroll.defaultProperties[configuration[0]];
                    if (typeof defaultPropertyValue == 'undefined') {
                        return false;
                    }
                    //Store the current property to a variable
                    property = configuration[0]; 
                    
                    //Replace with transforms to use hardware rendering
                    property = property.replace('top', 'translateY');
                    property = property.replace('left', 'translateX');
                    
                    //Set the property value
                    sorted = {
                        value: configuration[1]
                    };
                    continue;
                }
                //Add extra settings to the sorted array
                sorted[configuration[0]] = configuration[1];
            }

            //Store speed, easing, propertyValue with fallback values
            var propertyValue = sorted.value;
            var speed = sorted.speed || 400;
            var easing = sorted.easing || 'ease';
            
            var transformOptions = [
                'scale',
                'rotate',
                'translate',
                'translateY',
                'translateX',
            ];
            var filterTransforms = transformOptions.filter(function(str) {
                return str == property;
            });

            var transitionProperty = '';
            if (filterTransforms.length > 0) {
                //Set transform style to animate from
                AnimateOnScroll.setTransformProperty('style', $element, property, propertyValue);
                //Set transform style to animate back to
                AnimateOnScroll.setTransformProperty('defaultStyle', $element, property, defaultPropertyValue);
                //Store current property transition settings
                transitionProperty = 'transform';
            } else {
                //Set default value to animate back to
                $element.defaultStyle[property] = defaultPropertyValue;
                //Set style property to animate from
                $element.style[property] = propertyValue;
                //Store current property transition settings
                transitionProperty = property;
            }

            //Make sure there will be no duplicate of transition
            if ($.inArray(transitionProperty, $element.style.transitionArray)) {
                //Add the transition to an array
                $element.transitionArray.push(transitionProperty +' '+ speed +'ms '+ easing);
            }

            return $element;
        },
        prepareElement: function($element) {
            var configuration = $element.data('animateonscroll') || '';
            configuration = configuration.split('|');
            if (configuration[0] == '') {
                return false;
            }

            $element.style = {};
            $element.defaultStyle = {};
            $element.transitionArray = [];

            for (var i in configuration) {
                //Store the style which the element will animate from
                AnimateOnScroll.setElementStyles(configuration[i], $element);
            }

            //Set transition
            $element.defaultStyle.transition = $element.transitionArray.join(', ');

            //Set the element style in the DOM
            $element.css($element.style);

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
            //$.extend($element.defaultStyle, {'z-index': AnimateOnScroll.updateZindex()})
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
