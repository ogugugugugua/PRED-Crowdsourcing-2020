React         = require 'react'
SmallButton   = require './small-button'

module.exports = React.createClass
  displayName: 'HelpButton'

  getDefaultProps: ->
    label: 'Besoin d\'aide?' 
    key: 'help-button'
 
  render: ->
    classes = ['help-button','ghost']
    classes.push @props.className if @props.className?

    <SmallButton {...@props} className={classes.join ' '} />
