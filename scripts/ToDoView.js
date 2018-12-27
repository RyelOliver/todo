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
    'change .edit input': 'onChangeEdit',
    'blur .edit input': 'onBlurEdit',
    'click .remove': 'onClickRemove'
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.model, 'destroy', this.removed)
  },

  onClickDone: function() {
    this.model.toggle()
  },

  editing: false,
  
  onClickEdit: function(event) {
    if (this.editing) {
      return
    } else {
      this.editing = true
      this.$el.addClass('editing')
      this.$('.edit input').focus()
    }
  },

  onChangeEdit: function(event) {
    this.model.editDescription(event.target.value)
    this.onBlurEdit(event)
  },
  
  onBlurEdit: function(event) {
    if (!this.editing) {
      return
    } else {
      this.editing = false
      this.$el.removeClass('editing')
    }
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