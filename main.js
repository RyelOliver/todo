const ToDo = Backbone.Model.extend({
  defaults: {
    'done': false
  },

  toggle: function () {
    this.set('done', !this.get('done'), { validate: true })
  },

  editDescription: function (description) {
    this.set('description', description, { validate: true })
  },

  validate: function (attributes) {
    const { id, description, done } = attributes

    if (id === undefined) {
      throw Error('ID is required.')
    }
    if (description === undefined || description.trim() === '') {
      throw Error('Description is required.')
    }
    if (done === undefined) {
      throw Error('Done is required.')
    }
  }
})

const ToDoList = Backbone.Collection.extend({
  model: ToDo,

  nextId: function () {
    return this.length ? this.last().get('id') + 1 : 1
  }
})

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

const ToDoView = Backbone.View.extend({
  tagName: 'li',
  className: 'to-do',
  
  events: {
    'click .view input': 'toggle',
    'click .view label': 'startEdit',
    'change .edit input': 'edit',
    'blur .edit input': 'endEdit',
    'click .remove': 'remove'
  },

  toggle: function() {
    this.model.toggle()
  },

  editing: false,
  
  startEdit: function(event) {
    if (this.editing) {
      return
    } else {
      this.editing = true
      this.$el.addClass('editing')
      this.$('.edit input').focus()
    }
  },

  edit: function(event) {
    this.model.editDescription(event.target.value)
  },
  
  endEdit: function(event) {
    if (!this.editing) {
      return
    } else {
      this.editing = false
      this.$el.removeClass('editing')
    }
  },

  remove: function() {
    this.model.trigger('destroy', this.model)
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render)
  },

  render: function () {
    const id = this.model.get('id')
    const description = this.model.escape('description')
    const done = this.model.get('done')

    this.$el.html(`
      <div class="${done ? 'view done' : 'view'}">
        <input id="toDo${id}Done" type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
      <div class="edit">
        <input id="toDo${id}Description" type="text" value="${description}">
      </div>
    `)

    const removeIcon = new IconView({
      classes: 'remove',
      code: 'clear',
      toolTip: 'Delete the item'
    })
    this.$('.view').append(removeIcon.render().el)

    return this
  }
})

const ToDoListView = Backbone.View.extend({
  tagName: 'div',
  className: 'to-do-list',
  
  events: {
    'click .add textarea': 'startAdd',
    'keydown .add textarea': 'add',
    'blur .add textarea': 'endAdd',
    'click .all': 'toggleList',
    'click .remove-done': 'removeDone'
  },
  
  startAdd: function () {
    this.$el.addClass('adding')
  },

  add: function(event) {
    if (event.key != 'Enter' || event.target.value.trim() === '') {
      return
    }

    const toDo = new ToDo({
      id: this.collection.nextId(),
      description: event.target.value
    })
    this.collection.add(toDo)
    
    event.target.value = ''
    event.preventDefault()
  },
  
  endAdd: function (event) {
    if (event.target.value.trim() === '') {
      event.target.value = ''
    }
    this.$el.removeClass('adding')
  },
    
  added: function(toDo) {
    this.renderItem(toDo)
    this.renderSummary()
  },

  remove: function (toDo) {
    this.collection.remove(toDo)
  },

  removed: function (toDo) {
    this.renderList()
    this.renderSummary()
  },
    
  changeDone: function() {
    this.renderSummary()
  },
    
  toggleList: function() {
    const { done, total } = this.count
    const minimumToggle = done / total < 0.5
    this.collection.map((toDo) => {
      toDo.set('done', minimumToggle, { validate: true })
    })
  },
    
  removeDone: function() {
    this.collection.reset(this.collection.where({ done: false }))
  },

  initialize: function () {
    this.listenTo(this.collection, 'add', this.added)
    this.listenTo(this.collection, 'change:done', this.changeDone)
    this.listenTo(this.collection, 'remove', this.removed)
    this.listenTo(this.collection, 'reset', this.removed)
  },

  renderItem: function (toDo) {
    const toDoView = new ToDoView({
      model: toDo
    })
    this.list.append(toDoView.render().el)
  },

  renderList: function () {
    this.list.empty()
    this.collection.map((toDo) => {
      this.renderItem(toDo)
    })
  },

  renderSummary: function () {
    const done = this.collection.where({ done: true }).length
    const total = this.collection.length
    this.summary.html(`
      ${done} / ${total} items done
    `)
    this.count = {
      done,
      total
    }
  },

  render: function () {    
    this.$el.html(`
      <h3>List</h3>
      <div class="controller"></div>
      <ul>
      </ul>
      <div class="add">
        <textarea placeholder="Add an item"/>
      </div>
      <span></span>
    `)

    this.controller = this.$('.controller')
    this.list = this.$('ul')
    this.summary = this.$('span')
    
    const allIcon = new IconView({
      classes: 'all',
      code: 'playlist_add_check',
      toolTip: 'Check or uncheck all the items'
    })
    this.controller.append(allIcon.render().el)
    const removeIcon = new IconView({
      classes: 'remove-done',
      code: 'delete_sweep',
      toolTip: 'Delete all the done items'
    })
    this.controller.append(removeIcon.render().el)

    this.renderList()
    this.renderSummary()

    return this
  }
})

const toDoList = new ToDoList()
const toDoListView = new ToDoListView({
  collection: toDoList
})

document.querySelector('#toDoList').append(toDoListView.render().el)

toDoList.add([
  new ToDo({
    id: 1,
    description: 'One, two'
  }),
  new ToDo({
    id: 2,
    description: 'Skip a few'
  }),
  new ToDo({
    id: 3,
    description: 'Banana'
  })
])