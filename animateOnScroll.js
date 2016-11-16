var AnimateOnScroll = {
    active: false,
    window: null,
    elements: [],
    offsets: [],
    windowHeight: 0,
    windowInnerHeight: 0,
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

        var $window = $(window);
        AnimateOnScroll.window = $window;
        AnimateOnScroll.windowHeight = $window.height();
        AnimateOnScroll.windowInnerHeight = $window.innerHeight();

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
        if (AnimateOnScroll.setElements()) {
            AnimateOnScroll.listenForScroll();
        }
        $(document).trigger('AnimateOnScrollInitialized');
    },
    setElements: function() {
        var $elements = $('.animateOnScroll');
        var elementLength = $elements.length;
        if (elementLength > 0) {
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
                } else {
                    AnimateOnScroll.setAnimatedClass($element);
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
        var elementLength = AnimateOnScroll.offsets.length;
        ScrollHandler.onScroll(function($this) {
            var currentScroll = $this.scrollTop();
            var collision = currentScroll + AnimateOnScroll.windowHeight;
            var $element;
            var offset = 0;
            for (i = 0; i < elementLength; i++) {
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

        var options = AnimateOnScroll.options;
        var style = {};
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
        AnimateOnScroll.setAnimatedClass($element);
    },
    prepareAnimation: function($element) {
        var delay = $element.data('delay') || 0;
        var noDelayBelow = $element.data('nodelaybelow') || 0;
            noDelayBelow = parseInt(noDelayBelow);
        var windowWidth = AnimateOnScroll.window.width();

        if (delay > 0 && (noDelayBelow == 0 || windowWidth > noDelayBelow)) {
            setTimeout(function() {
                AnimateOnScroll.runAnimation($element);
            }, delay);
            return true;
        }

        AnimateOnScroll.runAnimation($element);
    },
    runAnimation: function($element) {
        $.extend($element.defaultStyle, {'z-index': AnimateOnScroll.updateZindex()})
        $element.css( $element.defaultStyle ).addClass('animateOnScrollCompleted');
    },
    setAnimatedClass: function($element) {
        $element.addClass('animateOnScrollAnimated');
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
