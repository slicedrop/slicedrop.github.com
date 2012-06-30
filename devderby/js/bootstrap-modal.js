/* =========================================================
 * bootstrap-modal.js v2.0.3
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function(jQuery) {

  "use strict"; // jshint ;_;
  

  /*
   * MODAL CLASS DEFINITION ======================
   */

  var Modal = function(content, options) {

    this.options = options
    this.jQueryelement = jQuery(content).delegate('[data-dismiss="modal"]',
        'click.dismiss.modal', jQuery.proxy(this.hide, this))
  }

  Modal.prototype = {
    
    constructor: Modal

    ,
    toggle: function() {

      return this[!this.isShown ? 'show' : 'hide']()
    }

    ,
    show: function() {

      var that = this, e = jQuery.Event('show')

      this.jQueryelement.trigger(e)

      if (this.isShown || e.isDefaultPrevented()) {
        return

        

                

        

                        

        

                

        

      }
      jQuery('body').addClass('modal-open')

      this.isShown = true

      escape.call(this)
      backdrop.call(this, function() {

        var transition = jQuery.support.transition &&
            that.jQueryelement.hasClass('fade')

        if (!that.jQueryelement.parent().length) {
          that.jQueryelement.appendTo(document.body) // don't move modals dom
          // position
        }
        
        that.jQueryelement.show()

        if (transition) {
          that.jQueryelement[0].offsetWidth // force reflow
        }
        
        that.jQueryelement.addClass('in')

        transition ? that.jQueryelement.one(jQuery.support.transition.end,
            function() {

              that.jQueryelement.trigger('shown')
            }) : that.jQueryelement.trigger('shown')

      })
    }

    ,
    hide: function(e) {

      e && e.preventDefault()

      var that = this

      e = jQuery.Event('hide')

      this.jQueryelement.trigger(e)

      if (!this.isShown || e.isDefaultPrevented()) {
        return

        

                

        

                        

        

                

        

      }
      this.isShown = false

      jQuery('body').removeClass('modal-open')

      escape.call(this)

      this.jQueryelement.removeClass('in')

      jQuery.support.transition && this.jQueryelement.hasClass('fade') ? hideWithTransition
          .call(this)
          : hideModal.call(this)
    }
  
  }


  /*
   * MODAL PRIVATE METHODS =====================
   */

  function hideWithTransition() {

    var that = this, timeout = setTimeout(function() {

      that.jQueryelement.off(jQuery.support.transition.end)
      hideModal.call(that)
    }, 500)

    this.jQueryelement.one(jQuery.support.transition.end, function() {

      clearTimeout(timeout)
      hideModal.call(that)
    })
  }
  
  function hideModal(that) {

    this.jQueryelement.hide().trigger('hidden')

    backdrop.call(this)
  }
  
  function backdrop(callback) {

    var that = this, animate = this.jQueryelement.hasClass('fade') ? 'fade'
        : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = jQuery.support.transition && animate

      this.jQuerybackdrop = jQuery(
          '<div class="modal-backdrop ' + animate + '" />').appendTo(
          document.body)

      if (this.options.backdrop != 'static') {
        this.jQuerybackdrop.click(jQuery.proxy(this.hide, this))
      }
      
      if (doAnimate) {
        this.jQuerybackdrop[0].offsetWidth // force reflow
      }
      
      this.jQuerybackdrop.addClass('in')

      doAnimate ? this.jQuerybackdrop.one(jQuery.support.transition.end,
          callback) : callback()

    } else if (!this.isShown && this.jQuerybackdrop) {
      this.jQuerybackdrop.removeClass('in')

      jQuery.support.transition && this.jQueryelement.hasClass('fade') ? this.jQuerybackdrop
          .one(jQuery.support.transition.end, jQuery
              .proxy(removeBackdrop, this))
          : removeBackdrop.call(this)

    } else if (callback) {
      callback()
    }
  }
  
  function removeBackdrop() {

    this.jQuerybackdrop.remove()
    this.jQuerybackdrop = null
  }
  
  function escape() {

    var that = this
    if (this.isShown && this.options.keyboard) {
      jQuery(document).on('keyup.dismiss.modal', function(e) {

        e.which == 27 && that.hide()
      })
    } else if (!this.isShown) {
      jQuery(document).off('keyup.dismiss.modal')
    }
  }
  

  /*
   * MODAL PLUGIN DEFINITION =======================
   */

  jQuery.fn.modal = function(option) {

    return this
        .each(function() {

          var jQuerythis = jQuery(this), data = jQuerythis.data('modal'), options = jQuery
              .extend({}, jQuery.fn.modal.defaults, jQuerythis.data(),
                  typeof option == 'object' && option)
          if (!data) {
            jQuerythis.data('modal', (data = new Modal(this, options)))
          }
          if (typeof option == 'string') {
            data[option]()
          } else if (options.show) {
            data.show()
          }
        })
  }

  jQuery.fn.modal.defaults = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  jQuery.fn.modal.Constructor = Modal


  /*
   * MODAL DATA-API ==============
   */

  jQuery(function() {

    jQuery('body').on(
        'click.modal.data-api',
        '[data-toggle="modal"]',
        function(e) {

          var jQuerythis = jQuery(this), href, jQuerytarget = jQuery(jQuerythis
              .attr('data-target') ||
              (href = jQuerythis.attr('href')) &&
              href.replace(/.*(?=#[^\s]+jQuery)/, '')) // strip
          // for
          // ie7
          , option = jQuerytarget.data('modal') ? 'toggle' : jQuery.extend({},
              jQuerytarget.data(), jQuerythis.data())

          e.preventDefault()
          jQuerytarget.modal(option)
        })
  })

}(window.jQuery);
