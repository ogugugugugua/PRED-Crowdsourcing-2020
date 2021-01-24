React             = require 'react'
TextTool          = require '../text-tool'

PickOneTagTool = React.createClass
  displayName: 'PickOneTagTool'

  render: ->
    # Everything about a textarea-tool is identical in text-tool, so let's parameterize text-tool
    <TextTool {...@props} inputType='pick-one-tag'/>

module.exports = PickOneTagTool
