# Include hook code here

load_paths.each do |path|
  ActiveSupport::Dependencies.load_once_paths.delete(path)
  ActiveSupport::Dependencies.load_once_paths << File.join(File.dirname(__FILE__), "lib")
end if config.environment == 'development'

# Load JsonObject
require 'json/add/core'
require File.join(File.dirname(__FILE__), "lib", "jsonobject")

begin
  require 'nine_auth_engine'
rescue Exception => e
  puts "\033[31m"
  puts "VRAME requires NineAuthEngine. Install it via:"
  puts "\033[36m"
  puts "git submodule add git://github.com/sebastiandeutsch/nine_auth_engine.git vendor/plugins/nine_auth_engine"
  puts ""
  puts "or"
  puts ""
  puts "script/plugin install git://github.com/sebastiandeutsch/nine_auth_engine.git"
  puts ""
  puts "\033[0m"
  raise "VRAME Bootstrap Error"
end

config.gem 'acts_as_tree'
config.gem 'authlogic'
config.gem 'will_paginate'
config.gem 'mini_magick'
config.gem 'paperclip', :version => '~>2.3.1'
config.gem 'friendly_id'
config.gem 'daemons'

$:.unshift "#{File.dirname(__FILE__)}/lib"
require 'active_record/acts/list'
ActiveRecord::Base.class_eval { include ActiveRecord::Acts::List }

config.to_prepare do
  # Use JSON gem as ActiveSupport::JSON backend
  ActiveSupport::JSON.backend = 'JSONGem'
  
  # Include VrameHelper
  ApplicationController.helper(VrameHelper)
  
  # Include Vrame::Base into ApplicationController
  ApplicationController.class_eval do
    include(Vrame::Base)
  end
  
  # Configure nine_auth_engine
  NineAuthEngine.configure do |config|
    config.after_signup_redirect = '/signin/'
    config.after_signin_redirect = '/vrame/'
    config.after_signout_redirect = '/signin/'
    config.after_password_reset_redirect = '/signin/'
    config.after_password_update_redirect = '/vrame/'
    config.after_signup_disabled_redirect = '/signin/'
    config.backend_namespace = 'vrame'
    config.disable_signup = true
    config.layout("vrame")
  end
end


if (RUBY_PLATFORM =~ /mswin32/ || Process.uid != 0)
  VRAME_ASSETS = File.join(File.dirname(__FILE__), 'public', 'vrame')
  VRAME_PUB    = File.join(RAILS_ROOT, 'public', 'vrame')
  FileUtils.rmtree VRAME_PUB if File.exist?(VRAME_PUB)
  FileUtils.cp_r(VRAME_ASSETS, VRAME_PUB)
end