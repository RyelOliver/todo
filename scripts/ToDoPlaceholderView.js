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
      <div class="${done ? 'view done' : 'view'}">
        <input type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
    `)
    return this
  }
})

module.exports = ToDoPlaceholderView