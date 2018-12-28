const Backbone = require('backbone')

const ToDoPlaceholderView = Backbone.View.extend({
  tagName: 'li',
  className: 'placeholder',

  initialize: function (props) {
    this.props = props
  },

  render: function () {
    const { description, done } = this.props
    this.$el.html(`
      <div class="view">
        <input type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
    `)
    
    if (done) {
      this.$el.addClass('done')
    } else {    
      this.$el.removeClass('done')
    }

    return this
  }
})

module.exports = ToDoPlaceholderView