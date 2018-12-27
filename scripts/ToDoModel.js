const Backbone = require('backbone')

const ToDoModel = Backbone.Model.extend({
  defaults: {
    'done': false
  },

  toggle: function () {
    this.set('done', !this.get('done'))
  },

  editDescription: function (description) {
    this.set('description', description)
  },

  validate: function (attributes) {
    const { id, description, done, order } = attributes

    if (id === undefined) {
      throw Error('ID is required.')
    }
    if (description === undefined || description.trim() === '') {
      throw Error('Description is required.')
    }
    if (done === undefined) {
      throw Error('Done is required.')
    }
    if (order === undefined) {
      throw Error('Order is required.')
    }
  }
})

module.exports = ToDoModel