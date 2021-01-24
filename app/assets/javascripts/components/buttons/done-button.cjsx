React         = require 'react'
GenericButton = require './generic-button'

module.exports = React.createClass
  displayName: 'DoneButton'

  getDefaultProps: ->
    label: 'Terminer'

  render: ->
    <GenericButton label={@props.label} onClick={@props.onClick} major=true className='done'/>
     
