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
        console.time('init');
      }
      buildUI();
      hook('onInit');
      if(settings.debug) {
        console.timeEnd('init');
      }
    }

    function destroy() {
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
        options[key] = val;
      } else {
        return options[key];
      }
    }

    function hook(method) {
      if(options[method] !== undefined) {
        options[method].call(element);
      }
    }

    function buildUI() {
      var $cover = $('<div />', { class: 'cover ui inspector' }),
      $overlay = $('<div />', { id: 'overlay', class: 'ui inspector' }).append([$cover.clone(), $cover.clone(), $cover.clone(), $cover.clone()]),
      $inspectButton = $('<div />', { id: 'inspect', class: 'ui inspector' }).on(bindInspection()).append($('<i />', { class: 'fa fa-search ui inspector' })),
      $uiBox = $('<div />', { id: 'uiWrapper', class: 'ui inspector' }).append($inspectButton);
      $('body').append([$uiBox, $overlay]);
      bindWindowEvents();
      bindLeave();
    }

    function bindWindowEvents() {
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
      $(window).off('scroll.siteInspector.window resize.siteInspector.window');
    }

    function bindLeave() {
      window.onbeforeunload = function() {
        if(inspectionEnabled) {
          return 'INSPECTION IS CURRENTLY ENABLED!';
        }
      };
    }

    function unbindLeave() {
      window.onbeforeunload = null;
    }

    function bindInspection() {
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
      $('#inspect').off('click.siteInspector.inspectionButton mouseenter.siteInspector.inspectionButton mouseleave.siteInspector.inspectionButton');
      $(element).find('*:not(.ui)').off('mouseenter.siteInspector.inspection');
      $(element).css('cursor', 'default');
    }

    function toggleInspection() {
      inspectionEnabled = !inspectionEnabled;
      if(settings.debug) {
        console.log('InspectionEnabled?', inspectionEnabled);
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
      };
      if($('.tag').length) { // move to buildUI
        if($('.tag').data('selector') === $(inspectionTarget).uniqueSelector()) {
          return false;
        }
        $('.tag').remove();
      }
      var $tag = $('<div />', { class: 'tag ui inspector' }).data('selector', $(inspectionTarget).uniqueSelector()).html(formatTagInfo()).appendTo(element);
      $tag.css({
        top: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.top + elementInfo.height,
        left: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.left,
        position: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 'fixed' : 'absolute'
      }).show();
    }

    function formatTagInfo() {
      var nodeName = '<span class="ui inspector node">' + inspectionTarget.nodeName.toLowerCase() + '</span>',
      id = ($(inspectionTarget).attr('id') !== undefined)? '<span class="ui inspector id">#' + $(inspectionTarget).attr('id') + '</span>' : '',
      className = (inspectionTarget.className !== '')? '<span class="ui inspector className">.' + inspectionTarget.className.split(' ').join('.') + '</span>' : '';
      return nodeName + id + className + ' <span class="ui inspector dimensions">' + $(inspectionTarget).outerWidth() + 'px <i class="ui inspector fa fa-times" /> ' + $(inspectionTarget).outerHeight() + 'px</span>';
    }

    // Public Methods
    function isEnabled() {
      return inspectionEnabled;
    }

    function toggleFrozen() {
      isFrozen = !isFrozen;
      if(settings.debug) {
        console.log('Inspection is Frozen', isFrozen);
      }
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
    onInit: function() {},
    onDestroy: function() {}
  };

})(jQuery);