React = require 'react'


Login = React.createClass
  displayName : "Login"

  getInitialState:->
    error: null

  getDefaultProps: ->
    user: null
    loginProviders: []

  render:->
    <div className='login'>
      {@renderLoggedIn() if @props.user?.name? && ! @props.user.guest }
      {@renderLoggedInAsGuest() if @props.user && @props.user.guest }
      {@renderLoginOptions("Se connecter :","login-container") if !@props.user }
    </div>

  signOut:(e)->
    e.preventDefault()

    request = $.ajax
      url: '/users/sign_out'
      method: 'delete'
      dataType: "json"

    request.done =>
      @props.onLogout()

    request.error (request,error)=>
      @setState
        error : "Could not log out"


  renderLoggedInAsGuest: ->
    <span >
      { @renderLoginOptions('Connectez-vous pour enregistrer votre travail:',"login-container") }
    </span>

  renderLoggedIn:->
    <span className={"login-container"}>
      { if @props.user.avatar
          <img src="#{@props.user.avatar}" />
      }
      <span className="label">Bonjour {@props.user.name} </span><a className="logout" onClick={@signOut} >Se déconnecter</a>
    </span>


  renderLoginOptions: (label,classNames) ->
    links = @props.loginProviders.map (link) ->
      icon_id = if link.id == 'zooniverse' then 'dot-circle-o' else link.id
      <a key="login-link-#{link.id}" href={link.path} title="Connectez vous en utilisant #{link.name}"><i className="fa fa-#{icon_id} fa-2" /></a>

    <span className={classNames}>
      <span className="label">{ label || "Se connecter :" }</span>
      <div className='options'>
        { links }
      </div>
    </span>


module.exports = Login
