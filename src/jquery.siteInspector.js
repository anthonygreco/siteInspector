'use strict';
(function($) {

  function Inspector(elem, options) {
    var element = elem,
    $element = $(elem),
    inspectionEnabled = false,
    isFrozen = false,
    inspectionTarget = null,
    settings = $.extend({}, $.fn.siteInspector.defaults, options);

    function hook(method) {
      if(settings[method] !== undefined) {
        settings[method].call(element);
      } else {
        throw new Error('Hook ' +  method + ' does not exist on jQuery.siteInspector');
      }
    }

    function debugLog(msg) {
      console.log('jquery.siteInspector LOG: ' + msg);
    }

    function appendCSS() {
      if(settings.debug) {
        debugLog('Appending CSS');
      }
      var ext = (settings.debug && settings.cssPath === false)? '.css' : '.min.css',
      cssPath = (settings.cssPath)? settings.cssPath : '/css/jquery-siteInspector' + ext;
      $('head').append('<link rel="stylesheet" href="' + cssPath + '" />');
    }

    function formatTagInfo() {
      var $inspectionTarget = $(inspectionTarget);
      return [
        $('<span />', { class: 'ui inspector node'}).html(inspectionTarget.nodeName.toLowerCase()), // node name
        ($inspectionTarget.attr('id') !== undefined)? $('<span />', { class: 'ui inspector id'}).html('#' + $inspectionTarget.attr('id')) : '', // id
        (inspectionTarget.className !== '')? $('<span />', { class: 'ui inspector className'}).html('.' + inspectionTarget.className.split(' ').join('.')) : '', // classes
        $('<span />', { class: 'ui inspector dimensions x'}).html($inspectionTarget.outerWidth() + 'px'), // dimension x
        $('<i />', { class: 'ui inspector glyphicon glyphicon-remove'}), // x
        $('<span />', { class: 'ui inspector dimensions y'}).html($inspectionTarget.outerHeight() + 'px') // dimension y
      ];
    }

    function showTags() {
      var elementInfo = {
        offset: $(inspectionTarget).offset(),
        height: $(inspectionTarget).outerHeight()
      },
      uniqueSelector = $(inspectionTarget).uniqueSelector(),
      $tag = $('.tag');
      if($tag.data('selector') === uniqueSelector) {
        return false;
      }
      $tag.hide().data('selector', uniqueSelector).empty().append(formatTagInfo()).css({
        top: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.top + elementInfo.height,
        left: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.left,
        position: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 'fixed' : 'absolute'
      }).show();
    }

    function highlightElement(target) {
      var $currentElement = (target === undefined)? $(inspectionTarget) : $(target);
      if($currentElement.offset() !== undefined) {
        if(settings.showTags) {
          showTags();
        }
        var trbl = {
          top: $currentElement.offset().top - $(window).scrollTop(),
          left: $currentElement.offset().left,
          bottom: ($currentElement.offset().top - $(window).scrollTop()) + $currentElement.height(),
          right: $currentElement.offset().left + $currentElement.width()
        },
        covers = [
          {// top
            top: 0,
            left: 0,
            width: (trbl.left === 0)? 0 : '100%',
            height: (trbl.top === 0)? 0 : trbl.top
          },
          {// left
            top: trbl.top,
            left: 0,
            width: trbl.left,
            height: $(window).height() - trbl.top
          },
          {// bottom
            top: trbl.top + $currentElement.outerHeight(),
            left: trbl.left,
            width: $(window).width() - trbl.left,
            height: $(window).height() - trbl.bottom
          },
          {// right
            top: trbl.top,
            left: trbl.left + $currentElement.outerWidth(),
            width: $(window).width() - (trbl.left + $currentElement.outerWidth()),
            height: $currentElement.outerHeight()
          }
        ];
        $('.cover').each(function(index) {
          $(this).css(covers[index]);
        });
      }
    }

    function refreshDisplay() {
      if(inspectionEnabled) {
        highlightElement();
      }
    }

    function bindWindowEvents() {
      if(settings.debug) {
        debugLog('Binding Window Events');
      }
      $(window).on({
        'scroll.siteInspector.window': function() {
          refreshDisplay();
        },
        'resize.siteInspector.window': function() {
          refreshDisplay();
        }
      });
    }

    function bindLeave() {
      if(settings.debug) {
        debugLog('Binding Leave Event');
      }
      window.onbeforeunload = function() {
        if(inspectionEnabled) {
          return 'INSPECTION IS CURRENTLY ENABLED!';
        }
      };
    }

    function unhighlightElement() {
      inspectionTarget = null;
      $('.cover').css({ width: 0, height: 0 });
    }

    function toggleInspection() {
      inspectionEnabled = !inspectionEnabled;
      if(settings.debug) {
        debugLog('Toggling Inspection. Enabled? ' + inspectionEnabled);
      }
      if(inspectionEnabled) {
        $(element).css('cursor', 'cell');
        $('#uiWrapper #inspect i').addClass('active');
        $(element).find('*:not(.ui)').on({
          'mouseenter.siteInspector.inspection': function(e) {
            if(!isFrozen) {
              inspectionTarget = e.currentTarget;
              highlightElement();
            }
          }
        });
      } else {
        if(!isFrozen) {
          $(element).css('cursor', 'default');
          $('#uiWrapper #inspect i').removeClass('active');
          $(element).find('*:not(.ui)').off('mouseenter.siteInspector.inspection');
          unhighlightElement();
          if(settings.showTags) {
            $('.tag').remove();
          }
        }
      }
    }

    function bindInspection() {
      if(settings.debug) {
        debugLog('Binding Inspection Button Event');
      }
      return {
        'click.siteInspector.inspectionButton': function() {
          toggleInspection();
        },
        'mouseenter.siteInspector.inspectionButton': function() {
          if(!inspectionEnabled) {
            $(this).find('i').addClass('active');
          }
        },
        'mouseleave.siteInspector.inspectionButton': function() {
          if(!inspectionEnabled) {
            $(this).find('i').removeClass('active');
          }
        }
      };
    }

    function buildUI() {
      if(settings.debug) {
        debugLog('Building UI');
      }
      var $cover = $('<div />', { class: 'cover ui inspector' }),
      $overlay = $('<div />', { id: 'overlay', class: 'ui inspector' }).append([$cover.clone(), $cover.clone(), $cover.clone(), $cover.clone()]),
      $inspectButton = $('<div />', { id: 'inspect', class: 'ui inspector' }).on(bindInspection()).append($('<i />', { class: 'glyphicon glyphicon-search ui inspector' })),
      $uiBox = $('<div />', { id: 'uiWrapper', class: 'ui inspector' }).append($inspectButton),
      $tag = $('<div />', { class: 'tag ui inspector' });
      $('body').append([$uiBox, $overlay, $tag]);
      bindWindowEvents();
      bindLeave();
    }

    function init() {
      if(settings.debug) {
        console.time('jquery.siteInspector Init');
      }
      appendCSS();
      buildUI();
      hook('onInit');
      if(settings.debug) {
        console.timeEnd('jquery.siteInspector Init');
      }
    }

    function unbindWindowEvents() {
      if(settings.debug) {
        debugLog('Unbinding Window Events');
      }
      $(window).off('scroll.siteInspector.window resize.siteInspector.window');
    }

    function unbindInspection() {
      if(settings.debug) {
        debugLog('Unbinding Inspection Button Event');
      }
      $('#inspect').off('click.siteInspector.inspectionButton mouseenter.siteInspector.inspectionButton mouseleave.siteInspector.inspectionButton');
      $(element).find('*:not(.ui)').off('mouseenter.siteInspector.inspection');
      $(element).css('cursor', 'default');
    }

    function unbindLeave() {
      if(settings.debug) {
        debugLog('Unbinding Leave Event');
      }
      window.onbeforeunload = null;
    }

    function destroy() {
      if(settings.debug) {
        debugLog('Destroying Plugin');
      }
      $element.each(function() {
        unbindWindowEvents();
        unbindInspection();
        unbindLeave();
        $(this).find('.ui.inspector').remove();
        hook('onDestroy');
        $(this).removeData('siteInspector');
      });
    }

    function option(key, val) {
      if(val) {
        if(settings.debug) {
          debugLog('Setting option for ' + key + ' to ' + val);
        }
        settings[key] = val;
      } else {
        if(settings.debug) {
          debugLog('Returning option for ' + key + ' as ' + settings[key]);
        }
        return settings[key];
      }
    }

    // Public Methods
    function isEnabled() {
      return inspectionEnabled;
    }

    function toggleFrozen() {
      isFrozen = !isFrozen;
      if(settings.debug) {
        debugLog('Toggling Frozen. Frozen? ' + isFrozen);
      }
      return isFrozen;
    }

    init();

    // Expose public methods
    return {
      option: option,
      destroy: destroy,
      isEnabled: isEnabled,
      toggleFrozen: toggleFrozen
    };
  }

  $.fn.siteInspector = function(options) {
    if(typeof arguments[0] === 'string') {
      var methodName = arguments[0],
      args = Array.prototype.slice.call(arguments, 1),
      returnVal;
      this.each(function() {
        if($.data(this, 'siteInspector') && typeof $.data(this, 'siteInspector')[methodName] === 'function') {
          returnVal = $.data(this, 'siteInspector')[methodName].apply(this, args);
        } else {
          throw new Error('Method ' +  methodName + ' does not exist on jQuery.siteInspector');
        }
      });
      return (returnVal !== undefined)? returnVal : this;
    } else if(typeof options === 'object' || !options) {
      return this.each(function() {
        if(!$.data(this, 'siteInspector')) {
          $.data(this, 'siteInspector', new Inspector(this, options));
        }
      });
    }
  };

  $.fn.siteInspector.defaults = {
    debug: false,
    showTags: false,
    cssPath: false,
    fontAwesomePath: false,
    onInit: function() {},
    onDestroy: function() {}
  };

})(jQuery);