const Backbone = require('backbone')

const IconView = Backbone.View.extend({
  tagName: 'i',
  className: 'material-icon',

  initialize: function (props) {
    this.props = props
  },

  render: function () {
    const { classes, code, toolTip } = this.props
    this.$el.html(`
      ${code}
      <div class="tool-tip">
        <span>${toolTip ? toolTip : 'Add a tip for the icon'}</span>
      </div>
    `)
    this.$el.addClass(classes)
    return this
  }
})

module.exports = IconView