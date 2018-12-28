const Backbone = require('backbone')

const IconView = require('./IconView')

const ToDoView = Backbone.View.extend({
  tagName: 'li',
  className: 'to-do',
  attributes: {
    draggable: true
  },
  
  events: {
    'click .view input': 'onClickDone',
    'click .view label': 'onClickEdit',
    'focus .edit input': 'onFocusEdit',
    'change .edit input': 'onChangeEdit',
    'blur .edit input': 'onBlurEdit',
    'click .remove': 'onClickRemove'
  },

  editing: false,
  setEditing: function (editing) {
    if (this.editing !== editing) {
      this.editing = !this.editing
      if (editing) {
        this.$el.addClass('editing')
      } else {
        this.$el.removeClass('editing')
      }
    }
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.model, 'destroy', this.removed)
  },

  onClickDone: function() {
    this.model.toggle()
  },

  onClickEdit: function(event) {
    this.setEditing(true)
    this.$('.edit input').focus()
  },

  onFocusEdit: function(event) {
    this.setEditing(true)
  },

  onChangeEdit: function(event) {
    this.model.editDescription(event.target.value)
    this.setEditing(false)
  },
  
  onBlurEdit: function(event) {
    this.setEditing(false)
  },

  onClickRemove: function() {
    this.model.trigger('destroy', this.model)
  },

  removed: function() {
    this.remove()
  },

  render: function () {
    const id = this.model.get('id')
    const description = this.model.escape('description')
    const done = this.model.get('done')

    this.$el.html(`
      <div class="view">
        <input id="toDo${id}Done" type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
      <div class="edit">
        <input id="toDo${id}Description" type="text" value="${description}">
      </div>
    `)

    if (done) {
      this.$el.addClass('done')
    } else {    
      this.$el.removeClass('done')
    }

    const removeIcon = new IconView({
      classes: 'remove',
      code: 'clear',
      toolTip: 'Delete the item'
    })
    this.$('.view').append(removeIcon.render().el)

    return this
  }
})

module.exports = ToDoView