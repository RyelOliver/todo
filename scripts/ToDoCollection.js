const Backbone = require('backbone')

const ToDoModel = require('./ToDoModel')

// [TODO] Sync with local storage
// Use an existing library? Nah ...
const ToDoCollection = Backbone.Collection.extend({
  model: ToDoModel,
  comparator: 'order',

  nextId: function () {
    return this.length ? this.reduce((maxId, toDo) => {
      const id = toDo.get('id')
      return id > maxId ? id : maxId
    }, 1) + 1 : 1
  }
})

module.exports = ToDoCollection