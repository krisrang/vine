require 'sidekiq/web'
require 'sidetiq/web'

require_dependency 'admin_constraint'

USERNAME_ROUTE_FORMAT = /[A-Za-z0-9\_]+/ unless defined? USERNAME_ROUTE_FORMAT

Vine::Application.routes.draw do
  mount Sidekiq::Web => '/sidekiq', constraints: AdminConstraint.new

  match "/404", to: "exceptions#not_found", via: [:get, :post]

  resources :session, id: USERNAME_ROUTE_FORMAT, only: [:create, :destroy] do
    collection do
      post 'forgot_password'
    end
  end

  get 'session/csrf' => 'session#csrf'

  resources :users, except: [:show, :update] do
    collection do
      get 'check_username'
    end
  end

  get 'users/password-reset/:token' => 'users#password_reset'
  put 'users/password-reset/:token' => 'users#password_reset'
  get 'users/activate-account/:token' => 'users#activate_account'
  get 'users/authorize-email/:token' => 'users#authorize_email'
  get 'users/hp' => 'users#get_honeypot_value'

  get 'users/:username' => 'users#show', constraints: {username: USERNAME_ROUTE_FORMAT}
  get 'users/:username' => 'users#show', constraints: {username: USERNAME_ROUTE_FORMAT}
  get 'users/:username/preferences' => 'users#preferences', constraints: {username: USERNAME_ROUTE_FORMAT}
  get 'users/:username/activity' => 'users#show', constraints: {username: USERNAME_ROUTE_FORMAT}

  post 'users/:username/send_activation_email' => 'users#send_activation_email', constraints: {username: USERNAME_ROUTE_FORMAT}

  match "/auth/:provider/callback", to: "users/omniauth_callbacks#complete", via: [:get, :post]
  match "/auth/failure", to: "users/omniauth_callbacks#failure", via: [:get, :post]

  get 'uploads/:sha.:extension' => 'uploads#show', constraints: {sha: /[a-z0-9]{15,16}/i, extension: /\w{2,}/}, as: :upload
  post 'uploads' => 'uploads#create'

  get 'onebox' => 'onebox#show'

  resources :messages
  resources :media
  resource :drafts

  resources :static
  post 'login' => 'static#enter'
  get 'login' => 'static#show', id: 'login'

  root 'messages#index'
end
