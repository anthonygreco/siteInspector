'use strict';
(function($) {

  function Inspector(elem, options) {
    var element = elem,
    $element = $(elem),
    inspectionEnabled = false,
    isFrozen = false,
    inspectionTarget = null,
    settings = $.extend({}, $.fn.siteInspector.defaults, options);

    function init() {
      if(settings.debug) {
        console.time('Init');
      }
      appendCSS();
      buildUI();
      hook('onInit');
      if(settings.debug) {
        console.timeEnd('Init');
      }
    }

    function destroy() {
      if(settings.debug) {
        console.log('Destroying Plugin');
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
          console.log('Setting option for ' + key + ' to ' + val);
        }
        settings[key] = val;
      } else {
        if(settings.debug) {
          console.log('Returning option for ' + key + ' as ' + settings[key]);
        }
        return settings[key];
      }
    }

    function hook(method) {
      if(settings[method] !== undefined) {
        settings[method].call(element);
      } else {
        throw new Error('Hook ' +  method + ' does not exist on jQuery.siteInspector');
      }
    }

    function appendCSS() {
      if(settings.debug) {
        console.log('Appending CSS');
      }
      
      var cssFile = (settings.cssFile)? settings.cssFile : (settings.debug)? '../css/jquery-siteInspector.css' : '../css/jquery-siteInspector.min.css';
      $('head').append('<link rel="stylesheet" href="../components/font-awesome/css/font-awesome.css" /><link rel="stylesheet" href="' + cssFile + '" />');
    }

    function buildUI() {
      if(settings.debug) {
        console.log('Building UI');
      }
      var $cover = $('<div />', { class: 'cover ui inspector' }),
      $overlay = $('<div />', { id: 'overlay', class: 'ui inspector' }).append([$cover.clone(), $cover.clone(), $cover.clone(), $cover.clone()]),
      $inspectButton = $('<div />', { id: 'inspect', class: 'ui inspector' }).on(bindInspection()).append($('<i />', { class: 'fa fa-search ui inspector' })),
      $uiBox = $('<div />', { id: 'uiWrapper', class: 'ui inspector' }).append($inspectButton),
      $tag = $('<div />', { class: 'tag ui inspector' });
      $('body').append([$uiBox, $overlay, $tag]);
      bindWindowEvents();
      bindLeave();
    }

    function bindWindowEvents() {
      if(settings.debug) {
        console.log('Binding Window Events');
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

    function unbindWindowEvents() {
      if(settings.debug) {
        console.log('Unbinding Window Events');
      }
      $(window).off('scroll.siteInspector.window resize.siteInspector.window');
    }

    function bindLeave() {
      if(settings.debug) {
        console.log('Binding Leave Event');
      }
      window.onbeforeunload = function() {
        if(inspectionEnabled) {
          return 'INSPECTION IS CURRENTLY ENABLED!';
        }
      };
    }

    function unbindLeave() {
      if(settings.debug) {
        console.log('Unbinding Leave Event');
      }
      window.onbeforeunload = null;
    }

    function bindInspection() {
      if(settings.debug) {
        console.log('Binding Inspection Button Event');
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

    function unbindInspection() {
      if(settings.debug) {
        console.log('Unbinding Inspection Button Event');
      }
      $('#inspect').off('click.siteInspector.inspectionButton mouseenter.siteInspector.inspectionButton mouseleave.siteInspector.inspectionButton');
      $(element).find('*:not(.ui)').off('mouseenter.siteInspector.inspection');
      $(element).css('cursor', 'default');
    }

    function toggleInspection() {
      inspectionEnabled = !inspectionEnabled;
      if(settings.debug) {
        console.log('Toggling Inspection. Enabled?', inspectionEnabled);
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

    function refreshDisplay() {
      if(inspectionEnabled) {
        highlightElement();
      }
    }

    function unhighlightElement() {
      inspectionTarget = null;
      $('.cover').css({ width: 0, height: 0 });
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
      $tag.hide().data('selector', uniqueSelector).html(formatTagInfo()).css({
        top: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.top + elementInfo.height,
        left: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.left,
        position: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 'fixed' : 'absolute'
      }).show();
    }

    function formatTagInfo() {
      var nodeName = '<span class="ui inspector node">' + inspectionTarget.nodeName.toLowerCase() + '</span>',
      $inspectionTarget = $(inspectionTarget),
      id = ($inspectionTarget.attr('id') !== undefined)? '<span class="ui inspector id">#' + $inspectionTarget.attr('id') + '</span>' : '',
      className = (inspectionTarget.className !== '')? '<span class="ui inspector className">.' + inspectionTarget.className.split(' ').join('.') + '</span>' : '';
      return nodeName + id + className + ' <span class="ui inspector dimensions">' + $inspectionTarget.outerWidth() + 'px <i class="ui inspector fa fa-times" /> ' + $inspectionTarget.outerHeight() + 'px</span>';
    }

    // Public Methods
    function isEnabled() {
      return inspectionEnabled;
    }

    function toggleFrozen() {
      isFrozen = !isFrozen;
      if(settings.debug) {
        console.log('Toggling Frozen. Frozen?', isFrozen);
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
    cssFile: false,
    onInit: function() {},
    onDestroy: function() {}
  };

})(jQuery);