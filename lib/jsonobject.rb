# JsonSchema
# class JsonSchema
#   attr_accessor :name, :type, :uid
#   
#   
# end

# JsonObject
module JsonObject
  class JsonItem < HashWithIndifferentAccess # Hash
    attr_accessor :schema
    
    def initialize(hash, schema)
      self.schema = schema
      super(hash)
    end
    
    def try(name)
      if self[name]
        self[name]
      else
        ""
      end
    end
    
    def type
      if self[:type]
        self[:type]
      else
        ""
      end
    end
    
    def method_missing(method_name, *args) 
      if self.schema
        self.schema.each do |i|
          return self[i['uid']] if method_name.to_s == i['name']
        end
      end
      
      self[method_name.to_sym]
    end
  end
  
  def self.included(mod)
    mod.extend(ClassMethods)
  end 
  
  module SingletonMethods
  end
  
  module InstanceMethods
  end
  
  module ClassMethods
    def has_json_object(name, options = {})
      extend JsonObject::SingletonMethods
      include JsonObject::InstanceMethods
      
      write_inheritable_attribute(:json_object_definitions, {}) if json_object_definitions.nil?
      json_object_definitions[name] = options
      
      JsonObject::InstanceMethods.send "define_method", "#{name}" do |*args|
        if self.send("#{name}_json")
          object = ActiveSupport::JSON.decode(self.send("#{name}_json"))
          
          # after_read callback
          after_read = self.class.json_object_definitions[name][:after_read]
          object = after_read.call(self, object) unless after_read.nil?
          
          # schema
          schema = self.class.json_object_definitions[name][:schema]
          if schema
            object = JsonItem.new(object, schema.call(self))
          end
          
          object
        else
          self.class.json_object_definitions[name][:default]
        end
      end
      
      JsonObject::InstanceMethods.send "define_method", "#{name}=" do |object|
        # before_serialize callback
        before_serialize = self.class.json_object_definitions[name][:before_serialize]
        object = before_serialize.call(object) unless before_serialize.nil?
        
        self.send "#{name}_json=", object.to_json
      end
    end
    
    def json_object_definitions
      read_inheritable_attribute(:json_object_definitions)
    end
  end
end
