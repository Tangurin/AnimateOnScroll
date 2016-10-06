var AnimateOnScroll = {
    elements: [],
    elementLength: 0,
    offsets: [],
    scrollElement: null,
    windowHeight: 0,
    windowInnerHeight: 0,
    zindex: 0,
    debug: true,
    options: {},
    initialize: function(scrollElement) {
        var $window = $(window);
        AnimateOnScroll.windowHeight = $window.height();
        AnimateOnScroll.windowInnerHeight = $window.innerHeight();
        AnimateOnScroll.scrollElement = scrollElement || $window;

        AnimateOnScroll.options = {
            opacity: 1,
            top: 0,
            scale: 1,
            rotate: 0,
        };

        //Let content load before loading elements (Some element has no height at start)
        setTimeout(AnimateOnScroll.initializeElements, 400)
    },
    initializeElements: function() {
        if (!AnimateOnScroll.setElements()) return false;
        AnimateOnScroll.listenForScroll();
    },
    setElements: function() {
        var $elements = $('.animateOnScroll');
        var elementLength = $elements.length;
        if (elementLength > 0) {
            AnimateOnScroll.elementLength = elementLength;
            var $element;
            var visible;
            for (var i = 0; i < elementLength; i++) {
                $element = $($elements[i]);
                visible = AnimateOnScroll.isVisible($element);

                if (!visible) {
                    var topOffset = $element.offset().top;
                    var elementOffset = $element.data('offset') || 0;
                    AnimateOnScroll.elements[i] = $element;
                    AnimateOnScroll.offsets[i] = topOffset + elementOffset;
                    AnimateOnScroll.setElementStyles($element);
                }
            }
            return true;
        }
        return false;
    },
    isVisible: function($element) {
      var rect = $element[0].getBoundingClientRect();
      var viewHeight = Math.max(AnimateOnScroll.windowHeight, AnimateOnScroll.windowInnerHeight);
      var isVisible = !(rect.bottom < 0 || rect.top - viewHeight >= 0);
      return isVisible;
    },
    listenForScroll: function() {
        ScrollHandler.initialize(AnimateOnScroll.scrollElement);
        
        var offsets = AnimateOnScroll.offsets;
        AnimateOnScroll.scrollElement.on('ScrollHandler-Scroll', function() {
            var $this = $(this);
            var currentScroll = $this.scrollTop();
            var collision = currentScroll + AnimateOnScroll.windowHeight;
            var $element;
            var offset = 0;
            for (i = 0; i < AnimateOnScroll.elementLength; i++) {
                offset = AnimateOnScroll.offsets[i];
                if (collision > offset) {
                    AnimateOnScroll.prepareAnimation(AnimateOnScroll.elements[i]);
                    delete AnimateOnScroll.elements[i];
                    delete AnimateOnScroll.offsets[i];
                }
            }
        });
    },
    getStyleProperty: function(option, optionValue, style) {;
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
    setElementStyles: function($element) {
        var speed = $element.data('speed') || 400;
        var style = {
            'position': 'relative',
            'zindex': AnimateOnScroll.updateZindex,
        };

        var options = AnimateOnScroll.options;
        var defaultStyle = {};
        $.each(options, function(option, defaultValue) {
            if (typeof $element.data(option) != 'undefined') {
                optionValue = $element.data(option);
                style = AnimateOnScroll.getStyleProperty(option, optionValue, style);
            }
            defaultStyle = AnimateOnScroll.getStyleProperty(option, defaultValue, defaultStyle);
        });

        $element.css(style);
        defaultStyle.transition = 'all '+ speed +'ms';
        $element.defaultStyle = defaultStyle;
    },
    prepareAnimation: function($element) {
        var delay = $element.data('delay') || 0;

        if (delay > 0) {
            setTimeout(function() {
                AnimateOnScroll.runAnimation($element);
            }, delay);
            return true;
        }

        AnimateOnScroll.runAnimation($element);
    },
    runAnimation: function($element) {
        $element.css( $element.defaultStyle );
    },
    updateZindex: function() {
        return AnimateOnScroll.zindex++;
    },
    debug: function(str) {
        if (AnimateOnScroll.debug) {
            console.log(str);
        }
    }
};

$(function() {
    AnimateOnScroll.initialize($('#slidebarMainContent'));
});
